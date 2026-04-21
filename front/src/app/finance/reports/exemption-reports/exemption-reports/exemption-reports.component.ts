import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';

import {
  ExemptionReportFilters,
  ExemptionReportData,
  getExemptionReport,
} from '../../../store/exemption-report.selectors'; // Adjust path

// Import your selectors (assuming they are correctly defined)

@Component({
  selector: 'app-exemption-reports',
  templateUrl: './exemption-reports.component.html',
  styleUrls: ['./exemption-reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Use OnPush for performance
})
export class ExemptionReportsComponent implements OnInit {
  filters: ExemptionReportFilters = {
    startDate: null,
    endDate: null,
    termNum: null,
    termYear: null,
    exemptionType: null,
    studentNumber: null,
    enrolId: null,
  };

  reportData$!: Observable<ExemptionReportData>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Initialize the report data observable
    // We create a selector factory here and pass the current filters
    // The selector itself will re-run when its inputs (allInvoices, allTerms) change
    // or when the 'filters' local state changes (triggering a new selector instance)
    this.reportData$ = this.store.pipe(
      select(getExemptionReport(this.filters))
    );

    // This is crucial: to react to filter changes, we need to re-evaluate the selector.
    // However, NGRX `select` operator with a factory function already handles this
    // if the factory function creates a new selector instance.
    // A more explicit way if the selector itself doesn't internally react to 'filters' directly:
    // We need to trigger the selector with updated filters.
    // The current setup of `getExemptionReport(this.filters)` directly integrates filters,
    // so when `this.filters` updates, the `select(getExemptionReport(this.filters))` will effectively
    // get a new memoized selector if filters object reference changes.
    // To ensure this, `onApplyFilters` must create a *new* filters object.
  }

  onApplyFilters(newFilters: ExemptionReportFilters): void {
    // Create a new object to ensure change detection (if filters were passed as Input to selector)
    // In this setup, directly assigning to `this.filters` works because `select(getExemptionReport(this.filters))`
    // will create a new selector instance if `this.filters` changes.
    this.filters = { ...newFilters }; // Create a new object reference
    // Re-assigning reportData$ to trigger a new selection based on new filters
    this.reportData$ = this.store.pipe(
      select(getExemptionReport(this.filters))
    );
  }
}
