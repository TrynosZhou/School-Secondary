import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { ReportReleaseService } from '../services/report-release.service';
import * as ReportReleaseActions from './report-release.actions';

@Injectable()
export class ReportReleaseEffects {
  constructor(
    private actions$: Actions,
    private reportReleaseService: ReportReleaseService
  ) {}

  // Load Report Releases Effect
  loadReportReleases$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.loadReportReleases),
      mergeMap(() =>
        this.reportReleaseService.getReportReleases().pipe(
          map((reportReleases) =>
            ReportReleaseActions.loadReportReleasesSuccess({ reportReleases })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.loadReportReleasesFailure({
                error: error.message || 'Failed to load report releases',
              })
            )
          )
        )
      )
    )
  );

  // Create Report Release Effect
  createReportRelease$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.createReportRelease),
      mergeMap(({ createDto }) =>
        this.reportReleaseService.createReportRelease(createDto).pipe(
          map((reportRelease) =>
            ReportReleaseActions.createReportReleaseSuccess({ reportRelease })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.createReportReleaseFailure({
                error: error.message || 'Failed to create report release',
              })
            )
          )
        )
      )
    )
  );

  // Update Report Release Effect
  updateReportRelease$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.updateReportRelease),
      mergeMap(({ id, updateDto }) =>
        this.reportReleaseService.updateReportRelease(id, updateDto).pipe(
          map((reportRelease) =>
            ReportReleaseActions.updateReportReleaseSuccess({ reportRelease })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.updateReportReleaseFailure({
                error: error.message || 'Failed to update report release',
              })
            )
          )
        )
      )
    )
  );

  // Bulk Update Report Releases Effect
  bulkUpdateReportReleases$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.bulkUpdateReportReleases),
      mergeMap(({ bulkUpdateDto }) =>
        this.reportReleaseService.bulkUpdateReportReleases(bulkUpdateDto).pipe(
          map((reportReleases) =>
            ReportReleaseActions.bulkUpdateReportReleasesSuccess({ reportReleases })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.bulkUpdateReportReleasesFailure({
                error: error.message || 'Failed to bulk update report releases',
              })
            )
          )
        )
      )
    )
  );

  // Delete Report Release Effect
  deleteReportRelease$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.deleteReportRelease),
      mergeMap(({ id }) =>
        this.reportReleaseService.deleteReportRelease(id).pipe(
          map(() =>
            ReportReleaseActions.deleteReportReleaseSuccess({ id })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.deleteReportReleaseFailure({
                error: error.message || 'Failed to delete report release',
              })
            )
          )
        )
      )
    )
  );

  // Generate Exam Sessions Effect
  generateExamSessions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.generateExamSessions),
      mergeMap(({ year }) =>
        this.reportReleaseService.generateExamSessions(year).pipe(
          map((sessions) =>
            ReportReleaseActions.generateExamSessionsSuccess({ sessions })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.generateExamSessionsFailure({
                error: error.message || 'Failed to generate exam sessions',
              })
            )
          )
        )
      )
    )
  );

  // Generate Sessions From Terms Effect
  generateFromTerms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.generateFromTerms),
      mergeMap(() =>
        this.reportReleaseService.generateFromTerms().pipe(
          map((reportReleases) =>
            ReportReleaseActions.generateFromTermsSuccess({ reportReleases })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.generateFromTermsFailure({
                error: error.message || 'Failed to generate sessions from terms',
              })
            )
          )
        )
      )
    )
  );

  // Process Scheduled Releases Effect
  processScheduledReleases$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.processScheduledReleases),
      mergeMap(() =>
        this.reportReleaseService.processScheduledReleases().pipe(
          map((reportReleases) =>
            ReportReleaseActions.processScheduledReleasesSuccess({ reportReleases })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.processScheduledReleasesFailure({
                error: error.message || 'Failed to process scheduled releases',
              })
            )
          )
        )
      )
    )
  );

  // Check Release Status Effect
  checkReleaseStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportReleaseActions.checkReleaseStatus),
      mergeMap(({ termNumber, termYear, examType }) =>
        this.reportReleaseService.checkReleaseStatus(termNumber, termYear, examType).pipe(
          map((status) =>
            ReportReleaseActions.checkReleaseStatusSuccess({ status })
          ),
          catchError((error) =>
            of(
              ReportReleaseActions.checkReleaseStatusFailure({
                error: error.message || 'Failed to check release status',
              })
            )
          )
        )
      )
    )
  );
}
