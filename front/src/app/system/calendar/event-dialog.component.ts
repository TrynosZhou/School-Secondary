import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CalendarService,
  CalendarEvent,
  CreateCalendarEventDto,
  UpdateCalendarEventDto,
} from '../services/calendar.service';

@Component({
  selector: 'app-event-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDialogComponent implements OnInit {
  eventForm!: FormGroup;
  isEditMode = false;
  isViewMode = false;
  isAdmin = false;
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit' | 'view'; event?: CalendarEvent; startDate?: Date; endDate?: Date; isAdmin?: boolean },
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.isEditMode = data.mode === 'edit';
    this.isViewMode = data.mode === 'view';
    this.isAdmin = data.isAdmin || false;
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.data.event) {
      this.patchForm(this.data.event);
    } else if (this.data.startDate && this.data.endDate) {
      this.eventForm.patchValue({
        startDate: this.data.startDate,
        endDate: this.data.endDate,
      });
    }
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      allDay: [false],
      location: [''],
      color: ['#2196f3'],
      isPublic: [true],
    });
  }

  private patchForm(event: CalendarEvent): void {
    this.eventForm.patchValue({
      title: event.title,
      description: event.description || '',
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay,
      location: event.location || '',
      color: event.color || '#2196f3',
      isPublic: event.isPublic,
    });

    if (this.isViewMode) {
      this.eventForm.disable();
    }
  }

  onSave(): void {
    if (this.eventForm.invalid && !this.isViewMode) {
      return;
    }

    const formValue = this.eventForm.value;

    if (this.isEditMode && this.data.event?.id) {
      const updateDto: UpdateCalendarEventDto = {
        title: formValue.title,
        description: formValue.description,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        allDay: formValue.allDay,
        location: formValue.location,
        color: formValue.color,
        isPublic: formValue.isPublic,
      };

      this.calendarService.updateEvent(this.data.event.id, updateDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogRef.close('updated');
          },
          error: (error) => {
            console.error('Error updating event:', error);
            this.snackBar.open(`Error: ${error.error?.message || 'Failed to update event'}`, 'Close', { duration: 5000 });
          },
        });
    } else if (!this.isViewMode) {
      const createDto: CreateCalendarEventDto = {
        title: formValue.title,
        description: formValue.description,
        startDate: formValue.startDate,
        endDate: formValue.endDate,
        allDay: formValue.allDay,
        location: formValue.location,
        color: formValue.color,
        isPublic: formValue.isPublic,
      };

      this.calendarService.createEvent(createDto)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error) => {
            console.error('Error creating event:', error);
            this.snackBar.open(`Error: ${error.error?.message || 'Failed to create event'}`, 'Close', { duration: 5000 });
          },
        });
    }
  }

  onDelete(): void {
    if (!this.data.event?.id) return;

    if (confirm('Are you sure you want to delete this event?')) {
      this.calendarService.deleteEvent(this.data.event.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.dialogRef.close('deleted');
          },
          error: (error) => {
            console.error('Error deleting event:', error);
            this.snackBar.open(`Error: ${error.error?.message || 'Failed to delete event'}`, 'Close', { duration: 5000 });
          },
        });
    }
  }

  onEdit(): void {
    if (this.isViewMode) {
      this.isViewMode = false;
      this.isEditMode = true;
      this.eventForm.enable();
      this.cdr.markForCheck();
    }
  }

  onOpenNotifications(): void {
    this.dialogRef.close('notification');
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

