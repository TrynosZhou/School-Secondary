import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectCurrentEnrolment,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import * as reportsActions from '../store/reports.actions';
import { ReportsModel } from '../models/reports.model';
import { selectIsLoading, selectReports, selectReportsGenerated } from '../store/reports.selectors';
import {
  selectUser,
  selectIsParent,
  selectLinkedChildrenAnyRole,
} from 'src/app/auth/store/auth.selectors';
import { ExamType } from 'src/app/marks/models/examtype.enum';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { viewReportsActions } from '../store/reports.actions';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { take, map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators'; // Import operators for filtering
import { RoleAccessService } from 'src/app/services/role-access.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { formatTermLabel } from 'src/app/enrolment/models/term-label.util';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements OnInit, OnDestroy {
  reportsForm!: FormGroup;
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;

  reports$: Observable<ReportsModel[]> = this.store.select(selectReports);
  
  // Search/filter control
  searchControl = new FormControl('');
  
  // Filtered reports based on search input
  filteredReports$: Observable<ReportsModel[]> = combineLatest([
    this.reports$,
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    )
  ]).pipe(
    map(([reports, searchTerm]) => {
      // Ensure reports is an array
      const reportsArray = reports || [];
      
      if (!searchTerm || searchTerm.trim() === '') {
        return reportsArray;
      }
      
      const searchLower = searchTerm.toLowerCase().trim();
      return reportsArray.filter(report => {
        const studentName = report.report?.name?.toLowerCase() || '';
        const studentSurname = report.report?.surname?.toLowerCase() || '';
        const studentNumber = report.studentNumber?.toLowerCase() || '';
        const fullName = `${studentName} ${studentSurname}`.trim();
        
        return studentName.includes(searchLower) ||
               studentSurname.includes(searchLower) ||
               studentNumber.includes(searchLower) ||
               fullName.includes(searchLower);
      });
    })
  );

  role = '';
  id!: string;
  mode!: 'generate' | 'view';
  isLoading$ = this.store.select(selectIsLoading); // This is crucial for the spinner
  reportsGenerated$ = this.store.select(selectReportsGenerated); // Track if reports were generated
  currentEnrolment!: EnrolsModel;
  
  // Role-based access observables
  isStudent$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.student, role))
  );
  /** Parent viewing children's reports (tabbed by child). Use role so parent always sees this view. */
  isParent$ = this.store.select(selectIsParent);
  linkedChildren$ = this.store.select(selectLinkedChildrenAnyRole);
  /** Staff view: form, generate, view, analytics, grid — only for teachers, admins, auditor, director, dev; never students or parents. */
  isStaffReportsView$ = combineLatest([this.isStudent$, this.isParent$]).pipe(
    map(([student, parent]) => !student && !parent)
  );
  canGenerateReports$ = this.roleAccess.canGenerateReports$();
  canSaveReports$ = this.roleAccess.canSaveReports$();
  
  isAdmin$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.admin, role))
  );

  /** Parent tab: index of selected child (for Progress Reports tabbed view). */
  selectedChildIndex$ = new BehaviorSubject(0);
  /** Resolved student number for the selected tab (one report-cards instance per view). */
  selectedChildStudentNumber$: Observable<string | null> = combineLatest([
    this.linkedChildren$,
    this.selectedChildIndex$,
  ]).pipe(
    map(([children, idx]) => (children && children[idx]) ? children[idx].studentNumber : null)
  );

  // Analytics properties
  totalStudents = 0;
  totalSubjects = 0;
  averageMark = 0;
  passRate = 0;

  private subscriptions: Subscription[] = [];
  private previousReportsKey = '';

  examtype: ExamType[] = [ExamType.midterm, ExamType.endofterm];

  constructor(
    private store: Store,
    private roleAccess: RoleAccessService
  ) {
    this.store.dispatch(fetchTerms());
    this.store.dispatch(fetchClasses());

    this.subscriptions.push(
      this.store.select(selectCurrentEnrolment).subscribe((enrolment) => {
        if (enrolment) this.currentEnrolment = enrolment;
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(reportsActions.viewReportsActions.resetReports());
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);

    this.reportsForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      examType: new FormControl('', Validators.required),
    });

    this.subscriptions.push(
      this.store.select(selectUser).subscribe((user) => {
        if (user) {
          this.role = user.role;
          this.id = user.id;

          if (this.role === ROLES.student) {
            this.store.dispatch(
              viewReportsActions.fetchStudentReports({ studentNumber: this.id })
            );
          }
        }
      })
    );

    // (selectedChildStudentNumber$ is derived from linkedChildren$ + selectedChildIndex$; no extra subscription)

    // Subscribe to reports changes to calculate analytics
    this.subscriptions.push(
      this.reports$.subscribe((reports) => {
        this.calculateAnalytics(reports);
      })
    );
    
    // Reset search only when a new report collection is loaded (not per-row comment edits)
    this.subscriptions.push(
      this.reports$.subscribe((reports) => {
        const key = (reports || [])
          .map((r) => `${r.studentNumber}:${r.id ?? 'new'}`)
          .join('|');
        const isDifferentCollection = key !== this.previousReportsKey;
        if (isDifferentCollection && this.previousReportsKey) {
          this.searchControl.setValue('', { emitEvent: false });
        }
        this.previousReportsKey = key;
      })
    );
  }

  get term() {
    return this.reportsForm.get('term');
  }

  get clas() {
    return this.reportsForm.get('clas');
  }

  get examType() {
    return this.reportsForm.get('examType');
  }

  // Consolidated method for fetching reports based on form selections
  fetchReportsBasedOnForm() {
    const { term, clas, examType } = this.reportsForm.value;

    if (this.reportsForm.valid) {
      this.store.dispatch(
        reportsActions.viewReportsActions.viewReports({
          name: clas,
          num: term.num,
          year: term.year,
          termId: term.id,
          examType: examType,
        })
      );
    } else {
      // Optional: Provide user feedback if form is invalid
      console.warn('Form is invalid. Cannot fetch reports.');
    }
  }

  generate() {
    this.mode = 'generate';
    const { term, clas, examType } = this.reportsForm.value;

    if (this.reportsForm.valid) {
      this.store.dispatch(
        reportsActions.generateReports({
          name: clas,
          num: term.num,
          year: term.year,
          termId: term.id,
          examType: examType,
        })
      );
    } else {
      console.warn('Form is invalid. Cannot generate reports.');
    }
  }

  saveReports() {
    // Use take(1) to get the current reports value once and complete the subscription
    this.reports$.pipe(take(1)).subscribe((reportsToSave) => {
      const { term, clas, examType } = this.reportsForm.value;

      if (this.reportsForm.valid && reportsToSave && reportsToSave.length > 0) {
        this.store.dispatch(
          reportsActions.saveReportActions.saveReports({
            name: clas,
            num: term.num,
            year: term.year,
            termId: term.id,
            reports: reportsToSave,
            examType: examType,
          })
        );
      } else {
        console.warn('No reports to save or form is invalid.');
      }
    });
  }

  viewReports() {
    this.mode = 'view';
    this.fetchReportsBasedOnForm(); // Call the fetch method when 'View' is clicked
  }

  // Analytics methods
  calculateAnalytics(reports: ReportsModel[]): void {
    if (!reports || reports.length === 0) {
      this.resetAnalytics();
      return;
    }

    this.totalStudents = this.getUniqueStudentsCount(reports);
    this.totalSubjects = this.getUniqueSubjectsCount(reports);
    this.averageMark = this.calculateAverageMark(reports);
    this.passRate = this.calculatePassRate(reports);
  }

  private resetAnalytics(): void {
    this.totalStudents = 0;
    this.totalSubjects = 0;
    this.averageMark = 0;
    this.passRate = 0;
  }

  private getUniqueStudentsCount(reports: ReportsModel[]): number {
    const uniqueStudents = new Set(reports.map(report => report.studentNumber));
    return uniqueStudents.size;
  }

  private getUniqueSubjectsCount(reports: ReportsModel[]): number {
    const uniqueSubjects = new Set<string>();
    
    reports.forEach(report => {
      if (report.report && report.report.subjectsTable) {
        report.report.subjectsTable.forEach(subject => {
          if (subject.subjectCode) {
            uniqueSubjects.add(subject.subjectCode);
          }
        });
      }
    });
    
    return uniqueSubjects.size;
  }

  private calculateAverageMark(reports: ReportsModel[]): number {
    let totalMarks = 0;
    let markCount = 0;

    reports.forEach(report => {
      if (report.report && report.report.subjectsTable) {
        report.report.subjectsTable.forEach(subject => {
          if (subject.mark !== null && subject.mark !== undefined) {
            totalMarks += subject.mark;
            markCount++;
          }
        });
      }
    });

    return markCount > 0 ? Math.round((totalMarks / markCount) * 100) / 100 : 0;
  }

  private calculatePassRate(reports: ReportsModel[]): number {
    let totalMarks = 0;
    let passingMarks = 0;

    reports.forEach(report => {
      if (report.report && report.report.subjectsTable) {
        report.report.subjectsTable.forEach(subject => {
          if (subject.mark !== null && subject.mark !== undefined) {
            totalMarks++;
            if (subject.mark >= 50) { // Assuming 50% is passing
              passingMarks++;
            }
          }
        });
      }
    });

    return totalMarks > 0 ? Math.round((passingMarks / totalMarks) * 100 * 100) / 100 : 0;
  }

  onParentTabChange(ev: MatTabChangeEvent): void {
    this.selectedChildIndex$.next(ev.index);
  }

  trackByReport(index: number, report: ReportsModel): string {
    return `${report.studentNumber}-${report.id ?? index}`;
  }

  formatTerm(term: TermsModel): string {
    return formatTermLabel(term);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
