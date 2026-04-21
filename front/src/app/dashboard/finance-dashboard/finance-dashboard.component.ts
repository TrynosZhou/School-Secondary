import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  tap,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { FinanceDataModel } from '../../finance/models/finance-data.model';
import { FinanceFilter } from '../../finance/models/finance-filter.model';
import { FinanceDashboardSummaryFilters } from '../../finance/models/finance-dashboard-summary.model';
import { FilterFinanceDialogComponent } from './filter-finance-dialog/filter-finance-dialog.component';
import {
  selectAllCombinedFinanceData,
  selectFinanceDashboardSummary,
} from 'src/app/finance/store/finance.selector';
import {
  financeDashboardSummaryActions,
  invoiceActions,
  receiptActions,
} from 'src/app/finance/store/finance.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { fetchStudents } from 'src/app/registration/store/registration.actions';
import {
  fetchClasses,
  fetchTerms,
  currentTermActions,
  fetchEnrolsStats,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectCurrentTerm,
  selectEnrolsStats,
  selectClasses,
} from 'src/app/enrolment/store/enrolment.selectors';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { EnrolStats } from 'src/app/enrolment/models/enrol-stats.model';

@Component({
  selector: 'app-finance-dashboard',
  templateUrl: './finance-dashboard.component.html',
  styleUrls: ['./finance-dashboard.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinanceDashboardComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  // UI State
  isSearchBarVisible = false;
  isLoading = true;
  hasError = false;
  errorMessage = '';

  // Data Management
  private ngUnsubscribe = new Subject<void>();
  private filterSubject = new BehaviorSubject<FinanceFilter>({});
  private sortSubject = new BehaviorSubject<string>('dateDesc');

  // Data Sources
  invoicesDataSource = new MatTableDataSource<FinanceDataModel>([]);
  paymentsDataSource = new MatTableDataSource<FinanceDataModel>([]);

  // Using setters for the paginators to ensure they are always linked to the data source
  @ViewChild('invoicesPaginator') set invoicesPaginator(
    paginator: MatPaginator
  ) {
    if (paginator) {
      this.invoicesDataSource.paginator = paginator;
    }
  }
  @ViewChild('paymentsPaginator') set paymentsPaginator(
    paginator: MatPaginator
  ) {
    if (paginator) {
      this.paymentsDataSource.paginator = paginator;
    }
  }

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  totalInvoices$!: Observable<number>;
  totalPayments$!: Observable<number>;
  totalBalance$!: Observable<number>;
  
  // Additional financial metrics
  averageInvoiceAmount$!: Observable<number>;
  averagePaymentAmount$!: Observable<number>;
  collectionRate$!: Observable<number>;
  totalTransactions$!: Observable<number>;

  // Enrolment statistics for finance view (grouped by form, sorted ascending)
  enrolStats$!: Observable<EnrolStats | null>;
  /** Rows for enrolment table: form headers and class rows, grouped by form and sorted ascending */
  enrolClassTotals$!: Observable<
    Array<
      | { kind: 'form'; form: number; formLabel: string }
      | { kind: 'class'; className: string; total: number; form: number }
      | { kind: 'formTotal'; form: number; total: number; label: string }
      | { kind: 'grandTotal'; total: number; label: string }
    >
  >;
  enrolTotalStudents$!: Observable<number>;

  currentSort$ = this.sortSubject.asObservable();
  sortOptions = [
    { label: 'Date (Newest)', value: 'dateDesc' },
    { label: 'Date (Oldest)', value: 'dateAsc' },
    { label: 'Amount (Highest)', value: 'amountDesc' },
    { label: 'Amount (Lowest)', value: 'amountAsc' },
    { label: 'Type (A-Z)', value: 'typeAsc' },
  ];

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
            weight: 'normal',
          },
        },
      },
      y: {
        min: 0,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: '#666',
          font: {
            size: 12,
            weight: 'normal',
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#333',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return label + ': $' + (value != null ? value.toLocaleString() : '0');
          },
        },
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Invoices',
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(102, 126, 234, 0.9)',
        hoverBorderColor: 'rgba(102, 126, 234, 1)',
        hoverBorderWidth: 3,
      },
      {
        data: [],
        label: 'Payments',
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(76, 175, 80, 0.9)',
        hoverBorderColor: 'rgba(76, 175, 80, 1)',
        hoverBorderWidth: 3,
      },
    ],
  };

  constructor(
    private store: Store, 
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupDataSubscriptions();
    this.initializeDefaultFilter();
  }

  loadData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.cdr.markForCheck();

    try {
      this.store.dispatch(invoiceActions.fetchAllInvoices());
      this.store.dispatch(receiptActions.fetchAllReceipts());
      this.store.dispatch(fetchStudents());
      this.store.dispatch(fetchTerms());
      this.store.dispatch(fetchClasses());
      this.store.dispatch(currentTermActions.fetchCurrentTerm());
      this.store.dispatch(fetchEnrolsStats());
    } catch (error) {
      this.handleError('Failed to load financial data');
    }
  }

  /** Map UI filter to API summary filters (only fields supported by backend). */
  private toSummaryFilters(
    f: FinanceFilter
  ): FinanceDashboardSummaryFilters | undefined {
    if (!f || Object.keys(f).length === 0) return undefined;
    const startDate = f.startDate;
    const endDate = f.endDate;
    const enrolTerm = f.enrolTerm;
    const transactionType =
      f.transactionType === 'Invoice' || f.transactionType === 'Payment'
        ? f.transactionType
        : undefined;
    if (!startDate && !endDate && !enrolTerm && !transactionType)
      return undefined;
    return { startDate, endDate, enrolTerm, transactionType };
  }

  private setupDataSubscriptions(): void {
    const allData$ = this.store.pipe(select(selectAllCombinedFinanceData));

    // When filters change, refetch dashboard summary (cards + chart from API)
    this.filterSubject
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((f) => {
        this.store.dispatch(
          financeDashboardSummaryActions.fetchFinanceDashboardSummary({
            filters: this.toSummaryFilters(f),
          })
        );
      });

    // Tables: use full list + client-side filter/sort (unchanged)
    allData$
      .pipe(
        tap(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe({ error: (err) => this.handleError('Failed to load data') });

    const filteredData$ = combineLatest([
      allData$,
      this.filterSubject.asObservable(),
    ]).pipe(
      map(([data, filters]) => this.applyFilters(data ?? [], filters)),
      takeUntil(this.ngUnsubscribe)
    );

    const filteredAndSortedData$ = combineLatest([
      filteredData$,
      this.sortSubject.asObservable(),
    ]).pipe(
      map(([filteredData, sort]) => this.applySorting(filteredData ?? [], sort)),
      tap((data) => {
        const safe = Array.isArray(data) ? data : [];
        this.invoicesDataSource.data = safe.filter(
          (item) => item.type === 'Invoice'
        );
        this.paymentsDataSource.data = safe.filter(
          (item) => item.type === 'Payment'
        );
        this.cdr.markForCheck();
      }),
      takeUntil(this.ngUnsubscribe)
    );

    filteredAndSortedData$.subscribe({
      error: (error) => this.handleError('Failed to filter and sort data')
    });

    // Cards and chart: from backend summary API (single source for aggregates)
    const summary$ = this.store.pipe(select(selectFinanceDashboardSummary));
    this.totalInvoices$ = summary$.pipe(
      map((s) => s?.totalInvoiced ?? 0)
    );
    this.totalPayments$ = summary$.pipe(
      map((s) => s?.totalPayments ?? 0)
    );
    this.totalBalance$ = summary$.pipe(
      map((s) => s?.outstandingBalance ?? 0)
    );
    this.averageInvoiceAmount$ = summary$.pipe(
      map((s) => s?.averageInvoiceAmount ?? 0)
    );
    this.averagePaymentAmount$ = summary$.pipe(
      map((s) => s?.averagePaymentAmount ?? 0)
    );
    this.collectionRate$ = summary$.pipe(
      map((s) => s?.collectionRate ?? 0)
    );
    this.totalTransactions$ = summary$.pipe(
      map((s) => s?.totalTransactions ?? 0)
    );

    // Chart: from summary monthly breakdown
    summary$
      .pipe(
        tap((summary) => {
          if (summary?.monthlyBreakdown?.length) {
            this.barChartData.labels = summary.monthlyBreakdown.map(
              (m) => m.monthLabel
            );
            this.barChartData.datasets[0].data =
              summary.monthlyBreakdown.map((m) => m.invoicesTotal);
            this.barChartData.datasets[1].data =
              summary.monthlyBreakdown.map((m) => m.paymentsTotal);
          } else {
            this.barChartData.labels = [];
            this.barChartData.datasets[0].data = [];
            this.barChartData.datasets[1].data = [];
          }
          if (this.chart) this.chart.update();
          this.cdr.markForCheck();
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe();

    // Enrolment statistics: total students per class, grouped by form and sorted ascending
    this.enrolStats$ = this.store.pipe(select(selectEnrolsStats));

    this.enrolClassTotals$ = combineLatest([
      this.store.pipe(select(selectEnrolsStats)),
      this.store.pipe(select(selectClasses)),
    ]).pipe(
      map(([stats, classes]: [EnrolStats | null, ClassesModel[]]) => {
        if (!stats || !stats.clas) {
          return [];
        }
        const s = stats;
        const classList = classes || [];
        const getForm = (className: string): number =>
          classList.find((c) => c.name === className)?.form ?? 999;

        const rows = s.clas.map((className, index) => {
          const boys = s.boys[index] || 0;
          const girls = s.girls[index] || 0;
          return { className, total: boys + girls, form: getForm(className) };
        });
        rows.sort((a, b) => a.form - b.form || a.className.localeCompare(b.className));

        const result: Array<
          | { kind: 'form'; form: number; formLabel: string }
          | { kind: 'class'; className: string; total: number; form: number }
          | { kind: 'formTotal'; form: number; total: number; label: string }
          | { kind: 'grandTotal'; total: number; label: string }
        > = [];

        let currentForm = -1;
        let currentFormTotal = 0;
        let grandTotal = 0;

        const pushFormTotalIfNeeded = () => {
          if (currentForm !== -1) {
            result.push({
              kind: 'formTotal',
              form: currentForm,
              total: currentFormTotal,
              label: `Total Form ${currentForm}`,
            });
          }
        };

        for (const row of rows) {
          if (row.form !== currentForm) {
            // close previous form with subtotal row
            pushFormTotalIfNeeded();

            currentForm = row.form;
            currentFormTotal = 0;
            result.push({ kind: 'form', form: row.form, formLabel: `Form ${row.form}` });
          }

          result.push({
            kind: 'class',
            className: row.className,
            total: row.total,
            form: row.form,
          });
          currentFormTotal += row.total;
          grandTotal += row.total;
        }

        // close last form
        pushFormTotalIfNeeded();

        result.push({ kind: 'grandTotal', total: grandTotal, label: 'Total All Forms' });
        return result;
      })
    );

    this.enrolTotalStudents$ = this.store.pipe(
      select(selectEnrolsStats),
      map((stats) => {
        if (!stats || !stats.boys) return 0;
        const boysTotal = (stats.boys || []).reduce((a, b) => a + b, 0);
        const girlsTotal = (stats.girls || []).reduce((a, b) => a + b, 0);
        return boysTotal + girlsTotal;
      })
    );
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    this.isLoading = false;
    this.cdr.markForCheck();
    console.error(message);
  }

  ngAfterViewInit(): void {
    if (this.chart) {
      this.chart.update();
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  toggleSearchBar(): void {
    this.isSearchBarVisible = !this.isSearchBarVisible;
  }

  onFinancialEntitySelectedFromSearch(entity: FinanceDataModel): void {
    this.filterSubject.next({ studentId: entity.studentId });
  }

  onFilter(): void {
    const dialogRef = this.dialog.open(FilterFinanceDialogComponent, {
      width: '400px',
      data: this.filterSubject.value,
    });

    dialogRef.afterClosed().subscribe((result: FinanceFilter) => {
      if (result) {
        this.filterSubject.next(result);
      }
    });
  }

  onClearFilters(): void {
    // Reset to default filter (current term)
    this.initializeDefaultFilter();
    this.sortSubject.next('dateDesc');
  }

  private initializeDefaultFilter(): void {
    // Subscribe to current term and set default filter
    this.store
      .pipe(
        select(selectCurrentTerm),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe((currentTerm) => {
        if (currentTerm) {
          // Format term as "num year" to match enrolTerm format in FinanceDataModel
          const enrolTerm = `${currentTerm.num} ${currentTerm.year}`;
          this.filterSubject.next({ enrolTerm });
        } else {
          // If no current term, use empty filter
          this.filterSubject.next({});
        }
        this.cdr.markForCheck();
      });
  }

  onSortChange(sortValue: string): void {
    this.sortSubject.next(sortValue);
  }

  private applyFilters(
    data: FinanceDataModel[],
    filters: FinanceFilter
  ): FinanceDataModel[] {
    if (!data || !Array.isArray(data)) return [];
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }
    return data.filter((item) => {
      if (filters.transactionType && item.type !== filters.transactionType)
        return false;
      if (
        filters.startDate &&
        new Date(item.date) < new Date(filters.startDate)
      )
        return false;
      if (filters.endDate && new Date(item.date) > new Date(filters.endDate))
        return false;
      if (filters.minAmount && item.amount < filters.minAmount) return false;
      if (filters.maxAmount && item.amount > filters.maxAmount) return false;
      if (filters.enrolTerm && item.enrolTerm !== filters.enrolTerm)
        return false;
      return true;
    });
  }

  private applySorting(
    data: FinanceDataModel[],
    sort: string
  ): FinanceDataModel[] {
    if (!data || !Array.isArray(data)) return [];
    const sortedData = [...data];
    switch (sort) {
      case 'dateDesc':
        return sortedData.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      case 'dateAsc':
        return sortedData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      case 'amountDesc':
        return sortedData.sort((a, b) => b.amount - a.amount);
      case 'amountAsc':
        return sortedData.sort((a, b) => a.amount - b.amount);
      case 'typeAsc':
        return sortedData.sort((a, b) => a.type.localeCompare(b.type));
      default:
        return sortedData;
    }
  }
}
