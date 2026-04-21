import { Component, Inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  CalendarService,
  CalendarEvent,
  EventNotificationPreference,
} from '../services/calendar.service';

@Component({
  selector: 'app-notification-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
  ],
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDialogComponent implements OnInit {
  notificationForm!: FormGroup;
  reminderOptions = [
    { label: '1 day before', minutes: 1440 },
    { label: '12 hours before', minutes: 720 },
    { label: '6 hours before', minutes: 360 },
    { label: '1 hour before', minutes: 60 },
    { label: '30 minutes before', minutes: 30 },
    { label: '15 minutes before', minutes: 15 },
  ];
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event: CalendarEvent },
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Load existing notification preferences
    this.calendarService.getNotificationPreference(this.data.event.id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (preference) => {
          if (preference) {
            this.notificationForm.patchValue({
              enabled: preference.enabled,
              reminderMinutes: preference.reminderMinutes || [],
            });
          }
          this.cdr.markForCheck();
        },
        error: () => {
          // No preference exists yet, use defaults
          this.cdr.markForCheck();
        },
      });
  }

  private initializeForm(): void {
    this.notificationForm = this.fb.group({
      enabled: [true],
      reminderMinutes: [[]],
    });
  }

  toggleReminder(minutes: number): void {
    const current = this.notificationForm.get('reminderMinutes')?.value || [];
    const index = current.indexOf(minutes);
    
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(minutes);
    }
    
    this.notificationForm.patchValue({ reminderMinutes: current });
    this.cdr.markForCheck();
  }

  isReminderSelected(minutes: number): boolean {
    const current = this.notificationForm.get('reminderMinutes')?.value || [];
    return current.includes(minutes);
  }

  onSave(): void {
    const formValue = this.notificationForm.value;
    const preference: EventNotificationPreference = {
      enabled: formValue.enabled,
      reminderMinutes: formValue.reminderMinutes || [],
    };

    this.calendarService.setNotificationPreference(this.data.event.id!, preference)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error saving notification preference:', error);
          this.snackBar.open(`Error: ${error.error?.message || 'Failed to save notification preferences'}`, 'Close', { duration: 5000 });
        },
      });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

