import { viewReportsActions } from './../reports/store/reports.actions';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, Subject, of, BehaviorSubject } from 'rxjs'; // Added 'of'
import {
  takeUntil,
  tap,
  map,
  filter,
  startWith,
  switchMap,
} from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

// Models from your existing project structure
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { ReportsModel } from 'src/app/reports/models/reports.model';
import { StudentsModel } from 'src/app/registration/models/students.model';

// NgRx Actions, Selectors from your existing project structure
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';

import {
  selectIsLoading,
  selectReports,
  selectReportsErrorMsg,
  selectOverallAnalysisData,
  selectAvailableSubjectsForSelection,
  selectAvailableStudentsForSelection,
  selectSubjectAnalysisData,
  selectStudentPerformanceData,
} from 'src/app/reports/store/reports.selectors';

// Charting imports
import { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';

// Interfaces for processed data (copied for local component type safety)
interface OverallAnalysisData {
  subjectPassRates: { subjectName: string; passRate: number }[];
  top5StudentsOverall: { student: StudentsModel; averageMark: number }[];
  bottom5StudentsOverall: { student: StudentsModel; averageMark: number }[];
  uniqueSubjects: { code: string; name: string }[];
  reportsRaw: ReportsModel[];
}

interface SubjectAnalysisData {
  bestStudents: { student: StudentsModel; mark: number; grade: string }[];
  worstStudents: { student: StudentsModel; mark: number; grade: string }[];
  gradeDistribution: { grade: string; count: number }[];
}

interface StudentPerformanceDisplayData {
  student: StudentsModel;
  chartData: ChartConfiguration<'line'>['data'];
}

@Component({
  selector: 'app-results-analysis',
  templateUrl: './results-analysis.component.html',
  styleUrls: ['./results-analysis.component.css'],
})
export class ResultsAnalysisComponent implements OnInit, OnDestroy {
  analysisForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  reports$: Observable<ReportsModel[]> = this.store.pipe(select(selectReports));
  isLoading$: Observable<boolean> = this.store.pipe(select(selectIsLoading));
  errorMsg$: Observable<string> = this.store.pipe(
    select(selectReportsErrorMsg)
  );

  private destroy$ = new Subject<void>();

  overallAnalysisData$: Observable<OverallAnalysisData | null> =
    this.store.pipe(select(selectOverallAnalysisData));
  availableSubjectsForSelection$: Observable<{ code: string; name: string }[]> =
    this.store.pipe(select(selectAvailableSubjectsForSelection));
  availableStudentsForSelection$: Observable<StudentsModel[]> = this.store.pipe(
    select(selectAvailableStudentsForSelection)
  );

  selectedSubjectCode: string = '';
  selectedStudent: StudentsModel | null = null;

  subjectAnalysisData$!: Observable<SubjectAnalysisData | null>;
  studentPerformanceDataArray$!: Observable<
    StudentPerformanceDisplayData[] | null
  >;

  // --- Initialized Observable for selected subject name ---
  selectedSubjectName$!: Observable<string>;

  // Use BehaviorSubject to maintain state
  private selectedSubjectCode$ = new BehaviorSubject<string>('');
  private selectedStudent$ = new BehaviorSubject<StudentsModel | null>(null);

  public lineChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Mark (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Subject',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Mark: ${context.raw}%`;
          },
        },
      },
    },
  };
  public lineChartType: ChartType = 'line';

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    this.store.dispatch(viewReportsActions.resetReports());

    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.analysisForm = new FormGroup({
      term: new FormControl(null, Validators.required),
      clas: new FormControl(null, Validators.required),
      examType: new FormControl(null, Validators.required),
      selectedSubject: new FormControl(null),
      selectedStudent: new FormControl(null),
    });

    // --- NEW: Initialize selectedSubjectName$ correctly ---
    this.selectedSubjectName$ = combineLatest([
      // Watch for changes in the selectedSubject form control value
      this.analysisForm
        .get('selectedSubject')!
        .valueChanges.pipe(
          startWith(this.analysisForm.get('selectedSubject')!.value)
        ),
      // Watch for changes in the available subjects (from the store)
      this.availableSubjectsForSelection$.pipe(
        startWith([]) // Ensure it always has an initial array value for combineLatest
      ),
    ]).pipe(
      map(([selectedCode, availableSubjects]) => {
        if (!selectedCode) {
          return 'Selected Subject'; // Default text if nothing is selected
        }
        const subject = availableSubjects.find((s) => s.code === selectedCode);
        return subject ? subject.name : 'Selected Subject'; // Return name or default
      }),
      takeUntil(this.destroy$) // Ensure cleanup
    );
    // --- END NEW ---

    // Subject Analysis Data pipeline - uses BehaviorSubject for reliable state
    this.subjectAnalysisData$ = combineLatest([
      this.reports$,
      this.selectedSubjectCode$
    ]).pipe(
      filter(
        ([reports, subjectCode]) =>
          !!reports && reports.length > 0 && !!subjectCode && subjectCode !== ''
      ),
      map(([reports, subjectCode]) =>
        this.store
          .pipe(select(selectSubjectAnalysisData(subjectCode)))
          .pipe(takeUntil(this.destroy$))
      ),
      switchMap((selectorObservable) => selectorObservable),
      takeUntil(this.destroy$)
    );

    // Student Performance Data pipeline - uses BehaviorSubject for reliable state
    this.studentPerformanceDataArray$ = combineLatest([
      this.reports$,
      this.selectedStudent$
    ]).pipe(
      filter(
        ([reports, student]) => !!reports && reports.length > 0 && !!student
      ),
      map(([reports, student]) =>
        this.store
          .pipe(select(selectStudentPerformanceData(student)))
          .pipe(takeUntil(this.destroy$))
      ),
      switchMap((selectorObservable) => selectorObservable),
      takeUntil(this.destroy$)
    );

    this.errorMsg$.pipe(takeUntil(this.destroy$)).subscribe((msg) => {
      if (msg) {
        this.snackBar.open(msg, 'Dismiss', {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.selectedSubjectCode$.complete();
    this.selectedStudent$.complete();
  }

  get termControl() {
    return this.analysisForm.get('term');
  }
  get clasControl() {
    return this.analysisForm.get('clas');
  }
  get examTypeControl() {
    return this.analysisForm.get('examType');
  }
  get selectedSubjectFormControl() {
    return this.analysisForm.get('selectedSubject');
  }
  get selectedStudentFormControl() {
    return this.analysisForm.get('selectedStudent');
  }

  // --- REMOVED: Synchronous getter (no longer needed) ---
  // get selectedSubjectName(): string {
  //   const selectedCode = this.selectedSubjectCode;
  //   const availableSubjects = this.availableSubjectsForSelection$;
  //   let subjectName = 'Selected Subject';

  //   availableSubjects.pipe(takeUntil(this.destroy$)).subscribe(subjects => {
  //     const foundSubject = subjects.find(
  //       (s) => s.code === selectedCode
  //     );
  //     if (foundSubject) {
  //       subjectName = foundSubject.name;
  //     }
  //   });
  //   return subjectName;
  // }

  fetchAnalysisData() {
    if (this.analysisForm.invalid) {
      this.snackBar.open(
        'Please select Term, Class, and Exam Type to get analysis data.',
        'Close',
        { duration: 3000 }
      );
      this.analysisForm.markAllAsTouched();
      return;
    }

    this.selectedSubjectCode = '';
    this.selectedStudent = null;
    this.analysisForm
      .get('selectedSubject')
      ?.patchValue(null, { emitEvent: false });
    this.analysisForm
      .get('selectedStudent')
      ?.patchValue(null, { emitEvent: false });
    
    // Reset the BehaviorSubjects
    this.selectedSubjectCode$.next('');
    this.selectedStudent$.next(null);

    const { term, clas, examType } = this.analysisForm.value;
    this.store.dispatch(
      viewReportsActions.viewReports({
        name: clas,
        num: term.num,
        year: term.year,
        examType: examType,
      })
    );
  }

  compareFn(o1: any, o2: any): boolean {
    if (o1 && o2) {
      if (o1.studentNumber && o2.studentNumber) {
        return o1.studentNumber === o2.studentNumber;
      }
      if (
        typeof o1.num === 'number' &&
        typeof o1.year === 'number' &&
        typeof o2.num === 'number' &&
        typeof o2.year === 'number'
      ) {
        return o1.num === o2.num && o1.year === o2.year;
      }
      if (o1.id && o2.id) {
        return o1.id === o2.id;
      }
      return o1 === o2;
    }
    return o1 === o2;
  }

  onTabChange(event: any): void {
    if (event.index === 0) {
      this.selectedStudent = null;
      this.analysisForm
        .get('selectedStudent')
        ?.patchValue(null, { emitEvent: false });
      // Reset the student BehaviorSubject
      this.selectedStudent$.next(null);
    } else if (event.index === 1) {
      this.selectedSubjectCode = '';
      this.analysisForm
        .get('selectedSubject')
        ?.patchValue(null, { emitEvent: false });
      // Reset the subject BehaviorSubject
      this.selectedSubjectCode$.next('');
    }
  }

  onSubjectSelectedForOverallAnalysis(subjectCode: string): void {
    this.selectedSubjectCode = subjectCode;
    this.analysisForm.get('selectedSubject')?.patchValue(subjectCode, { emitEvent: false });
    // Update the BehaviorSubject to trigger the observable pipeline
    this.selectedSubjectCode$.next(subjectCode);
  }

  onStudentSelectedForIndividualPerformance(student: StudentsModel): void {
    this.selectedStudent = student;
    this.analysisForm.get('selectedStudent')?.patchValue(student, { emitEvent: false });
    // Update the BehaviorSubject to trigger the observable pipeline
    this.selectedStudent$.next(student);
  }
}
