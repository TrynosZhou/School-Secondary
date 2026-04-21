import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, DateSelectArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Subject, of } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { CalendarService, CalendarEvent } from '../services/calendar.service';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { EventDialogComponent } from './event-dialog.component';
import { NotificationDialogComponent } from './notification-dialog.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
    FullCalendarModule,
  ],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit, OnDestroy {
  @ViewChild('calendar') calendarComponent: any;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    events: [],
    eventDisplay: 'block',
    height: 'auto',
    eventColor: '#2196f3',
  };

  isLoading = false;
  events: CalendarEvent[] = [];
  isAdmin = false;

  private destroy$ = new Subject<void>();
  
  isAdmin$ = this.roleAccess.getCurrentRole$().pipe(
    takeUntil(this.destroy$),
    catchError(() => of(false))
  );

  constructor(
    private calendarService: CalendarService,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private roleAccess: RoleAccessService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Calendar');
    
    this.isAdmin$.subscribe(admin => {
      this.isAdmin = admin === ROLES.admin || admin === ROLES.director || admin === ROLES.dev;
      this.cdr.markForCheck();
    });

    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    // Load events for current month and surrounding months
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    this.calendarService.getEvents(startDate, endDate)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading events:', error);
          this.snackBar.open('Error loading calendar events', 'Close', { duration: 3000 });
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        })
      )
      .subscribe(events => {
        this.events = events;
        this.updateCalendarEvents();
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  updateCalendarEvents(): void {
    const calendarEvents = this.events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      allDay: event.allDay,
      backgroundColor: event.color || '#2196f3',
      borderColor: event.color || '#2196f3',
      extendedProps: {
        description: event.description,
        location: event.location,
        isPublic: event.isPublic,
        createdBy: event.createdBy,
      },
    }));

    this.calendarOptions.events = calendarEvents;
    this.cdr.markForCheck();
  }

  handleDateSelect(selectInfo: DateSelectArg): void {
    if (this.isAdmin) {
      // Calculate end date (default to 1 hour after start if same day, or end of selected range)
      let endDate = selectInfo.end;
      if (!endDate || endDate.getTime() === selectInfo.start.getTime()) {
        endDate = new Date(selectInfo.start.getTime() + 60 * 60 * 1000); // 1 hour later
      }

      const dialogRef = this.dialog.open(EventDialogComponent, {
        width: '600px',
        data: {
          mode: 'create',
          startDate: selectInfo.start,
          endDate: endDate,
          isAdmin: this.isAdmin,
        },
      });

      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
        if (result) {
          this.loadEvents();
          this.snackBar.open('Event created successfully!', 'Close', { duration: 3000 });
        }
        selectInfo.view.calendar.unselect();
      });
    } else {
      selectInfo.view.calendar.unselect();
    }
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const eventId = clickInfo.event.id;
    const event = this.events.find(e => e.id === eventId);

    if (!event) return;

    // Open event details dialog with options to edit (if admin) or set notifications
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '600px',
      data: {
        mode: this.isAdmin ? 'edit' : 'view',
        event: event,
        isAdmin: this.isAdmin,
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result === 'deleted') {
        this.loadEvents();
        this.snackBar.open('Event deleted successfully!', 'Close', { duration: 3000 });
      } else if (result === 'updated') {
        this.loadEvents();
        this.snackBar.open('Event updated successfully!', 'Close', { duration: 3000 });
      } else if (result === 'notification') {
        // Open notification dialog
        this.openNotificationDialog(event);
      }
    });
  }

  createNewEvent(): void {
    if (this.isAdmin) {
      const now = new Date();
      const endDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later

      const dialogRef = this.dialog.open(EventDialogComponent, {
        width: '600px',
        data: {
          mode: 'create',
          startDate: now,
          endDate: endDate,
          isAdmin: this.isAdmin,
        },
      });

      dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
        if (result) {
          this.loadEvents();
          this.snackBar.open('Event created successfully!', 'Close', { duration: 3000 });
        }
      });
    }
  }

  openNotificationDialog(event: CalendarEvent): void {
    const dialogRef = this.dialog.open(NotificationDialogComponent, {
      width: '500px',
      data: { event },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(result => {
      if (result) {
        this.snackBar.open('Notification preferences saved!', 'Close', { duration: 3000 });
      }
    });
  }

  onViewChange(): void {
    // Calendar view changed - events are already loaded for the visible range
    // FullCalendar will automatically request events for the new date range
  }
}

