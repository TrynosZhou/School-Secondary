import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import {
  AuditLogsService,
  AuditLog,
  AuditAction,
  AuditEntityType,
  AuditLogFilters,
} from '../services/audit-logs.service';
import { formatDate } from '@angular/common';
import { DetailsDialogComponent } from './details-dialog.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatDialogModule,
  ],
  templateUrl: './audit-logs.component.html',
  styleUrls: ['./audit-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  displayedColumns: string[] = ['timestamp', 'action', 'entityType', 'entityId', 'performedBy', 'ipAddress', 'details'];
  auditLogs: AuditLog[] = [];
  totalLogs = 0;
  isLoading = false;
  pageSize = 25;
  pageIndex = 0;

  auditActions = Object.values(AuditAction);
  entityTypes = Object.values(AuditEntityType);

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private auditLogsService: AuditLogsService,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      action: [''],
      entityType: [''],
      entityId: [''],
      performedBy: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Audit Logs');
    this.loadAuditLogs();

    // Debounce form changes for search
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadAuditLogs();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.filterForm.value;
    const filters: AuditLogFilters = {
      limit: this.pageSize,
      offset: this.pageIndex * this.pageSize,
    };

    if (formValue.action) {
      filters.action = formValue.action;
    }

    if (formValue.entityType) {
      filters.entityType = formValue.entityType;
    }

    if (formValue.entityId) {
      filters.entityId = parseInt(formValue.entityId, 10);
    }

    if (formValue.performedBy) {
      filters.performedBy = formValue.performedBy;
    }

    if (formValue.startDate) {
      filters.startDate = formatDate(formValue.startDate, 'yyyy-MM-dd', 'en-US');
    }

    if (formValue.endDate) {
      filters.endDate = formatDate(formValue.endDate, 'yyyy-MM-dd', 'en-US');
    }

    this.auditLogsService
      .getAuditLogs(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.auditLogs = response.logs.map(log => ({
            ...log,
            timestamp: new Date(log.timestamp),
          }));
          this.totalLogs = response.total;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading audit logs:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAuditLogs();
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
    this.loadAuditLogs();
  }

  getActionLabel(action: string): string {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  getEntityTypeLabel(entityType: string): string {
    return entityType.charAt(0) + entityType.slice(1).toLowerCase();
  }

  formatTimestamp(timestamp: Date): string {
    return formatDate(timestamp, 'yyyy-MM-dd HH:mm:ss', 'en-US');
  }

  getActionIcon(action: string): string {
    if (action.includes('CREATED')) return 'add_circle';
    if (action.includes('UPDATED')) return 'edit';
    if (action.includes('VOIDED')) return 'cancel';
    if (action.includes('APPLIED')) return 'check_circle';
    return 'info';
  }

  getActionColor(action: string): string {
    if (action.includes('CREATED')) return 'primary';
    if (action.includes('UPDATED')) return 'accent';
    if (action.includes('VOIDED')) return 'warn';
    if (action.includes('APPLIED')) return 'primary';
    return '';
  }

  viewDetails(log: AuditLog): void {
    const changes = log.changes ? JSON.stringify(log.changes, null, 2) : 'No additional details';
    const details = `Action: ${this.getActionLabel(log.action)}\nEntity: ${this.getEntityTypeLabel(log.entityType)} #${log.entityId}\nPerformed By: ${log.performedBy}\nTimestamp: ${this.formatTimestamp(log.timestamp)}\nIP Address: ${log.ipAddress || 'N/A'}\n\nChanges:\n${changes}`;
    
    this.dialog.open(DetailsDialogComponent, {
      width: '600px',
      data: {
        title: 'Audit Log Details',
        content: details,
      },
    });
  }
}

