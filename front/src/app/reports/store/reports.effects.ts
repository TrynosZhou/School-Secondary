import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as reportsActions from './reports.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ReportsService } from '../services/reports.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ReportsEffects {
  constructor(
    private actions$: Actions,
    private reportsService: ReportsService,
    private snackBar: MatSnackBar
  ) {}

  generateReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.generateReports),
      switchMap((data) =>
        this.reportsService
          .generateReports(
            data.name,
            data.num,
            data.year,
            data.examType,
            data.termId
          )
          .pipe(
            tap((data) =>
              this.snackBar.open(
                `${data.length} Generated Successfully`,
                'OK',
                {
                  duration: 3000,
                  verticalPosition: 'top',
                  horizontalPosition: 'center',
                }
              )
            ),
            map((reports) =>
              reportsActions.generateReportsSuccess({ reports })
            ),
            catchError((error: HttpErrorResponse) =>
              of(reportsActions.generateReportsFail({ ...error }))
            )
          )
      )
    )
  );

  saveReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.saveReportActions.saveReports),
      switchMap((data) =>
        this.reportsService
          .saveReports(
            data.name,
            data.num,
            data.year,
            data.examType,
            data.reports,
            data.termId
          )
          .pipe(
            map((reports) =>
              reportsActions.saveReportActions.saveReportsSuccess({ reports })
            ),
            catchError((error: HttpErrorResponse) =>
              of(reportsActions.saveReportActions.saveReportsFail({ ...error }))
            )
          )
      )
    )
  );

  viewReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.viewReportsActions.viewReports),
      switchMap((data) =>
        this.reportsService
          .viewReports(
            data.name,
            data.num,
            data.year,
            data.examType,
            data.termId
          )
          .pipe(
            map((reports) =>
              reportsActions.viewReportsActions.viewReportsSuccess({ reports })
            ),
            catchError((error: HttpErrorResponse) =>
              of(reportsActions.saveReportActions.saveReportsFail({ ...error }))
            )
          )
      )
    )
  );

  fetchStudentReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.viewReportsActions.fetchStudentReports),
      switchMap((data) =>
        this.reportsService.getStudentReports(data.studentNumber).pipe(
          map((reports) =>
            reportsActions.viewReportsActions.fetchStudentReportsSuccess({
              reports,
            })
          ),
          catchError((error: HttpErrorResponse) =>
            of(
              reportsActions.viewReportsActions.fetchStudentReportsFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );

  downloadReport$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.downloadReportActions.downloadReport),
      switchMap((data) =>
        this.reportsService
          .downloadReport(
            data.name,
            data.num,
            data.year,
            data.examType,
            data.studentNumber,
            data.termId
          )
          // .unsubscribe()
          .pipe(
            map((result) =>
              reportsActions.downloadReportActions.downloadReportSuccess()
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                reportsActions.downloadReportActions.downloadReportFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  saveHeadComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.saveHeadCommentActions.saveHeadComment),
      switchMap((data) =>
        this.reportsService.saveHeadComment(data.comment).pipe(
          map((report) =>
            reportsActions.saveHeadCommentActions.saveHeadCommentSuccess({
              report,
            })
          ),
          catchError((error: HttpErrorResponse) =>
            of(
              reportsActions.saveHeadCommentActions.saveHeadCommentFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );

  // New effect: save teacher / class comment directly on the report
  saveTeacherComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(reportsActions.saveTeacherCommentActions.saveTeacherComment),
      switchMap((data) =>
        this.reportsService.saveTeacherComment(data.comment).pipe(
          map((report) =>
            reportsActions.saveTeacherCommentActions.saveTeacherCommentSuccess(
              {
                report,
              }
            )
          ),
          catchError((error: HttpErrorResponse) =>
            of(
              reportsActions.saveTeacherCommentActions.saveTeacherCommentFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );
}
