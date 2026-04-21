// src/app/finance/reports/outstanding-fees-report/outstanding-fees-report.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject, BehaviorSubject, combineLatest, of, EMPTY } from 'rxjs';
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

// Import Ngrx actions for data loading
import { invoiceActions } from '../../store/finance.actions';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';

// Import selectors and report models
import {
  selectIsLoadingFinancials,
  selectErrorMsg,
  getOutstandingFeesReport,
} from '../../store/finance.selector';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';

import {
  OutstandingFeesReportFilters,
  OutstandingEnrolmentSummary,
  OutstandingResidenceSummary,
  OutstandingStudentDetail,
  OutstandingFeesReportData,
} from '../../models/outstanding-fees.model';

import { ClassesModel } from '../../../enrolment/models/classes.model';
import { TermsModel } from '../../../enrolment/models/terms.model';

interface ReportSummary {
  totalOverallOutstanding: number;
  totalStudents: number;
  totalClasses: number;
  totalResidences: number;
  averageOutstanding: number;
}

@Component({
  selector: 'app-outstanding-fees-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
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
  templateUrl: './outstanding-fees-report.component.html',
  styleUrls: ['./outstanding-fees-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutstandingFeesReportComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  terms$: Observable<TermsModel[]>;
  allClasses$: Observable<ClassesModel[]>;

  private filters$$ = new BehaviorSubject<OutstandingFeesReportFilters>({});
  reportData$!: Observable<OutstandingFeesReportData>;
  reportSummary$!: Observable<ReportSummary>;

  enrolmentSummaryTableData: OutstandingEnrolmentSummary[] = [];
  residenceSummaryTableData: OutstandingResidenceSummary[] = [];
  studentDetailsTableData: OutstandingStudentDetail[] = [];

  // Pagination Properties
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  totalStudents = 0;
  paginatedStudentDetails: OutstandingStudentDetail[] = [];

  // UI State
  isPrinting: boolean = false;
  showFilters = true;
  currentTheme: Theme = 'light';
  hasError = false;
  errorMessage = '';
  
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
    if (this.filterForm.get('residenceFilter')?.value) {
      filters.push(`Residence: ${this.filterForm.get('residenceFilter')?.value}`);
    }
    if (this.filterForm.get('searchQuery')?.value) {
      filters.push(`Search: ${this.filterForm.get('searchQuery')?.value}`);
    }
    return filters.length > 0 ? filters.join(' | ') : 'All Records';
  }

  // Display columns
  enrolmentSummaryDisplayedColumns: string[] = [
    'enrolName',
    'totalOutstanding',
  ];
  residenceSummaryDisplayedColumns: string[] = [
    'residence',
    'totalOutstanding',
  ];
  studentDetailsDisplayedColumns: string[] = [
    'studentName',
    'enrolName',
    'residence',
    'totalOutstanding',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.error$ = this.store.select(selectErrorMsg).pipe(
      map(error => {
        if (!error) return null;
        if (typeof error === 'string') return error;
        if (error && typeof error === 'object') {
          const errObj = error as any;
          if ('message' in errObj && errObj.message) {
            return String(errObj.message);
          }
        }
        return String(error);
      }),
      catchError(() => of('An unexpected error occurred'))
    );
    this.terms$ = this.store.select(selectTerms);
    this.allClasses$ = this.store.select(selectClasses);

    this.setupDataFlow();
  }

  ngOnInit(): void {
    // Load initial data
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());

    // Initialize filter form
    this.filterForm = new FormGroup({
      classFilter: new FormControl<ClassesModel | null>(null),
      residenceFilter: new FormControl<string | null>(null),
      termFilter: new FormControl<TermsModel | null>(null),
      searchQuery: new FormControl<string | null>(null),
    });

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    // Handle errors with user-friendly messages
    this.error$
      .pipe(
        filter((error): error is string => !!error),
        takeUntil(this.destroy$)
      )
      .subscribe(error => {
        this.hasError = true;
        this.errorMessage = error || 'An error occurred while loading data';
        this.showErrorNotification(error);
        this.cdr.markForCheck();
      });

    // Watch form changes and update filters
    combineLatest([
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      ),
      this.store.select(selectTerms).pipe(
        tap((terms) => {
          if (!terms || terms.length === 0) {
            console.warn('Terms not yet loaded or empty.');
          }
        })
      ),
    ])
      .pipe(
        map(([formValue, terms]) => {
          let termId: string | null = null;

          if (formValue.termFilter) {
            termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;
          }

          return {
            enrolmentName: formValue.classFilter?.name || null,
            residence: formValue.residenceFilter || null,
            termId: termId,
            searchQuery: formValue.searchQuery || null,
          } as OutstandingFeesReportFilters;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        this.pageIndex = 0;
        this.filters$$.next(filters);
      });

    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.filters$$.complete();
  }

  private setupDataFlow(): void {
    // Create report data observable
    this.reportData$ = this.filters$$.pipe(
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      ),
      switchMap((filters) =>
        this.store.select(getOutstandingFeesReport(filters)).pipe(
          catchError(error => {
            console.error('Error loading report:', error);
            this.showErrorNotification('Failed to load outstanding fees report. Please try again.');
            return EMPTY;
          })
        )
      ),
      tap((data) => {
        if (data) {
          this.enrolmentSummaryTableData =
            this.transformEnrolmentSummaryMapToArray(data.summaryByEnrolment);
          this.residenceSummaryTableData =
            this.transformResidenceSummaryMapToArray(data.summaryByResidence);

          this.studentDetailsTableData = data.studentDetails;
          this.totalStudents = data.studentDetails.length;
          this.hasError = false;
          this.errorMessage = '';
          this.applyPagination();
        }
      }),
      catchError(error => {
        console.error('Error in report data flow:', error);
        return EMPTY;
      })
    );

    // Create summary statistics
    this.reportSummary$ = this.reportData$.pipe(
      map(data => {
        if (!data || !data.studentDetails || data.studentDetails.length === 0) {
          return {
            totalOverallOutstanding: 0,
            totalStudents: 0,
            totalClasses: 0,
            totalResidences: 0,
            averageOutstanding: 0,
          };
        }

        const uniqueClasses = new Set(data.studentDetails.map(s => s.enrolName));
        const uniqueResidences = new Set(data.studentDetails.map(s => s.residence));
        const averageOutstanding = data.totalOverallOutstanding / data.studentDetails.length;

        return {
          totalOverallOutstanding: data.totalOverallOutstanding,
          totalStudents: data.studentDetails.length,
          totalClasses: uniqueClasses.size,
          totalResidences: uniqueResidences.size,
          averageOutstanding: averageOutstanding,
        };
      })
    );
  }

  onClearFilters(): void {
    this.filterForm.reset({
      classFilter: null,
      residenceFilter: null,
      termFilter: null,
      searchQuery: null,
    });
    this.snackBar.open('Filters cleared', 'Dismiss', { duration: 2000 });
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    this.cdr.markForCheck();
  }

  onRetry(): void {
    this.hasError = false;
    this.errorMessage = '';
    
    // Reload data
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(fetchStudents());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
    
    this.snackBar.open('Retrying...', 'Dismiss', { duration: 2000 });
    this.cdr.markForCheck();
  }

  onExport(): void {
    this.reportData$.pipe(
      takeUntil(this.destroy$),
      map(data => {
        if (!data || !data.studentDetails || data.studentDetails.length === 0) {
          this.snackBar.open('No data to export', 'Dismiss', { duration: 3000 });
          return;
        }

        // Create CSV content
        const headers = ['Student Name', 'Student Number', 'Class/Enrolment', 'Residence', 'Outstanding Balance'];
        const rows = data.studentDetails.map(detail => [
          detail.studentName.replace(/,/g, ';'),
          detail.studentNumber || '',
          detail.enrolName.replace(/,/g, ';'),
          detail.residence || '',
          detail.totalOutstanding.toFixed(2),
        ]);

        // Add summary rows
        const summaryRows = [
          [''],
          ['Summary by Class'],
          ['Class Name', 'Total Outstanding'],
          ...this.enrolmentSummaryTableData.map(s => [
            s.enrolName.replace(/,/g, ';'),
            s.totalOutstanding.toFixed(2),
          ]),
          [''],
          ['Summary by Residence'],
          ['Residence', 'Total Outstanding'],
          ...this.residenceSummaryTableData.map(s => [
            s.residence.replace(/,/g, ';'),
            s.totalOutstanding.toFixed(2),
          ]),
          [''],
          ['Overall Total Outstanding', data.totalOverallOutstanding.toFixed(2)],
        ];

        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.join(',')),
          ...summaryRows.map(row => row.join(',')),
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const filename = `outstanding_fees_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.snackBar.open('Report exported successfully', 'Dismiss', { duration: 3000 });
      })
    ).subscribe();
  }

  onPrint(): void {
    this.isPrinting = true;
    this.cdr.markForCheck();
    
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      window.print();
      
      // Reset after print dialog is closed
      setTimeout(() => {
        this.isPrinting = false;
        this.cdr.markForCheck();
      }, 1000);
    }, 500);
  }

  // Pagination Methods
  applyPagination(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedStudentDetails = this.studentDetailsTableData.slice(
      startIndex,
      endIndex
    );
    this.cdr.markForCheck();
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.applyPagination();
  }

  // Transform methods
  private transformEnrolmentSummaryMapToArray(
    map: Map<string, number>
  ): OutstandingEnrolmentSummary[] {
    return Array.from(map.entries())
      .map(([enrolName, totalOutstanding]) => ({
        enrolName: enrolName,
        totalOutstanding: totalOutstanding,
      }))
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }

  private transformResidenceSummaryMapToArray(
    map: Map<string, number>
  ): OutstandingResidenceSummary[] {
    return Array.from(map.entries())
      .map(([residence, totalOutstanding]) => ({
        residence: residence,
        totalOutstanding: totalOutstanding,
      }))
      .sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  }

  private showErrorNotification(message: string): void {
    this.snackBar.open(
      message,
      'Retry',
      {
        duration: 5000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      }
    ).onAction().subscribe(() => this.onRetry());
  }

  // UI Helper methods
  getTotalOutstandingClass(amount: number): string {
    return amount > 10000 ? 'high-outstanding' : amount > 5000 ? 'medium-outstanding' : 'low-outstanding';
  }
}
