import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import {
  selectCurrentEnrolment,
  selectCurrentEnrolmentLoaded,
  selectCurrentEnrolmentLoading,
} from 'src/app/enrolment/store/enrolment.selectors';
import { currentEnrolementActions } from 'src/app/enrolment/store/enrolment.actions';
import {
  invoiceActions,
  receiptActions,
} from 'src/app/finance/store/finance.actions';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';
import { studentDashboardActions } from '../store/dashboard.actions';
import {
  selectStudentDashboardLoaded,
  selectStudentDashboardLoading,
  selectStudentDashboardSummary,
} from '../store/dashboard.selectors';

@Injectable({
  providedIn: 'root',
})
export class StudentDashboardFacade {
  dashboardSummary$: Observable<StudentDashboardSummary | null> = this.store.select(
    selectStudentDashboardSummary
  );
  summaryLoading$: Observable<boolean> = this.store.select(
    selectStudentDashboardLoading
  );
  summaryLoaded$: Observable<boolean> = this.store.select(
    selectStudentDashboardLoaded
  );

  currentEnrolment$: Observable<EnrolsModel | null> = this.store.select(
    selectCurrentEnrolment
  );
  enrolmentLoading$: Observable<boolean> = this.store.select(
    selectCurrentEnrolmentLoading
  );
  enrolmentLoaded$: Observable<boolean> = this.store.select(
    selectCurrentEnrolmentLoaded
  );

  constructor(private store: Store) {}

  initializeStudent(studentNumber: string): void {
    this.store.dispatch(invoiceActions.fetchStudentInvoices({ studentNumber }));
    this.store.dispatch(receiptActions.fetchStudentReceipts({ studentNumber }));
    this.store.dispatch(
      studentDashboardActions.fetchStudentDashboardSummary({ studentNumber })
    );
    this.store.dispatch(
      currentEnrolementActions.fetchCurrentEnrolment({ studentNumber })
    );
  }

  getStudentDetails$(): Observable<StudentsModel | null> {
    return this.currentEnrolment$.pipe(
      map((enrolment) => (enrolment ? enrolment.student : null))
    );
  }
}
