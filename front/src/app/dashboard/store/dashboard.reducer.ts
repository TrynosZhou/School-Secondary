import { createReducer, on } from '@ngrx/store';
import { FinanceDataModel } from '../../finance/models/finance-data.model';
import { studentDashboardActions } from './dashboard.actions';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';

export interface State {
  studentSummary: StudentDashboardSummary | null;
  loading: boolean;
  loaded: boolean;
  errorMessage: string;
}

export const initialState: State = {
  studentSummary: null,
  loading: false,
  loaded: false,
  errorMessage: '',
};

export const dashboardReducer = createReducer(
  initialState,

  on(studentDashboardActions.fetchStudentDashboardSummary, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(
    studentDashboardActions.fetchStudentDashboardSummarySuccess,
    (state, { summary }) => ({
      ...state,
      studentSummary: summary,
      loading: false,
      loaded: true,
      error: null,
    })
  ),
  on(
    studentDashboardActions.fetchStudentDashboardSummaryFail,
    (state, { error }) => ({
      ...state,
      summary: null, // Clear summary on error or keep previous?
      loading: false,
      loaded: false, // Or true, depending on if you want to retry automatically
      error,
    })
  )
);
