import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Title } from '@angular/platform-browser';
import { SystemSettingsService, SystemSettings } from '../services/system-settings.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingsComponent implements OnInit, OnDestroy {
  settingsForm!: FormGroup;
  currentTheme: Theme = 'light';
  selectedTab = 0;
  isLoading = false;
  isSaving = false;
  
  private destroy$ = new Subject<void>();

  // Available options
  languages = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
  ];

  timezones = [
    { value: 'Africa/Harare', label: 'Africa/Harare (CAT)' },
    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
    { value: 'UTC', label: 'UTC' },
  ];

  currencies = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'ZWL', label: 'ZWL (Z$)' },
    { value: 'ZAR', label: 'ZAR (R)' },
  ];

  dateFormats = [
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private systemSettingsService: SystemSettingsService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      // School Information
      schoolName: [''],
      schoolAddress: [''],
      schoolPhone: [''],
      schoolEmail: ['', [Validators.email]],
      schoolWebsite: [''],
      schoolLogo: [''],

      // School Branding Colors
      primaryColor: ['#2196f3', [Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
      accentColor: ['#ffc107', [Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],
      warnColor: ['#795548', [Validators.pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)]],

      // Email/SMTP Settings
      smtpHost: [''],
      smtpPort: [587, [Validators.min(1), Validators.max(65535)]],
      smtpSecure: [false],
      smtpUser: [''],
      smtpPassword: [''],
      smtpFromEmail: ['', [Validators.email]],
      smtpFromName: [''],

      // Notification Settings
      emailNotificationsEnabled: [true],
      smsNotificationsEnabled: [false],

      // Session Settings
      sessionTimeoutMinutes: [30, [Validators.min(5), Validators.max(480)]],
      requirePasswordChange: [false],
      passwordExpiryDays: [90, [Validators.min(0), Validators.max(365)]],

      // General Settings
      defaultLanguage: ['en'],
      timezone: ['Africa/Harare'],
      currency: ['USD'],
      dateFormat: ['dd/MM/yyyy'],

      // Security Settings
      maxLoginAttempts: [5, [Validators.min(3), Validators.max(10)]],
      lockoutDurationMinutes: [15, [Validators.min(5), Validators.max(60)]],
      enableTwoFactorAuth: [false],

    });
  }

  ngOnInit(): void {
    this.title.setTitle('System Settings');
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme: Theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    this.loadSettings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSettings(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.systemSettingsService
      .getSettings()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading system settings:', error);
          this.snackBar.open('Failed to load system settings', 'Close', {
            duration: 3000,
          });
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe((settings) => {
        if (settings) {
          this.settingsForm.patchValue(settings);
          // Don't populate password field for security
          this.settingsForm.patchValue({ smtpPassword: '' });
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  onSave(): void {
    if (this.settingsForm.invalid) {
      this.snackBar.open('Please fix form errors before saving', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.isSaving = true;
    this.cdr.markForCheck();

    const formValue = { ...this.settingsForm.value };
    
    // Don't send empty password (only send if user actually changed it)
    if (!formValue.smtpPassword || formValue.smtpPassword.trim() === '') {
      delete formValue.smtpPassword;
    }

    this.systemSettingsService
      .updateSettings(formValue)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error saving system settings:', error);
          this.snackBar.open('Failed to save system settings', 'Close', {
            duration: 3000,
          });
          this.isSaving = false;
          this.cdr.markForCheck();
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('System settings saved successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          
          // Apply colors immediately if they were changed
          if (result.primaryColor || result.accentColor || result.warnColor) {
            this.themeService.applySchoolColors({
              primaryColor: result.primaryColor,
              accentColor: result.accentColor,
              warnColor: result.warnColor,
            });
          }
          
          // Reload settings to get updated values
          this.loadSettings();
        }
        this.isSaving = false;
        this.cdr.markForCheck();
      });
  }

  onReset(): void {
    if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      this.isSaving = true;
      this.cdr.markForCheck();

      this.systemSettingsService
        .resetToDefaults()
        .pipe(
          takeUntil(this.destroy$),
          catchError((error) => {
            console.error('Error resetting system settings:', error);
            this.snackBar.open('Failed to reset system settings', 'Close', {
              duration: 3000,
            });
            this.isSaving = false;
            this.cdr.markForCheck();
            return of(null);
          })
        )
        .subscribe((result) => {
          if (result) {
            this.snackBar.open('System settings reset to defaults', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
            });
            this.loadSettings();
          }
          this.isSaving = false;
          this.cdr.markForCheck();
        });
    }
  }
}

