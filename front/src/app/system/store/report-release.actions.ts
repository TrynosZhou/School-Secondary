import { createAction, props } from '@ngrx/store';
import { ReportReleaseSettings, CreateReportReleaseDto, UpdateReportReleaseDto, BulkUpdateReportReleaseDto, GeneratedExamSession } from '../models/report-release-settings.model';

// Load Actions
export const loadReportReleases = createAction('[Report Release] Load Report Releases');
export const loadReportReleasesSuccess = createAction(
  '[Report Release] Load Report Releases Success',
  props<{ reportReleases: ReportReleaseSettings[] }>()
);
export const loadReportReleasesFailure = createAction(
  '[Report Release] Load Report Releases Failure',
  props<{ error: string }>()
);

// Create Actions
export const createReportRelease = createAction(
  '[Report Release] Create Report Release',
  props<{ createDto: CreateReportReleaseDto }>()
);
export const createReportReleaseSuccess = createAction(
  '[Report Release] Create Report Release Success',
  props<{ reportRelease: ReportReleaseSettings }>()
);
export const createReportReleaseFailure = createAction(
  '[Report Release] Create Report Release Failure',
  props<{ error: string }>()
);

// Update Actions
export const updateReportRelease = createAction(
  '[Report Release] Update Report Release',
  props<{ id: string; updateDto: UpdateReportReleaseDto }>()
);
export const updateReportReleaseSuccess = createAction(
  '[Report Release] Update Report Release Success',
  props<{ reportRelease: ReportReleaseSettings }>()
);
export const updateReportReleaseFailure = createAction(
  '[Report Release] Update Report Release Failure',
  props<{ error: string }>()
);

// Bulk Update Actions
export const bulkUpdateReportReleases = createAction(
  '[Report Release] Bulk Update Report Releases',
  props<{ bulkUpdateDto: BulkUpdateReportReleaseDto }>()
);
export const bulkUpdateReportReleasesSuccess = createAction(
  '[Report Release] Bulk Update Report Releases Success',
  props<{ reportReleases: ReportReleaseSettings[] }>()
);
export const bulkUpdateReportReleasesFailure = createAction(
  '[Report Release] Bulk Update Report Releases Failure',
  props<{ error: string }>()
);

// Delete Actions
export const deleteReportRelease = createAction(
  '[Report Release] Delete Report Release',
  props<{ id: string }>()
);
export const deleteReportReleaseSuccess = createAction(
  '[Report Release] Delete Report Release Success',
  props<{ id: string }>()
);
export const deleteReportReleaseFailure = createAction(
  '[Report Release] Delete Report Release Failure',
  props<{ error: string }>()
);

// Generate Sessions From Terms Actions
export const generateFromTerms = createAction(
  '[Report Release] Generate Sessions From Terms'
);
export const generateFromTermsSuccess = createAction(
  '[Report Release] Generate Sessions From Terms Success',
  props<{ reportReleases: ReportReleaseSettings[] }>()
);
export const generateFromTermsFailure = createAction(
  '[Report Release] Generate Sessions From Terms Failure',
  props<{ error: string }>()
);

// Generate Sessions Actions
export const generateExamSessions = createAction(
  '[Report Release] Generate Exam Sessions',
  props<{ year?: number }>()
);
export const generateExamSessionsSuccess = createAction(
  '[Report Release] Generate Exam Sessions Success',
  props<{ sessions: GeneratedExamSession[] }>()
);
export const generateExamSessionsFailure = createAction(
  '[Report Release] Generate Exam Sessions Failure',
  props<{ error: string }>()
);

// Process Scheduled Releases Actions
export const processScheduledReleases = createAction('[Report Release] Process Scheduled Releases');
export const processScheduledReleasesSuccess = createAction(
  '[Report Release] Process Scheduled Releases Success',
  props<{ reportReleases: ReportReleaseSettings[] }>()
);
export const processScheduledReleasesFailure = createAction(
  '[Report Release] Process Scheduled Releases Failure',
  props<{ error: string }>()
);

// Check Release Status Actions
export const checkReleaseStatus = createAction(
  '[Report Release] Check Release Status',
  props<{ termNumber: number; termYear: number; examType: string }>()
);
export const checkReleaseStatusSuccess = createAction(
  '[Report Release] Check Release Status Success',
  props<{ status: { isReleased: boolean } }>()
);
export const checkReleaseStatusFailure = createAction(
  '[Report Release] Check Release Status Failure',
  props<{ error: string }>()
);

// Clear Error Actions
export const clearReportReleaseError = createAction('[Report Release] Clear Error');
export const clearReportReleaseSuccess = createAction('[Report Release] Clear Success');
