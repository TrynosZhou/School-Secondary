import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { formatDate } from '@angular/common';
import {
  AnalyticsService,
  AnalyticsSummary,
  EnrollmentAnalytics,
  FinancialAnalytics,
  AcademicAnalytics,
  UserActivityAnalytics,
  SystemAnalytics,
} from '../services/analytics.service';
import { of } from 'rxjs';
import { TermsService } from 'src/app/enrolment/services/terms.service';
import { TermsModel } from 'src/app/enrolment/models/terms.model';

@Component({
  selector: 'app-analytics',
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
    MatTabsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatExpansionModule,
    MatGridListModule,
    NgChartsModule,
  ],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  isLoading = false;
  selectedTab = 0;

  analyticsSummary: AnalyticsSummary | null = null;
  currentTerm: TermsModel | null = null;
  availableTerms: TermsModel[] = [];

  // Chart configurations
  enrollmentByTermChart: ChartConfiguration<'bar'> | null = null;
  enrollmentByClassChart: ChartConfiguration<'bar'> | null = null;
  studentsByGenderChart: ChartConfiguration<'doughnut'> | null = null;
  revenueByMonthChart: ChartConfiguration<'line'> | null = null;
  paymentsByMethodChart: ChartConfiguration<'pie'> | null = null;
  reportsByTermChart: ChartConfiguration<'bar'> | null = null;
  usersByRoleChart: ChartConfiguration<'doughnut'> | null = null;
  auditLogsByActionChart: ChartConfiguration<'bar'> | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private analyticsService: AnalyticsService,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private termsService: TermsService,
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      termNum: [''],
      termYear: [''],
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Analytics & Reports');
    this.loadTerms();
  }

  loadTerms(): void {
    // Load all terms for the dropdown
    this.termsService.getAllTerms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (terms) => {
          this.availableTerms = terms.sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return b.num - a.num;
          });
          this.cdr.markForCheck();
          
          // Get current term and set as default
          this.termsService.getCurrentTerm()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (currentTerm) => {
                this.currentTerm = currentTerm;
                this.filterForm.patchValue({
                  termNum: currentTerm.num,
                  termYear: currentTerm.year,
                });
                this.loadAnalytics();
              },
              error: () => {
                // If no current term, load analytics without term filter
                this.loadAnalytics();
              },
            });
        },
        error: () => {
          // If terms fail to load, try to get current term anyway
          this.termsService.getCurrentTerm()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (currentTerm) => {
                this.currentTerm = currentTerm;
                this.filterForm.patchValue({
                  termNum: currentTerm.num,
                  termYear: currentTerm.year,
                });
                this.loadAnalytics();
              },
              error: () => {
                this.loadAnalytics();
              },
            });
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.filterForm.value;
    const startDate = formValue.startDate
      ? formatDate(formValue.startDate, 'yyyy-MM-dd', 'en-US')
      : undefined;
    const endDate = formValue.endDate
      ? formatDate(formValue.endDate, 'yyyy-MM-dd', 'en-US')
      : undefined;
    const termNum = formValue.termNum ? parseInt(formValue.termNum, 10) : undefined;
    const termYear = formValue.termYear ? parseInt(formValue.termYear, 10) : undefined;

    this.analyticsService
      .getAnalyticsSummary(startDate, endDate, termNum, termYear)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          console.error('Error loading analytics:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.analyticsSummary = data;
          this.initializeCharts(data);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  initializeCharts(summary: AnalyticsSummary): void {
    // Enrollment by Term Chart
    if (summary.enrollment.enrollmentsByTerm.length > 0) {
      this.enrollmentByTermChart = {
        type: 'bar',
        data: {
          labels: summary.enrollment.enrollmentsByTerm.map((e) => e.term),
          datasets: [
            {
              label: 'Enrollments',
              data: summary.enrollment.enrollmentsByTerm.map((e) => e.count),
              backgroundColor: 'rgba(33, 150, 243, 0.6)',
              borderColor: 'rgba(33, 150, 243, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Enrollments by Term' },
          },
        },
      };
    }

    // Enrollment by Class Chart
    if (summary.enrollment.enrollmentsByClass.length > 0) {
      this.enrollmentByClassChart = {
        type: 'bar',
        data: {
          labels: summary.enrollment.enrollmentsByClass.map((e) => e.className),
          datasets: [
            {
              label: 'Students',
              data: summary.enrollment.enrollmentsByClass.map((e) => e.count),
              backgroundColor: 'rgba(255, 193, 7, 0.6)',
              borderColor: 'rgba(255, 193, 7, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Enrollments by Class' },
          },
        },
      };
    }

    // Students by Gender Chart
    if (summary.enrollment.studentsByGender.length > 0) {
      this.studentsByGenderChart = {
        type: 'doughnut',
        data: {
          labels: summary.enrollment.studentsByGender.map((s) => s.gender),
          datasets: [
            {
              data: summary.enrollment.studentsByGender.map((s) => s.count),
              backgroundColor: [
                'rgba(33, 150, 243, 0.6)',
                'rgba(255, 193, 7, 0.6)',
                'rgba(121, 85, 72, 0.6)',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Students by Gender' },
          },
        },
      };
    }

    // Revenue by Month Chart
    if (summary.financial.revenueByMonth.length > 0) {
      this.revenueByMonthChart = {
        type: 'line',
        data: {
          labels: summary.financial.revenueByMonth.map((r) => r.month),
          datasets: [
            {
              label: 'Revenue',
              data: summary.financial.revenueByMonth.map((r) => r.amount),
              borderColor: 'rgba(33, 150, 243, 1)',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Revenue by Month' },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return '$' + value.toLocaleString();
                },
              },
            },
          },
        },
      };
    }

    // Payments by Method Chart
    if (summary.financial.paymentsByMethod.length > 0) {
      this.paymentsByMethodChart = {
        type: 'pie',
        data: {
          labels: summary.financial.paymentsByMethod.map((p) => p.method),
          datasets: [
            {
              data: summary.financial.paymentsByMethod.map((p) => p.amount),
              backgroundColor: [
                'rgba(33, 150, 243, 0.6)',
                'rgba(255, 193, 7, 0.6)',
                'rgba(121, 85, 72, 0.6)',
                'rgba(76, 175, 80, 0.6)',
                'rgba(233, 30, 99, 0.6)',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Payments by Method' },
          },
        },
      };
    }

    // Reports by Term Chart
    if (summary.academic.reportsByTerm.length > 0) {
      this.reportsByTermChart = {
        type: 'bar',
        data: {
          labels: summary.academic.reportsByTerm.map((r) => r.term),
          datasets: [
            {
              label: 'Reports',
              data: summary.academic.reportsByTerm.map((r) => r.count),
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgba(76, 175, 80, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Reports by Term' },
          },
        },
      };
    }

    // Users by Role Chart
    if (summary.userActivity.usersByRole.length > 0) {
      this.usersByRoleChart = {
        type: 'doughnut',
        data: {
          labels: summary.userActivity.usersByRole.map((u) => u.role),
          datasets: [
            {
              data: summary.userActivity.usersByRole.map((u) => u.count),
              backgroundColor: [
                'rgba(33, 150, 243, 0.6)',
                'rgba(255, 193, 7, 0.6)',
                'rgba(121, 85, 72, 0.6)',
                'rgba(76, 175, 80, 0.6)',
                'rgba(233, 30, 99, 0.6)',
              ],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Users by Role' },
          },
        },
      };
    }

    // Audit Logs by Action Chart
    if (summary.system.auditLogsByAction.length > 0) {
      this.auditLogsByActionChart = {
        type: 'bar',
        data: {
          labels: summary.system.auditLogsByAction.map((a) =>
            a.action.replace(/_/g, ' '),
          ),
          datasets: [
            {
              label: 'Actions',
              data: summary.system.auditLogsByAction.map((a) => a.count),
              backgroundColor: 'rgba(233, 30, 99, 0.6)',
              borderColor: 'rgba(233, 30, 99, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Audit Logs by Action' },
          },
        },
      };
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  onFilterChange(): void {
    this.loadAnalytics();
  }

  clearFilters(): void {
    // Reset to current term if available
    if (this.currentTerm) {
      this.filterForm.patchValue({
        termNum: this.currentTerm.num,
        termYear: this.currentTerm.year,
        startDate: '',
        endDate: '',
      });
    } else {
      this.filterForm.reset();
    }
    this.loadAnalytics();
  }

  getUniqueYears(): number[] {
    const years = new Set<number>();
    this.availableTerms.forEach(term => years.add(term.year));
    return Array.from(years).sort((a, b) => b - a);
  }

  getFilteredTerms(): TermsModel[] {
    const selectedYear = this.filterForm.get('termYear')?.value;
    if (selectedYear) {
      return this.availableTerms.filter(term => term.year === parseInt(selectedYear, 10));
    }
    return this.availableTerms;
  }

  onTermChange(): void {
    // When term is selected, update year if needed
    const selectedTermNum = this.filterForm.get('termNum')?.value;
    if (selectedTermNum) {
      const selectedTerm = this.availableTerms.find(t => t.num === parseInt(selectedTermNum, 10));
      if (selectedTerm) {
        this.filterForm.patchValue({ termYear: selectedTerm.year }, { emitEvent: false });
      }
    }
    this.onFilterChange();
  }

  onYearChange(): void {
    // When year changes, clear term if it doesn't match
    const selectedYear = this.filterForm.get('termYear')?.value;
    const selectedTermNum = this.filterForm.get('termNum')?.value;
    
    if (selectedYear && selectedTermNum) {
      const selectedTerm = this.availableTerms.find(
        t => t.num === parseInt(selectedTermNum, 10) && t.year === parseInt(selectedYear, 10)
      );
      if (!selectedTerm) {
        this.filterForm.patchValue({ termNum: '' }, { emitEvent: false });
      }
    }
    this.onFilterChange();
  }
}

