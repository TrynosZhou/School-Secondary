import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, filter, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import * as ReportReleaseActions from '../../store/report-release.actions';
import * as fromReportRelease from '../../store/report-release.selectors';
import { ReportReleaseSettings, GeneratedExamSession } from '../../models/report-release-settings.model';
import { GenerateSessionsDialogComponent } from './generate-sessions-dialog/generate-sessions-dialog.component';
import { BulkUpdateDialogComponent } from './bulk-update-dialog/bulk-update-dialog.component';
import { EditReleaseDialogComponent } from './edit-release-dialog/edit-release-dialog.component';

@Component({
  selector: 'app-report-release-management',
  templateUrl: './report-release-management.component.html',
  styleUrls: ['./report-release-management.component.scss']
})
export class ReportReleaseManagementComponent implements OnInit, OnDestroy {
  reportReleases$: Observable<ReportReleaseSettings[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  success$: Observable<string | null>;

  displayedColumns: string[] = [
    'termNumber',
    'termYear', 
    'examType',
    'isReleased',
    'releaseDate',
    'scheduledReleaseDate',
    'releasedBy',
    'actions'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.reportReleases$ = this.store.select(fromReportRelease.selectReportReleases);
    this.loading$ = this.store.select(fromReportRelease.selectReportReleasesLoading);
    this.error$ = this.store.select(fromReportRelease.selectReportReleasesError);
    this.success$ = this.store.select(fromReportRelease.selectReportReleasesSuccess);
  }

  ngOnInit(): void {
    this.loadReportReleases();
    
    // Listen for success messages and show them as snack bars
    this.success$
      .pipe(
        filter((success) => !!success),
        takeUntil(this.destroy$)
      )
      .subscribe((success) => {
        this.snackBar.open(success || 'Success', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.store.dispatch(ReportReleaseActions.clearReportReleaseSuccess());
      });

    // Listen for error messages and show them as snack bars
    this.error$
      .pipe(
        filter((error) => !!error),
        takeUntil(this.destroy$)
      )
      .subscribe((error) => {
        this.snackBar.open(error || 'Error occurred', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        this.store.dispatch(ReportReleaseActions.clearReportReleaseError());
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReportReleases(): void {
    this.store.dispatch(ReportReleaseActions.loadReportReleases());
  }

  refreshData(): void {
    this.loadReportReleases();
  }

  openGenerateFromTermsDialog(): void {
    if (confirm('This will automatically create report release settings for all existing terms in the database. Each term will get both Mid-Term and End of Term sessions. Continue?')) {
      this.store.dispatch(ReportReleaseActions.generateFromTerms());
    }
  }

  openGenerateSessionsDialog(): void {
    const dialogRef = this.dialog.open(GenerateSessionsDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ReportReleaseActions.generateExamSessions({ year: result.year }));
      }
    });
  }

  openBulkUpdateDialog(): void {
    const dialogRef = this.dialog.open(BulkUpdateDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ReportReleaseActions.bulkUpdateReportReleases({ 
          bulkUpdateDto: result 
        }));
      }
    });
  }

  openEditDialog(reportRelease: ReportReleaseSettings): void {
    const dialogRef = this.dialog.open(EditReleaseDialogComponent, {
      width: '500px',
      data: { reportRelease }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.store.dispatch(ReportReleaseActions.updateReportRelease({
          id: reportRelease.id,
          updateDto: result
        }));
      }
    });
  }

  toggleReleaseStatus(reportRelease: ReportReleaseSettings): void {
    const updateDto = {
      isReleased: !reportRelease.isReleased,
      releaseNotes: reportRelease.releaseNotes || undefined,
      sendNotification: true
    };

    this.store.dispatch(ReportReleaseActions.updateReportRelease({
      id: reportRelease.id,
      updateDto
    }));
  }

  deleteReportRelease(reportRelease: ReportReleaseSettings): void {
    if (confirm(`Are you sure you want to delete the report release setting for ${reportRelease.examType} Term ${reportRelease.termNumber} ${reportRelease.termYear}?`)) {
      this.store.dispatch(ReportReleaseActions.deleteReportRelease({
        id: reportRelease.id
      }));
    }
  }

  processScheduledReleases(): void {
    if (confirm('Are you sure you want to process all scheduled releases? This will release any reports whose scheduled release date has passed.')) {
      this.store.dispatch(ReportReleaseActions.processScheduledReleases());
    }
  }

  getExamTypeLabel(examType: string): string {
    return examType === 'Mid Term' ? 'Mid-Term' : 'End of Term';
  }

  formatDate(date: Date | string | null): string {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getReleaseStatusClass(isReleased: boolean): string {
    return isReleased ? 'released' : 'not-released';
  }

  getReleaseStatusLabel(isReleased: boolean): string {
    return isReleased ? 'Released' : 'Not Released';
  }

  exportToCSV(): void {
    // TODO: Implement CSV export functionality
    this.snackBar.open('CSV export coming soon!', 'Close', { duration: 3000 });
  }
}
