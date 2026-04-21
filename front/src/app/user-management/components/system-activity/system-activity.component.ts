/* eslint-disable prettier/prettier */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { UserActivityModel, UserActivityPaginatedModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectSystemActivity, selectLoading, selectError } from '../../store/user-management.selectors';
import { ThemeService, Theme } from '../../../services/theme.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-system-activity',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    DatePipe,
  ],
  templateUrl: './system-activity.component.html',
  styleUrls: ['./system-activity.component.scss']
})
export class SystemActivityComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  systemActivity$ = this.store.select(selectSystemActivity);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  currentPage = 0;
  pageSize = 20;
  totalItems = 0;

  // Filter options
  selectedAction = '';
  selectedTimeRange = '24h';
  selectedUser = '';

  // Available filter options
  actions = [
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'PASSWORD_CHANGED', 'PASSWORD_RESET',
    'LOGIN', 'LOGOUT', 'PROFILE_UPDATED', 'ROLE_CHANGED', 'STATUS_CHANGED',
    'SESSION_CREATED', 'SESSION_TERMINATED', 'BULK_OPERATION', 'SYSTEM_ACTION',
    'DATA_EXPORT', 'DATA_IMPORT', 'REPORT_GENERATED', 'BACKUP_CREATED', 'RESTORE_PERFORMED'
  ];

  timeRanges = [
    { value: '1h', label: 'Last Hour' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  currentTheme: Theme = 'light';

  constructor(
    private store: Store,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
    
    this.loadSystemActivity();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    this.systemActivity$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activity => {
        if (activity) {
          this.totalItems = activity.total;
        }
      });
  }

  private loadSystemActivity(): void {
    // Calculate date range from selectedTimeRange
    let startDate: string | undefined;
    const now = new Date();
    
    if (this.selectedTimeRange !== 'all') {
      const rangeMap: { [key: string]: number } = {
        '1h': 1 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
      };
      const rangeMs = rangeMap[this.selectedTimeRange];
      if (rangeMs) {
        const start = new Date(now.getTime() - rangeMs);
        startDate = start.toISOString();
      }
    }

    this.store.dispatch(userManagementActions.loadSystemActivity({
      page: this.currentPage + 1,
      limit: this.pageSize,
      action: this.selectedAction || undefined,
      userId: this.selectedUser || undefined,
      startDate: startDate,
      endDate: now.toISOString(),
    }));
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadSystemActivity();
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.loadSystemActivity();
  }

  onRefresh(): void {
    this.loadSystemActivity();
  }

  onClearFilters(): void {
    this.selectedAction = '';
    this.selectedTimeRange = '24h';
    this.selectedUser = '';
    this.currentPage = 0;
    this.loadSystemActivity();
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
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
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

  getTimeRangeLabel(value: string): string {
    const timeRange = this.timeRanges.find(tr => tr.value === value);
    return timeRange ? timeRange.label : value;
  }

  getUniqueUsers(activities: UserActivityModel[]): number {
    const uniqueUsers = new Set(activities.map(activity => activity.userId));
    return uniqueUsers.size;
  }
}
