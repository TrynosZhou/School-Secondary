// src/app/finance/reports/fees-collection-report/fees-collection-report.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, BehaviorSubject } from 'rxjs'; // Import BehaviorSubject
import { FormControl, FormGroup } from '@angular/forms';
import {
  startWith,
  map,
  tap,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators'; // Add debounceTime, distinctUntilChanged
import { MatSnackBar } from '@angular/material/snack-bar';
// Import the selector factory and filter interface
import {
  getFeesCollectionReport,
  FeesCollectionReportFilters,
  selectIsLoadingFinancials,
  selectErrorMsg,
} from '../../store/finance.selector';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { PaymentMethods } from '../../enums/payment-methods.enum';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-fees-collection-report',
  templateUrl: './fees-collection-report.component.html',
  styleUrls: ['./fees-collection-report.component.css'],
})
export class FeesCollectionReportComponent implements OnInit, OnDestroy {
  paymentMethodTableData: { method: string; total: number }[] = [];
  enrolmentTableData: { enrolName: string; total: number }[] = [];
  feeTypeTableData: { feeName: string; total: number }[] = [];

  filterForm!: FormGroup;

  paymentMethods = Object.values(PaymentMethods) as string[]; // Use Object.values to get string names
  terms$!: Observable<TermsModel[]>;
  isLoading$!: Observable<boolean>;
  error$!: Observable<any>;

  // Use a BehaviorSubject to hold the latest filters, which then drives the selector call
  private filters$$ = new BehaviorSubject<FeesCollectionReportFilters>({});
  reportData$!: Observable<any>; // Holds the processed report data from selector

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            // Use 'function' keyword or arrow function, but ensure 'this' context if needed
            // context type is ChartTooltipItem from chart.js, but 'any' is fine for quick fix
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };
  public paymentMethodPieChartData: ChartData<
    'pie',
    number[],
    string | string[]
  > = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }], // backgroundColor might be optional depending on strictness
  };
  public paymentMethodPieChartType: ChartType = 'pie';

  public enrolmentBarChartData!: ChartData<'bar', number[], string | string[]>;
  public enrolmentBarChartType: ChartType = 'bar';
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', // For horizontal bars if many enrolments
    scales: {
      x: { title: { display: true, text: 'Amount Collected' } },
      y: { title: { display: true, text: 'Enrolment' } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0; // x-axis for horizontal bars
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  public feeTypeBarChartData!: ChartData<'bar', number[], string | string[]>;
  public feeTypeBarChartType: ChartType = 'bar';
  // Options can be shared with enrolment bar chart, or customized
  public feeTypeBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    indexAxis: 'y', // Horizontal bars
    scales: {
      x: { title: { display: true, text: 'Amount Collected' } },
      y: { title: { display: true, text: 'Fee Type' } },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.x || 0;
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  private formChangesSubscription: Subscription | undefined;
  private reportDataSubscription: Subscription | undefined;

  constructor(private store: Store, private snackBar: MatSnackBar) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.error$ = this.store.select(selectErrorMsg);
    this.terms$ = this.store.select(selectTerms);
  }

  ngOnInit(): void {
    this.filterForm = new FormGroup({
      startDate: new FormControl<Date | null>(null),
      endDate: new FormControl<Date | null>(null),
      term: new FormControl<TermsModel | null>(null), // Control for term selection
    });

    // Set up the observable for reportData$ driven by filter changes
    this.reportData$ = this.filters$$.pipe(
      // Use distinctUntilChanged to prevent unnecessary re-evaluation if filters haven't changed
      distinctUntilChanged(
        (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
      ),
      // Map the current filters to the selector factory call
      map((filters) => this.store.select(getFeesCollectionReport(filters))),
      // Flatten the observable of observable to get the actual report data stream
      switchMap((selectorObservable) => selectorObservable),
      // Tap into the data to update charts
      tap((data) => {
        if (data) {
          this.updateCharts(data);
          this.paymentMethodTableData = this.transformMapForTable(
            data.summaryByMethod,
            'method'
          ) as { method: PaymentMethods; total: number }[];
          this.enrolmentTableData = this.transformMapForTable(
            data.summaryByEnrol,
            'enrolName'
          ) as { enrolName: string; total: number }[];
          this.feeTypeTableData = this.transformMapForTable(
            data.summaryByFeeType,
            'feeName'
          ) as { feeName: string; total: number }[];
        } else {
          // Clear table data if no report data
          this.paymentMethodTableData = [];
          this.enrolmentTableData = [];
          this.feeTypeTableData = [];
        }
      })
    );

    // Subscribe to form value changes to update the filters BehaviorSubject
    this.formChangesSubscription = combineLatest([
      this.filterForm.valueChanges.pipe(
        startWith(this.filterForm.value),
        debounceTime(300)
      ), // Debounce to prevent rapid updates
      this.store.select(selectTerms), // Listen to terms to map term selection to dates
    ])
      .pipe(
        map(([formValue, terms]) => {
          let startDate: Date | null = formValue.startDate;
          let endDate: Date | null = formValue.endDate;
          let termId: number | null = null;

          // If a term is selected, override start/end dates and set termId
          if (formValue.term) {
            const selectedTerm = terms.find(
              (t) => t.num === formValue.term.num
            );
            if (selectedTerm) {
              startDate = new Date(selectedTerm.startDate);
              endDate = new Date(selectedTerm.endDate);
              termId = selectedTerm.num;
            }
          }
          // Return the structured filters object
          return { startDate, endDate, termId } as FeesCollectionReportFilters;
        }),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ) // Prevent re-emitting if derived filters are same
      )
      .subscribe((filters) => {
        this.filters$$.next(filters); // Push new filters to the BehaviorSubject
        console.log('Filters updated:', filters);
      });

    // Manually subscribe to reportData$ if you need to perform side effects
    // beyond what the template handles (e.g., logging or error handling)
    this.reportDataSubscription = this.reportData$.subscribe((report) => {
      // console.log('Fees Collection Report Data:', report);
      if (
        report &&
        report.totalCollection === 0 &&
        !this.isLoading$ &&
        !this.error$
      ) {
        // console.log('No data found for selected filters.');
        this.snackBar.open(
          'No fees collected for the selected period/filters.',
          'Dismiss',
          { duration: 3000 }
        );
      }
    });

    // Trigger initial report load by emitting current form value
    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe();
    this.reportDataSubscription?.unsubscribe();
    this.filters$$.complete(); // Complete the BehaviorSubject
  }

  // Method to clear date filters when term is selected
  onTermSelected() {
    this.filterForm.get('startDate')?.setValue(null, { emitEvent: false });
    this.filterForm.get('endDate')?.setValue(null, { emitEvent: false });
    this.filterForm.updateValueAndValidity(); // Ensure changes propagate
  }

  // Method to clear term filter when dates are selected
  onDateFilterChange() {
    this.filterForm.get('term')?.setValue(null, { emitEvent: false });
    this.filterForm.updateValueAndValidity(); // Ensure changes propagate
  }

  updateCharts(reportData: any) {
    // Payment Method Pie Chart
    const paymentMethodLabels = Array.from(
      reportData.summaryByMethod.keys()
    ) as string[];
    const paymentMethodValues = Array.from(
      reportData.summaryByMethod.values()
    ) as number[];

    this.paymentMethodPieChartData = {
      labels: paymentMethodLabels,
      datasets: [
        {
          data: paymentMethodValues,
          backgroundColor: this.generateColors(paymentMethodLabels.length),
        },
      ],
    };

    // Enrolment Bar Chart
    const enrolmentLabels = Array.from(
      reportData.summaryByEnrol.keys()
    ) as string[];
    const enrolmentValues = Array.from(
      reportData.summaryByEnrol.values()
    ) as number[];

    this.enrolmentBarChartData = {
      labels: enrolmentLabels,
      datasets: [
        {
          data: enrolmentValues,
          backgroundColor: this.generateColors(enrolmentLabels.length),
          label: 'Total Collected',
        },
      ],
    };

    // Fee Type Bar Chart
    const feeTypeLabels = Array.from(
      reportData.summaryByFeeType.keys()
    ) as string[];
    const feeTypeValues = Array.from(
      reportData.summaryByFeeType.values()
    ) as number[];

    this.feeTypeBarChartData = {
      labels: feeTypeLabels,
      datasets: [
        {
          data: feeTypeValues,
          backgroundColor: this.generateColors(feeTypeLabels.length),
          label: 'Total Collected',
        },
      ],
    };

    this.chart?.update(); // Update charts if they are present in the DOM
  }

  private generateColors(count: number): string[] {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9933',
      '#C9CBCE',
      '#A1B56E',
      '#FF3D67',
      '#62B6CB',
      '#FFC0CB',
      '#ADD8E6',
      '#90EE90',
      '#FFD700',
      '#DDA0DD',
      '#FFA07A',
      '#F08080',
      '#20B2AA',
      '#778899',
      '#BDB76B',
    ];
    // Simple way to get enough colors, cycle through if more needed
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  }

  // NEW: Generic helper method to transform Map to array for tables
  private transformMapForTable<K, V>(
    map: Map<K, V>,
    keyName: string
  ): { [key: string]: K | V }[] {
    return Array.from(map.entries()).map(([key, value]) => {
      const obj: { [key: string]: K | V } = {};
      obj[keyName] = key;
      obj['total'] = value;
      return obj;
    });
  }
}
