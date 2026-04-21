// src/app/finance/reports/enrollment-billing-reconciliation-report/enrollment-billing-reconciliation-report.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, combineLatest, of } from 'rxjs';
import {
  startWith,
  map,
  tap,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  filter,
  takeUntil,
} from 'rxjs/operators';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { ThemeService, Theme } from 'src/app/services/theme.service';

// Ngrx actions and selectors
import * as enrolmentActions from 'src/app/enrolment/store/enrolment.actions';
import {
  selectTerms,
  selectClasses,
} from 'src/app/enrolment/store/enrolment.selectors';
import {
  selectIsLoadingFinancials,
  selectErrorMsg,
  getEnrollmentBillingReconciliationReport,
} from '../../store/finance.selector';
import { invoiceActions } from '../../store/finance.actions';
import { fetchStudents } from 'src/app/registration/store/registration.actions';

// Report model
import {
  EnrollmentBillingReportData,
  EnrollmentBillingReportFilters,
  EnrollmentBillingReportDetail,
} from '../../models/enrollment-billing-reconciliation-report.model';

import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';

interface ReportSummary {
  totalStudentsEnrolled: number;
  totalStudentsInvoiced: number;
  totalDiscrepancies: number;
  reconciliationRate: number;
}

@Component({
  selector: 'app-enrollment-billing-reconciliation-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  templateUrl: './enrollment-billing-reconciliation-report.component.html',
  styleUrls: ['./enrollment-billing-reconciliation-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnrollmentBillingReconciliationReportComponent
  implements OnInit, OnDestroy
{
  filterForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  terms$: Observable<TermsModel[]>;
  classes$: Observable<ClassesModel[]>;
  
  private filters$$ = new BehaviorSubject<EnrollmentBillingReportFilters>({
    termId: '',
    classId: null,
  });
  
  reportData$!: Observable<EnrollmentBillingReportData | null>;
  reportSummary$!: Observable<ReportSummary>;
  
  displayedColumns: string[] = [
    'studentNumber',
    'studentName',
    'className',
    'enrolledStatus',
    'invoicedStatus',
    'invoiceNumber',
    'balance',
    'discrepancyMessage',
  ];
  
  // Pagination
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  totalRecords = 0;
  paginatedDetails: EnrollmentBillingReportDetail[] = [];
  allDetails: EnrollmentBillingReportDetail[] = [];
  
  // UI State
  isPrinting: boolean = false;
  showFilters = true;
  currentTheme: Theme = 'light';
  hasError = false;
  errorMessage = '';
  
  private destroy$ = new Subject<void>();
  
  // Print metadata
  get printDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  get activeFilters(): string {
    const filters: string[] = [];
    if (this.filterForm.get('termFilter')?.value) {
      const term = this.filterForm.get('termFilter')?.value;
      filters.push(`Term: ${term.num} ${term.year}`);
    }
    if (this.filterForm.get('classFilter')?.value) {
      filters.push(`Class: ${this.filterForm.get('classFilter')?.value.name}`);
    }
    return filters.length > 0 ? filters.join(' | ') : 'All Records';
  }

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.error$ = this.store.select(selectErrorMsg);
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);
  }

  ngOnInit(): void {
    // Dispatch actions to load necessary data
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(enrolmentActions.fetchTerms());
    this.store.dispatch(enrolmentActions.fetchClasses());
    this.store.dispatch(fetchStudents());
    
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
    
    // Initialize the filter form
    this.filterForm = new FormGroup({
      termFilter: new FormControl<TermsModel | null>(null),
      classFilter: new FormControl<ClassesModel | null>(null),
    });
    
    // Setup error handling
    this.setupErrorHandling();
    
    // Setup data flow
    this.setupDataFlow();
    
    // Set default term if available
    this.terms$
      .pipe(
        filter((terms) => terms && terms.length > 0),
        takeUntil(this.destroy$)
      )
      .subscribe((terms) => {
        if (!this.filterForm.get('termFilter')?.value) {
          const mostRecentTerm = terms.reduce((prev, current) => {
            if (!prev) return current;
            const prevDate = new Date(prev.startDate || '');
            const currDate = new Date(current.startDate || '');
            return currDate > prevDate ? current : prev;
          }, terms[0]);
          this.filterForm
            .get('termFilter')
            ?.setValue(mostRecentTerm, { emitEvent: false });
          this.filterForm.updateValueAndValidity({ emitEvent: true });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filters$$.complete();
  }
  
  private setupErrorHandling(): void {
    this.error$
      .pipe(
        filter((error): error is string => error !== null && error !== undefined && error !== ''),
        map(error => {
          // Handle different error formats
          if (typeof error === 'string' && error.trim()) {
            return error;
          }
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as any).message;
            return message && message.trim() ? message : 'An error occurred while loading the reconciliation report';
          }
          return 'An error occurred while loading the reconciliation report';
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(errorMsg => {
        if (!errorMsg || !errorMsg.trim()) {
          return; // Don't show snackbar for empty messages
        }
        this.hasError = true;
        this.errorMessage = errorMsg;
        this.cdr.markForCheck();
        this.showErrorNotification(errorMsg);
      });
  }
  
  private setupDataFlow(): void {
    let isInitialLoad = true;
    
    // Subscribe to form value changes to update filters
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        tap((formValue) => {
          // Dispatch fetchTermEnrols when term changes
          if (
            formValue.termFilter &&
            formValue.termFilter.num &&
            formValue.termFilter.year
          ) {
            this.store.dispatch(
              enrolmentActions.termEnrolsActions.fetchTermEnrols({
                num: formValue.termFilter.num,
                year: formValue.termFilter.year,
              })
            );
          }
        }),
        map((formValue) => {
          if (
            !formValue.termFilter ||
            !formValue.termFilter.num ||
            !formValue.termFilter.year
          ) {
            return null;
          }
          const termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;
          return {
            termId: termId,
            classId: formValue.classFilter?.id || null,
          } as EnrollmentBillingReportFilters;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        if (filters) {
          this.filters$$.next(filters);
          isInitialLoad = false; // Mark that we've had a valid filter
        } else {
          // Only show snackbar if this is not the initial load
          if (!isInitialLoad) {
            this.snackBar.open(
              'Please select a term to generate the report.',
              'Dismiss',
              { duration: 3000 }
            );
          }
          isInitialLoad = false; // Mark as no longer initial load
        }
      });
    
    // Combine filters with store selector to get report data
    this.reportData$ = combineLatest([this.filters$$]).pipe(
      filter(([filters]) => !!filters && !!filters.termId),
      switchMap(([filters]) => {
        return this.store.select(getEnrollmentBillingReconciliationReport(filters));
      }),
      catchError(error => {
        console.error('Error loading reconciliation report:', error);
        return of(null);
      }),
      takeUntil(this.destroy$)
    );
    
    // Calculate summary
    this.reportSummary$ = this.reportData$.pipe(
      map((data): ReportSummary => {
        if (!data || !data.details || data.details.length === 0) {
          return {
            totalStudentsEnrolled: 0,
            totalStudentsInvoiced: 0,
            totalDiscrepancies: 0,
            reconciliationRate: 0,
          };
        }
        
        const reconciliationRate = data.summary.totalStudentsEnrolled > 0
          ? (data.summary.totalStudentsInvoiced / data.summary.totalStudentsEnrolled) * 100
          : 0;
        
        return {
          totalStudentsEnrolled: data.summary.totalStudentsEnrolled,
          totalStudentsInvoiced: data.summary.totalStudentsInvoiced,
          totalDiscrepancies: data.summary.totalDiscrepancies,
          reconciliationRate: Math.round(reconciliationRate),
        };
      })
    );
    
    // Setup pagination
    this.reportData$
      .pipe(
        map(data => data?.details || []),
        tap(details => {
          this.allDetails = details;
          this.totalRecords = details.length;
          this.applyPagination();
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      termFilter: null,
      classFilter: null,
    });
    this.snackBar.open('Filters cleared', 'Dismiss', { duration: 3000 });
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  onRetry(): void {
    this.hasError = false;
    this.errorMessage = '';
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(enrolmentActions.fetchTerms());
    this.store.dispatch(enrolmentActions.fetchClasses());
    this.store.dispatch(fetchStudents());
    this.filterForm.updateValueAndValidity({ emitEvent: true });
    this.cdr.markForCheck();
  }
  
  onExport(): void {
    this.reportData$
      .pipe(
        map(data => {
          if (!data || !data.details || data.details.length === 0) {
            this.snackBar.open('No data to export', 'Dismiss', { duration: 3000 });
            return;
          }
          
          const headers = [
            'Student Number',
            'Student Name',
            'Class',
            'Enrolled',
            'Invoiced',
            'Invoice Number',
            'Balance',
            'Discrepancy',
            'Discrepancy Message',
          ];
          
          const rows = data.details.map(detail => [
            detail.studentNumber,
            detail.studentName,
            detail.className,
            detail.enrolledStatus,
            detail.invoicedStatus,
            detail.invoiceNumber || '-',
            detail.balance !== null && detail.balance !== undefined ? detail.balance.toFixed(2) : '-',
            detail.discrepancy ? 'Yes' : 'No',
            detail.discrepancyMessage || '-',
          ]);
          
          const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          const filename = `enrollment_billing_reconciliation_${new Date().toISOString().split('T')[0]}.csv`;
          
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          this.snackBar.open('Report exported successfully', 'Dismiss', { duration: 3000 });
        })
      )
      .subscribe();
  }
  
  onPrint(): void {
    this.isPrinting = true;
    this.cdr.markForCheck();
    
    setTimeout(() => {
      window.print();
      
      setTimeout(() => {
        this.isPrinting = false;
        this.cdr.markForCheck();
      }, 1000);
    }, 500);
  }
  
  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.applyPagination();
  }
  
  private applyPagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedDetails = this.allDetails.slice(startIndex, endIndex);
  }
  
  getDiscrepancyClass(discrepancy: boolean): string {
    return discrepancy ? 'discrepancy' : 'no-discrepancy';
  }
  
  getStatusClass(status: string): string {
    if (status === 'Invoiced') return 'status-success';
    if (status === 'Not Invoiced') return 'status-error';
    return 'status-neutral';
  }
  
  private showErrorNotification(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
