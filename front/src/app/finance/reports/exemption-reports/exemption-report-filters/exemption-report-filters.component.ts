import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ExemptionReportFilters } from '../../../store/exemption-report.selectors'; // Adjust path
import { Store, select } from '@ngrx/store';
import { TermsModel } from 'src/app/enrolment/models/terms.model'; // Adjust path
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors'; // Adjust path
import { Observable } from 'rxjs';
import { ExemptionType } from 'src/app/finance/enums/exemption-type.enum';

@Component({
  selector: 'app-exemption-report-filters',
  templateUrl: './exemption-report-filters.component.html',
  styleUrls: ['./exemption-report-filters.component.css'],
})
export class ExemptionReportFiltersComponent implements OnInit {
  @Input() currentFilters!: ExemptionReportFilters;
  @Output() applyFilters = new EventEmitter<ExemptionReportFilters>();

  filters!: ExemptionReportFilters;
  allTerms$: Observable<TermsModel[]>;
  exemptionTypes = Object.values(ExemptionType);

  constructor(private store: Store<any>) {
    // Use 'any' or your root state interface
    this.allTerms$ = this.store.pipe(select(selectTerms));
  }

  ngOnInit(): void {
    // Make a copy to avoid mutating the input directly
    // Initialize filters with only the ones we are keeping
    this.filters = {
      termNum: this.currentFilters.termNum || null,
      termYear: this.currentFilters.termYear || null,
      exemptionType: this.currentFilters.exemptionType || null,
      // startDate, endDate, studentNumber, enrolId are removed
    };
  }

  // --- Removed onDateChange method ---
  // onDateChange(event: any, field: 'startDate' | 'endDate'): void {
  //   this.filters = {
  //     ...this.filters,
  //     [field]: event.value, // Angular Material datepicker returns Date objects
  //   };
  // }

  // onInputChange will no longer be used for studentNumber or enrolId,
  // but keeping it if other text inputs are planned in the future.
  onInputChange(field: keyof ExemptionReportFilters, value: any): void {
    this.filters = {
      ...this.filters,
      [field]: value === '' ? null : value,
    };
  }

  onSelectChange(field: keyof ExemptionReportFilters, value: any): void {
    this.filters = {
      ...this.filters,
      [field]: value === null || value === '' ? null : value,
    };
  }

  onApply(): void {
    this.applyFilters.emit(this.filters);
  }

  onClear(): void {
    const clearedFilters: ExemptionReportFilters = {
      // Set only the remaining filters to null
      termNum: null,
      termYear: null,
      exemptionType: null,
      // Removed startDate, endDate, studentNumber, enrolId from here
    };
    this.filters = clearedFilters; // Update local state
    this.applyFilters.emit(clearedFilters); // Emit cleared filters
  }

  getUniqueTermNumbers(terms: TermsModel[] | null): number[] {
    if (!terms) return [];
    return [...new Set(terms.map((t) => t.num))].sort((a, b) => a - b);
  }

  getUniqueTermYears(terms: TermsModel[] | null): number[] {
    if (!terms) return [];
    return [...new Set(terms.map((t) => t.year))].sort((a, b) => a - b);
  }
}
