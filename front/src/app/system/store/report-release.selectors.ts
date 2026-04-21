import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportReleaseState } from './report-release.reducer';
import { ReportReleaseSettings } from '../models/report-release-settings.model';

export const selectReportReleaseState = createFeatureSelector<ReportReleaseState>('reportRelease');

export const selectReportReleases = createSelector(
  selectReportReleaseState,
  (state: ReportReleaseState) => state?.reportReleases || []
);

export const selectReportReleasesLoading = createSelector(
  selectReportReleaseState,
  (state: ReportReleaseState) => state?.loading || false
);

export const selectReportReleasesError = createSelector(
  selectReportReleaseState,
  (state: ReportReleaseState) => state?.error || null
);

export const selectReportReleasesSuccess = createSelector(
  selectReportReleaseState,
  (state: ReportReleaseState) => state?.success || null
);

export const selectGeneratedSessions = createSelector(
  selectReportReleaseState,
  (state: ReportReleaseState) => state?.generatedSessions || []
);

export const selectReportReleaseById = createSelector(
  selectReportReleases,
  (reportReleases: ReportReleaseSettings[], { id }: { id: string }) =>
    reportReleases.find((rr: ReportReleaseSettings) => rr.id === id)
);

export const selectReleasedExamSessions = createSelector(
  selectReportReleases,
  (reportReleases: ReportReleaseSettings[]) => reportReleases.filter((rr: ReportReleaseSettings) => rr.isReleased)
);

export const selectUnreleasedExamSessions = createSelector(
  selectReportReleases,
  (reportReleases: ReportReleaseSettings[]) => reportReleases.filter((rr: ReportReleaseSettings) => !rr.isReleased)
);

export const selectScheduledReleases = createSelector(
  selectReportReleases,
  (reportReleases: ReportReleaseSettings[]) => 
    reportReleases.filter((rr: ReportReleaseSettings) => rr.scheduledReleaseDate && !rr.isReleased)
);

export const selectReportReleasesByYear = createSelector(
  selectReportReleases,
  (reportReleases: ReportReleaseSettings[], { year }: { year: number }) =>
    reportReleases.filter((rr: ReportReleaseSettings) => rr.termYear === year)
);

export const selectReportReleasesByTerm = createSelector(
  selectReportReleases,
  (reportReleases: ReportReleaseSettings[], { termNumber, termYear }: { termNumber: number; termYear: number }) =>
    reportReleases.filter((rr: ReportReleaseSettings) => rr.termNumber === termNumber && rr.termYear === termYear)
);
