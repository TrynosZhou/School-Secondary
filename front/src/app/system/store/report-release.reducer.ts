import { createReducer, on, Action } from '@ngrx/store';
import { ReportReleaseSettings } from '../models/report-release-settings.model';
import * as ReportReleaseActions from './report-release.actions';

export interface ReportReleaseState {
  reportReleases: ReportReleaseSettings[];
  loading: boolean;
  error: string | null;
  success: string | null;
  generatedSessions: any[];
}

export const initialState: ReportReleaseState = {
  reportReleases: [],
  loading: false,
  error: null,
  success: null,
  generatedSessions: [],
};

const _reportReleaseReducer = createReducer(
  initialState,

  // Load Actions
  on(ReportReleaseActions.loadReportReleases, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ReportReleaseActions.loadReportReleasesSuccess, (state, { reportReleases }) => ({
    ...state,
    reportReleases,
    loading: false,
    error: null,
  })),
  on(ReportReleaseActions.loadReportReleasesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create Actions
  on(ReportReleaseActions.createReportRelease, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.createReportReleaseSuccess, (state, { reportRelease }) => ({
    ...state,
    reportReleases: [...state.reportReleases, reportRelease],
    loading: false,
    error: null,
    success: 'Report release setting created successfully',
  })),
  on(ReportReleaseActions.createReportReleaseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update Actions
  on(ReportReleaseActions.updateReportRelease, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.updateReportReleaseSuccess, (state, { reportRelease }) => ({
    ...state,
    reportReleases: state.reportReleases.map((rr) =>
      rr.id === reportRelease.id ? reportRelease : rr
    ),
    loading: false,
    error: null,
    success: 'Report release setting updated successfully',
  })),
  on(ReportReleaseActions.updateReportReleaseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Bulk Update Actions
  on(ReportReleaseActions.bulkUpdateReportReleases, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.bulkUpdateReportReleasesSuccess, (state, { reportReleases }) => {
    const updatedReportReleases = [...state.reportReleases];
    reportReleases.forEach((updated) => {
      const index = updatedReportReleases.findIndex((rr) => rr.id === updated.id);
      if (index !== -1) {
        updatedReportReleases[index] = updated;
      }
    });
    return {
      ...state,
      reportReleases: updatedReportReleases,
      loading: false,
      error: null,
      success: 'Report release settings updated successfully',
    };
  }),
  on(ReportReleaseActions.bulkUpdateReportReleasesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete Actions
  on(ReportReleaseActions.deleteReportRelease, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.deleteReportReleaseSuccess, (state, { id }) => ({
    ...state,
    reportReleases: state.reportReleases.filter((rr) => rr.id !== id),
    loading: false,
    error: null,
    success: 'Report release setting deleted successfully',
  })),
  on(ReportReleaseActions.deleteReportReleaseFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Generate Sessions Actions
  on(ReportReleaseActions.generateExamSessions, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.generateExamSessionsSuccess, (state, { sessions }) => ({
    ...state,
    generatedSessions: sessions,
    loading: false,
    error: null,
    success: 'Exam sessions generated successfully',
  })),
  on(ReportReleaseActions.generateExamSessionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Generate Sessions From Terms Actions
  on(ReportReleaseActions.generateFromTerms, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.generateFromTermsSuccess, (state, { reportReleases }) => ({
    ...state,
    reportReleases: [...state.reportReleases, ...reportReleases],
    loading: false,
    error: null,
    success: 'Report release settings generated from terms successfully',
  })),
  on(ReportReleaseActions.generateFromTermsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Process Scheduled Releases Actions
  on(ReportReleaseActions.processScheduledReleases, (state) => ({
    ...state,
    loading: true,
    error: null,
    success: null,
  })),
  on(ReportReleaseActions.processScheduledReleasesSuccess, (state, { reportReleases }) => {
    const updatedReportReleases = [...state.reportReleases];
    reportReleases.forEach((updated) => {
      const index = updatedReportReleases.findIndex((rr) => rr.id === updated.id);
      if (index !== -1) {
        updatedReportReleases[index] = updated;
      }
    });
    return {
      ...state,
      reportReleases: updatedReportReleases,
      loading: false,
      error: null,
      success: 'Scheduled releases processed successfully',
    };
  }),
  on(ReportReleaseActions.processScheduledReleasesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear Actions
  on(ReportReleaseActions.clearReportReleaseError, (state) => ({
    ...state,
    error: null,
  })),
  on(ReportReleaseActions.clearReportReleaseSuccess, (state) => ({
    ...state,
    success: null,
  }))
);

export function reportReleaseReducer(
  state: ReportReleaseState | undefined,
  action: Action
): ReportReleaseState {
  return _reportReleaseReducer(state, action);
}
