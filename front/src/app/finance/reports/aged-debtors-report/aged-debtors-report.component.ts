// src/app/finance/reports/aged-debtors-report/aged-debtors-report.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ThemeService, Theme } from 'src/app/services/theme.service';

// Ngrx actions for data loading
import { invoiceActions } from '../../store/finance.actions';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';

// Ngrx selectors
import {
  selectIsLoadingFinancials,
  selectErrorMsg,
  getAgedDebtorsReport,
} from '../../store/finance.selector';
import {
  selectTerms,
  selectClasses,
} from 'src/app/enrolment/store/enrolment.selectors';
import { selectStudents } from 'src/app/registration/store/registration.selectors';

// Report models
import {
  AgedDebtorsReportData,
  AgedDebtorsReportFilters,
  AgedInvoiceSummary,
} from '../../models/aged-debtors-report.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

interface ReportSummary {
  totalOutstanding: number;
  totalInvoices: number;
  averageDaysOverdue: number;
  criticalCount: number;
}

@Component({
  selector: 'app-aged-debtors-report',
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
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './aged-debtors-report.component.html',
  styleUrls: ['./aged-debtors-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgedDebtorsReportComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  isLoading$: Observable<boolean>;
  error$: Observable<string | null>;
  terms$: Observable<TermsModel[]>;
  classes$: Observable<ClassesModel[]>;
  students$: Observable<StudentsModel[]>;
  
  private filters$$ = new BehaviorSubject<AgedDebtorsReportFilters>({
    asOfDate: new Date(),
    termId: null,
    enrolmentName: null,
    studentNumber: null,
  });
  
  reportData$!: Observable<AgedDebtorsReportData | null>;
  reportSummary$!: Observable<ReportSummary>;
  
  // Display columns
  displayedColumns: string[] = [
    'invoiceNumber',
    'studentName',
    'studentNumber',
    'className',
    'termName',
    'invoiceDate',
    'dueDate',
    'currentBalance',
    'daysOverdue',
    'statusBucket',
  ];
  
  // Pagination
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions: number[] = [10, 25, 50, 100];
  totalInvoices = 0;
  paginatedInvoices: AgedInvoiceSummary[] = [];
  allInvoices: AgedInvoiceSummary[] = [];
  
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
    if (this.filterForm.get('studentFilter')?.value) {
      const student = this.filterForm.get('studentFilter')?.value;
      filters.push(`Student: ${student.name} ${student.surname}`);
    }
    const asOfDate = this.filterForm.get('asOfDate')?.value;
    if (asOfDate) {
      filters.push(`As of: ${new Date(asOfDate).toLocaleDateString()}`);
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
    this.students$ = this.store.select(selectStudents);
  }

  ngOnInit(): void {
    // Dispatch actions to load all necessary data
    this.store.dispatch(invoiceActions.fetchAllInvoices());
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());
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
      asOfDate: new FormControl<Date>(new Date()),
      termFilter: new FormControl<TermsModel | null>(null),
      classFilter: new FormControl<ClassesModel | null>(null),
      studentFilter: new FormControl<StudentsModel | null>(null),
    });
    
    // Setup error handling
    this.setupErrorHandling();
    
    // Setup data flow
    this.setupDataFlow();
    
    // Trigger initial data load
    this.filterForm.updateValueAndValidity({ emitEvent: true });
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
            return message && message.trim() ? message : 'An error occurred while loading the aged debtors report';
          }
          return 'An error occurred while loading the aged debtors report';
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
    // Subscribe to form value changes to update filters
    this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        map((formValue) => {
          let termId: string | null = null;
          if (formValue.termFilter) {
            termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;
          }
          return {
            asOfDate: formValue.asOfDate || new Date(),
            termId: termId,
            enrolmentName: formValue.classFilter?.name || null,
            studentNumber: formValue.studentFilter?.studentNumber || null,
          } as AgedDebtorsReportFilters;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filters) => {
        this.filters$$.next(filters);
      });
    
    // Combine filters with store selector to get report data
    this.reportData$ = combineLatest([this.filters$$]).pipe(
      switchMap(([filters]) => {
        return this.store.select(getAgedDebtorsReport(filters));
      }),
      catchError(error => {
        console.error('Error loading aged debtors report:', error);
        return of(null);
      }),
      takeUntil(this.destroy$)
    );
    
    // Calculate summary
    this.reportSummary$ = this.reportData$.pipe(
      map((data): ReportSummary => {
        if (!data || !data.detailedInvoices || data.detailedInvoices.length === 0) {
          return {
            totalOutstanding: 0,
            totalInvoices: 0,
            averageDaysOverdue: 0,
            criticalCount: 0,
          };
        }
        
        const totalDaysOverdue = data.detailedInvoices.reduce((sum, inv) => sum + inv.daysOverdue, 0);
        const averageDaysOverdue = totalDaysOverdue / data.detailedInvoices.length;
        const criticalCount = data.detailedInvoices.filter(
          inv => inv.statusBucket === '90+ Days'
        ).length;
        
        return {
          totalOutstanding: data.totalOutstanding,
          totalInvoices: data.detailedInvoices.length,
          averageDaysOverdue: Math.round(averageDaysOverdue),
          criticalCount: criticalCount,
        };
      })
    );
    
    // Setup pagination
    this.reportData$
      .pipe(
        map(data => data?.detailedInvoices || []),
        tap(invoices => {
          this.allInvoices = invoices;
          this.totalInvoices = invoices.length;
          this.applyPagination();
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }
  
  onClearFilters(): void {
    this.filterForm.reset({
      asOfDate: new Date(),
      termFilter: null,
      classFilter: null,
      studentFilter: null,
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
    this.filterForm.updateValueAndValidity({ emitEvent: true });
    this.cdr.markForCheck();
  }
  
  onExport(): void {
    this.reportData$
      .pipe(
        map(data => {
          if (!data || !data.detailedInvoices || data.detailedInvoices.length === 0) {
            this.snackBar.open('No data to export', 'Dismiss', { duration: 3000 });
            return;
          }
          
          const headers = [
            'Invoice Number',
            'Student Name',
            'Student Number',
            'Class',
            'Term',
            'Invoice Date',
            'Due Date',
            'Balance',
            'Days Overdue',
            'Status',
          ];
          
          const rows = data.detailedInvoices.map(inv => [
            inv.invoiceNumber,
            inv.studentName,
            inv.studentNumber,
            inv.className,
            inv.termName,
            new Date(inv.invoiceDate).toLocaleDateString(),
            new Date(inv.dueDate).toLocaleDateString(),
            inv.currentBalance.toFixed(2),
            inv.daysOverdue.toString(),
            inv.statusBucket,
          ]);
          
          const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(',')),
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          const filename = `aged_debtors_${new Date().toISOString().split('T')[0]}.csv`;
          
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
    this.paginatedInvoices = this.allInvoices.slice(startIndex, endIndex);
  }
  
  getStatusClass(status: string): string {
    if (status === '90+ Days') return 'status-critical';
    if (status === '31-60 Days' || status === '61-90 Days') return 'status-warning';
    if (status === '1-30 Days') return 'status-caution';
    return '';
  }
  
  getDaysOverdueClass(days: number): string {
    if (days >= 90) return 'critical';
    if (days >= 61) return 'high';
    if (days >= 31) return 'medium';
    if (days >= 1) return 'low';
    return 'current';
  }
  
  private showErrorNotification(message: string): void {
    this.snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }
}
