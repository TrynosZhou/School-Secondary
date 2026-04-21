import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromDashboardReducer from './dashboard.reducer';

export const dashboardState =
  createFeatureSelector<fromDashboardReducer.State>('dashboard');

export const selectErrorMsg = createSelector(
  dashboardState,
  (state: fromDashboardReducer.State) => state.errorMessage
);

export const selectStudentDashboardSummary = createSelector(
  dashboardState,
  (state: fromDashboardReducer.State) => state.studentSummary
);

export const selectFinancialSummary = createSelector(
  dashboardState,
  (state: fromDashboardReducer.State) => state.studentSummary?.financialSummary
);

export const selectAcademicSummary = createSelector(
  dashboardState,
  (state: fromDashboardReducer.State) => state.studentSummary?.academicSummary
);

export const selectStudentDashboardLoading = createSelector(
  dashboardState,
  (state: fromDashboardReducer.State) => state.loading
);

export const selectStudentDashboardLoaded = createSelector(
  dashboardState,
  (state: fromDashboardReducer.State) => state.loaded
);
