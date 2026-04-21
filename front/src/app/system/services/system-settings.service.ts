import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SystemSettings {
  id?: string;
  // School Information
  schoolName?: string;
  schoolAddress?: string;
  schoolPhone?: string;
  schoolEmail?: string;
  schoolWebsite?: string;
  schoolLogo?: string;

  // School Branding Colors
  primaryColor?: string;
  accentColor?: string;
  warnColor?: string;

  // Email/SMTP Settings
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;

  // Notification Settings
  emailNotificationsEnabled?: boolean;
  smsNotificationsEnabled?: boolean;

  // Session Settings
  sessionTimeoutMinutes?: number;
  requirePasswordChange?: boolean;
  passwordExpiryDays?: number;

  // General Settings
  defaultLanguage?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;

  // Security Settings
  maxLoginAttempts?: number;
  lockoutDurationMinutes?: number;
  enableTwoFactorAuth?: boolean;

  // Backup Settings
  autoBackupEnabled?: boolean;
  backupRetentionDays?: number;
  backupSchedule?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private apiUrl = `${environment.apiUrl}/system/settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(this.apiUrl);
  }

  updateSettings(settings: Partial<SystemSettings>): Observable<SystemSettings> {
    return this.http.put<SystemSettings>(this.apiUrl, settings);
  }

  resetToDefaults(): Observable<SystemSettings> {
    return this.http.post<SystemSettings>(`${this.apiUrl}/reset`, {});
  }
}

