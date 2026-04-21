/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UserActivityModel, UserActivityPaginatedModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectUserActivity, selectLoading, selectError } from '../../store/user-management.selectors';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-user-activity',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './user-activity.component.html',
  styleUrls: ['./user-activity.component.scss']
})
export class UserActivityComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentTheme: 'light' | 'dark' = 'light';

  userActivity$ = this.store.select(selectUserActivity);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  currentPage = 0;
  pageSize = 20;
  totalItems = 0;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<UserActivityComponent>,
    public themeService: ThemeService,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; userName: string }
  ) {}

  ngOnInit(): void {
    this.loadUserActivity();
    this.setupSubscriptions();
    
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    this.userActivity$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activity => {
        if (activity) {
          this.totalItems = activity.total;
        }
      });
  }

  private loadUserActivity(): void {
    this.store.dispatch(userManagementActions.loadUserActivity({
      id: this.data.userId,
      page: this.currentPage + 1,
      limit: this.pageSize
    }));
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadUserActivity();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onRefresh(): void {
    this.loadUserActivity();
  }

  getActionIcon(action: string): string {
    const actionIcons: { [key: string]: string } = {
      'USER_CREATED': 'person_add',
      'USER_UPDATED': 'edit',
      'USER_DELETED': 'delete',
      'PASSWORD_CHANGED': 'lock',
      'PASSWORD_RESET': 'lock_reset',
      'LOGIN': 'login',
      'LOGOUT': 'logout',
      'PROFILE_UPDATED': 'account_circle',
      'ROLE_CHANGED': 'admin_panel_settings',
      'STATUS_CHANGED': 'toggle_on',
      'SESSION_CREATED': 'devices',
      'SESSION_TERMINATED': 'devices_other',
      'BULK_OPERATION': 'group_work',
      'SYSTEM_ACTION': 'settings',
      'DATA_EXPORT': 'download',
      'DATA_IMPORT': 'upload',
      'REPORT_GENERATED': 'assessment',
      'BACKUP_CREATED': 'backup',
      'RESTORE_PERFORMED': 'restore',
      'AUDIT_LOG_VIEWED': 'visibility',
      'PERMISSION_CHANGED': 'security',
      'ACCOUNT_LOCKED': 'lock',
      'ACCOUNT_UNLOCKED': 'lock_open',
      'TWO_FACTOR_ENABLED': 'enhanced_encryption',
      'TWO_FACTOR_DISABLED': 'no_encryption',
      'API_KEY_GENERATED': 'vpn_key',
      'API_KEY_REVOKED': 'key_off',
      'NOTIFICATION_SENT': 'notifications',
      'EMAIL_VERIFIED': 'mark_email_read',
      'PHONE_VERIFIED': 'verified_user',
      'DEFAULT': 'history'
    };

    return actionIcons[action] || actionIcons['DEFAULT'];
  }

  getActionColor(action: string): string {
    const actionColors: { [key: string]: string } = {
      'USER_CREATED': 'primary',
      'USER_UPDATED': 'accent',
      'USER_DELETED': 'warn',
      'PASSWORD_CHANGED': 'primary',
      'PASSWORD_RESET': 'accent',
      'LOGIN': 'primary',
      'LOGOUT': 'basic',
      'PROFILE_UPDATED': 'accent',
      'ROLE_CHANGED': 'warn',
      'STATUS_CHANGED': 'accent',
      'SESSION_CREATED': 'primary',
      'SESSION_TERMINATED': 'warn',
      'BULK_OPERATION': 'accent',
      'SYSTEM_ACTION': 'basic',
      'DATA_EXPORT': 'primary',
      'DATA_IMPORT': 'accent',
      'REPORT_GENERATED': 'primary',
      'BACKUP_CREATED': 'accent',
      'RESTORE_PERFORMED': 'warn',
      'AUDIT_LOG_VIEWED': 'basic',
      'PERMISSION_CHANGED': 'warn',
      'ACCOUNT_LOCKED': 'warn',
      'ACCOUNT_UNLOCKED': 'primary',
      'TWO_FACTOR_ENABLED': 'primary',
      'TWO_FACTOR_DISABLED': 'warn',
      'API_KEY_GENERATED': 'accent',
      'API_KEY_REVOKED': 'warn',
      'NOTIFICATION_SENT': 'primary',
      'EMAIL_VERIFIED': 'primary',
      'PHONE_VERIFIED': 'primary',
      'DEFAULT': 'basic'
    };

    return actionColors[action] || actionColors['DEFAULT'];
  }

  getActionDisplayName(action: string): string {
    const actionNames: { [key: string]: string } = {
      'USER_CREATED': 'User Created',
      'USER_UPDATED': 'User Updated',
      'USER_DELETED': 'User Deleted',
      'PASSWORD_CHANGED': 'Password Changed',
      'PASSWORD_RESET': 'Password Reset',
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'PROFILE_UPDATED': 'Profile Updated',
      'ROLE_CHANGED': 'Role Changed',
      'STATUS_CHANGED': 'Status Changed',
      'SESSION_CREATED': 'Session Created',
      'SESSION_TERMINATED': 'Session Terminated',
      'BULK_OPERATION': 'Bulk Operation',
      'SYSTEM_ACTION': 'System Action',
      'DATA_EXPORT': 'Data Export',
      'DATA_IMPORT': 'Data Import',
      'REPORT_GENERATED': 'Report Generated',
      'BACKUP_CREATED': 'Backup Created',
      'RESTORE_PERFORMED': 'Restore Performed',
      'AUDIT_LOG_VIEWED': 'Audit Log Viewed',
      'PERMISSION_CHANGED': 'Permission Changed',
      'ACCOUNT_LOCKED': 'Account Locked',
      'ACCOUNT_UNLOCKED': 'Account Unlocked',
      'TWO_FACTOR_ENABLED': 'Two-Factor Enabled',
      'TWO_FACTOR_DISABLED': 'Two-Factor Disabled',
      'API_KEY_GENERATED': 'API Key Generated',
      'API_KEY_REVOKED': 'API Key Revoked',
      'NOTIFICATION_SENT': 'Notification Sent',
      'EMAIL_VERIFIED': 'Email Verified',
      'PHONE_VERIFIED': 'Phone Verified',
      'DEFAULT': 'Activity'
    };

    return actionNames[action] || actionNames['DEFAULT'];
  }

  formatTimestamp(timestamp: Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
  }

  getResourceTypeIcon(resourceType?: string): string {
    const resourceIcons: { [key: string]: string } = {
      'user': 'person',
      'student': 'school',
      'teacher': 'person',
      'parent': 'family_restroom',
      'class': 'class',
      'subject': 'book',
      'mark': 'grade',
      'attendance': 'event_available',
      'finance': 'account_balance',
      'report': 'assessment',
      'system': 'settings',
      'DEFAULT': 'folder'
    };

    return resourceIcons[resourceType || ''] || resourceIcons['DEFAULT'];
  }
}
