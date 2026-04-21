import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subscription,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';
import {
  selectStudentDashboardLoaded,
  selectStudentDashboardLoading,
  selectStudentDashboardSummary,
} from '../store/dashboard.selectors';
import { studentDashboardActions } from '../store/dashboard.actions';
import { User } from 'src/app/auth/models/user.model';

import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import {
  selectCurrentEnrolment,
  selectCurrentEnrolmentLoaded,
  selectCurrentEnrolmentLoading,
} from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';
import {
  invoiceActions,
  receiptActions,
} from 'src/app/finance/store/finance.actions';
import { ContinuousAssessmentService, ContinuousAssessmentAnalytics } from 'src/app/marks/continuous-assessment/continuous-assessment.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  public dashboardSummary$: Observable<StudentDashboardSummary | null>;
  public summaryLoading$: Observable<boolean>;
  public summaryLoaded$: Observable<boolean>;

  public studentDetails$: Observable<StudentsModel | null>;
  public currentEnrolment$: Observable<EnrolsModel | null>;
  public enrolmentLoading$: Observable<boolean>;
  public enrolmentLoaded$: Observable<boolean>;

  public caAnalytics: ContinuousAssessmentAnalytics | null = null;
  public caLoading = false;
  public liabilitiesLoading = false;
  public liabilities: Array<{
    description: string;
    amount: number;
    status: string;
  }> = [];

  private subscriptions: Subscription = new Subscription();

  constructor(private store: Store, private caService: ContinuousAssessmentService) {
    this.dashboardSummary$ = this.store.select(selectStudentDashboardSummary);
    this.summaryLoading$ = this.store.select(selectStudentDashboardLoading);
    this.summaryLoaded$ = this.store.select(selectStudentDashboardLoaded);

    this.currentEnrolment$ = this.store.select(selectCurrentEnrolment);
    this.enrolmentLoading$ = this.store.select(selectCurrentEnrolmentLoading);
    this.enrolmentLoaded$ = this.store.select(selectCurrentEnrolmentLoaded);

    this.studentDetails$ = this.currentEnrolment$.pipe(
      map((enrolment) => (enrolment ? enrolment.student : null))
    );
  }

  ngOnInit(): void {
    this.subscriptions.add(
      (this.store.select(selectUser) as Observable<User | null>)
        .pipe(
          // Filter for a valid user with an ID
          filter((user): user is User => !!user && !!user.id),
          // Take only the first emission to prevent multiple dispatches
          take(1),
          // Use a tap operator to perform side-effects (dispatching actions)
          // This runs as soon as a valid user is found
          tap((user) => {
            const studentNumber = user.id;

            // Fetch only this student's invoices and receipts (more efficient than fetching all)
            this.store.dispatch(
              invoiceActions.fetchStudentInvoices({
                studentNumber,
              })
            );
            this.store.dispatch(
              receiptActions.fetchStudentReceipts({
                studentNumber,
              })
            );
            this.store.dispatch(
              studentDashboardActions.fetchStudentDashboardSummary({
                studentNumber,
              })
            );
            this.store.dispatch(
              currentEnrolementActions.fetchCurrentEnrolment({
                studentNumber,
              })
            );
            this.loadContinuousAssessmentAnalytics(studentNumber);
          })
        )
        .subscribe()
    );

    // REVISED Dashboard Summary & Enrolment Data Fetching (already good, just including for completeness)
    this.subscriptions.add(
      (this.store.select(selectUser) as Observable<User | null>)
        .pipe(
          filter((user): user is User => !!user && !!user.id),
          map((user: User) => user.id),
          distinctUntilChanged(),
          switchMap((studentId) =>
            combineLatest([
              this.store.select(selectStudentDashboardLoaded),
              this.store.select(selectStudentDashboardLoading),
              this.store.select(selectCurrentEnrolmentLoaded),
              this.store.select(selectCurrentEnrolmentLoading),
            ]).pipe(
              filter(
                ([
                  summaryLoaded,
                  summaryLoading,
                  enrolmentLoaded,
                  enrolmentLoading,
                ]) =>
                  (!summaryLoaded && !summaryLoading) ||
                  (!enrolmentLoaded && !enrolmentLoading)
              ),
              take(1),
              tap(
                ([
                  summaryLoaded,
                  summaryLoading,
                  enrolmentLoaded,
                  enrolmentLoading,
                ]) => {
                  if (!summaryLoaded && !summaryLoading) {
                    this.store.dispatch(
                      studentDashboardActions.fetchStudentDashboardSummary({
                        studentNumber: studentId,
                      })
                    );
                  }
                  if (!enrolmentLoaded && !enrolmentLoading) {
                    this.store.dispatch(
                      currentEnrolementActions.fetchCurrentEnrolment({
                        studentNumber: studentId,
                      })
                    );
                  }
                }
              )
            )
          )
        )
        .subscribe()
    );
  }

  private loadContinuousAssessmentAnalytics(studentNumber: string) {
    this.caLoading = true;
    this.caService.getStudentAnalytics(studentNumber).subscribe({
      next: (analytics) => {
        this.caAnalytics = analytics;
        this.caLoading = false;
      },
      error: () => {
        this.caLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  buildStudyPriorityTip(summary: StudentDashboardSummary): string {
    const bestPosition = Number(summary?.academicSummary?.bestPosition?.position);
    if (!Number.isFinite(bestPosition))
      return 'Keep consistent study sessions this term.';
    if (bestPosition <= 10)
      return 'Great progress. Focus on revision to maintain top performance.';
    if (bestPosition <= 20)
      return 'You are doing well. Prioritize weak subjects this week.';
    return 'Start with your lowest-performing subjects and ask for teacher support early.';
  }

  buildFinanceRiskTip(summary: StudentDashboardSummary): string {
    const amountOwed = summary?.financialSummary?.amountOwed ?? 0;
    if (amountOwed <= 0) return 'No immediate finance risk. Keep receipts up to date.';
    if (amountOwed < 100)
      return 'Small outstanding balance. Try to clear it before next billing cycle.';
    return 'Outstanding balance is high. Engage guardians/school bursar soon to avoid disruptions.';
  }
}
