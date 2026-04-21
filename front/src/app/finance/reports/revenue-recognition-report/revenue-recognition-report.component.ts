// src/app/finance/components/revenue-recognition-report/revenue-recognition-report.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import {
  startWith,
  map,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

// Ngrx actions and selectors
import {
  fetchTerms,
  fetchClasses,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectTerms,
  selectClasses,
} from 'src/app/enrolment/store/enrolment.selectors';
import { selectIsLoadingFinancials } from '../../store/finance.selector'; // Assuming you have a loading selector

// Report model
import {
  RevenueRecognitionReportData,
  RevenueRecognitionReportFilters,
} from '../../models/revenue-recognition-report.model';

// Selector for the report
import { getRevenueRecognitionReport } from '../../store/finance.selector';

import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';

@Component({
  selector: 'app-revenue-recognition-report',
  templateUrl: './revenue-recognition-report.component.html',
  styleUrls: ['./revenue-recognition-report.component.css'],
})
export class RevenueRecognitionReportComponent implements OnInit, OnDestroy {
  filterForm: FormGroup;
  isLoading$: Observable<boolean>;
  terms$: Observable<TermsModel[]>;
  classes$: Observable<ClassesModel[]>;
  reportData$: Observable<RevenueRecognitionReportData | null>; // Changed to null to match initial state
  formChangesSubscription: Subscription | undefined;

  displayedColumns: string[] = [
    'termName',
    'className',
    'totalInvoiced',
    'totalOutstanding',
    'studentCount',
  ];

  constructor(private store: Store, private snackBar: MatSnackBar) {
    this.isLoading$ = this.store.select(selectIsLoadingFinancials);
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);

    // Initialize filterForm in the constructor
    this.filterForm = new FormGroup({
      termFilter: new FormControl<TermsModel | null>(null), // Term is required, consider initial value
      classFilter: new FormControl<ClassesModel | null>(null), // Class is optional
    });

    // Initialize reportData$ here as well to ensure it's always an Observable
    this.reportData$ = this.store.select(
      getRevenueRecognitionReport({ termId: '', classId: null })
    ); // Provide a default empty filter
  }

  ngOnInit(): void {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());

    // When terms are loaded, set a default term in the filter if available
    this.terms$.subscribe((terms) => {
      if (
        terms &&
        terms.length > 0 &&
        !this.filterForm.get('termFilter')?.value
      ) {
        // Set the most recent term as default, or first term
        const mostRecentTerm = terms.reduce((prev, current) => {
          if (!prev) return current;
          const prevDate = new Date(prev.startDate || '');
          const currDate = new Date(current.startDate || '');
          return currDate > prevDate ? current : prev;
        }, terms[0]);
        this.filterForm
          .get('termFilter')
          ?.setValue(mostRecentTerm, { emitEvent: false }); // Avoid infinite loop
      }
    });

    this.formChangesSubscription = this.filterForm.valueChanges
      .pipe(
        startWith(this.filterForm.value), // Emit initial form value
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        map((formValue) => {
          // Ensure a term is selected before trying to create termId
          if (
            !formValue.termFilter ||
            !formValue.termFilter.num ||
            !formValue.termFilter.year
          ) {
            // If no term is selected, return a filter that will result in empty report data
            this.snackBar.open(
              'Please select a term to generate the report.',
              'Dismiss',
              { duration: 3000 }
            );
            return null; // Return null to prevent selector from running with invalid filters
          }
          const termId = `${formValue.termFilter.num}-${formValue.termFilter.year}`;

          return {
            termId: termId,
            classId: formValue.classFilter?.id || null,
          } as RevenueRecognitionReportFilters;
        }),
        switchMap((filters) => {
          if (!filters) {
            return new Observable<RevenueRecognitionReportData | null>(
              (observer) => observer.next(null)
            ); // Emit null if filters are invalid
          }
          return this.store.select(getRevenueRecognitionReport(filters));
        }),
        tap((report) => {
          if (!report || report.reportData.length === 0) {
            console.log(
              'No Revenue Recognition Report data found for the selected criteria.'
            );
          } else {
            console.log('Revenue Recognition Report data loaded:', report);
          }
        })
      )
      .subscribe((reportData) => {
        this.reportData$ = new Observable<RevenueRecognitionReportData | null>(
          (observer) => observer.next(reportData)
        );
      });

    // Manually trigger valueChanges to load initial report
    this.filterForm.updateValueAndValidity({ emitEvent: true });
  }

  ngOnDestroy(): void {
    this.formChangesSubscription?.unsubscribe();
  }

  onClearFilters(): void {
    this.filterForm.reset({
      termFilter: null,
      classFilter: null,
    });
  }
}
