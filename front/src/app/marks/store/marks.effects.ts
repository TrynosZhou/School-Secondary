import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { MarksService } from '../services/marks.service';
import * as marksActions from './marks.actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class MarksEffects {
  constructor(
    private actions$: Actions,
    private marksService: MarksService,
    private snackBar: MatSnackBar
  ) {}

  fetchSubjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.fetchSubjects),
      switchMap(() =>
        this.marksService.getAllSubjects().pipe(
          map((subjects) => marksActions.fetchSubjectsSuccess({ subjects })),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.fetchSubjectsFailure({ ...error }))
          )
        )
      )
    )
  );

  addSubject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.addSubjectAction),
      switchMap((data) =>
        this.marksService.addSubject(data.subject).pipe(
          tap((data) =>
            this.snackBar.open(
              `${data.code} ${data.name} Added Successfully`,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            )
          ),
          map((subject) => {
            // console.log(teacher);
            return marksActions.addSubjectActionSuccess({ subject });
          }),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.addSubjectActionFail({ ...error }))
          )
        )
      )
    )
  );

  deleteSubject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.deleteSubjectAction),
      switchMap((data) =>
        this.marksService.deleteSubject(data.subject).pipe(
          tap((data) =>
            this.snackBar.open(`${data.code} Deleted Successfully`, 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map(({ code }) => {
            // console.log(teacher);
            return marksActions.deleteSubjectSuccess({
              code,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.deleteSubjectFail({ ...error }))
          )
        )
      )
    )
  );

  fetchSubjectMarksByClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.fetchSubjectMarksInClass),
      switchMap((data) =>
        this.marksService
          .getMarksInClassBySubject(
            data.name,
            data.num,
            data.year,
            data.subjectCode,
            data.examType,
            data.termId
          )
          .pipe(
            map((marks) =>
              marksActions.fetchSubjectMarksInClassSuccess({ marks })
            ),
            catchError((error: HttpErrorResponse) =>
              of(marksActions.fetchSubjectMarksInFail({ ...error }))
            )
          )
      )
    )
  );

  saveMark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.saveMarkAction),
      switchMap((data) =>
        this.marksService.saveMark(data.mark).pipe(
          map((mark) => marksActions.saveMarkActionSuccess({ mark })),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.saveMarkActionFail({ error, mark: data.mark }))
          )
        )
      )
    )
  );

  aditSubject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.editSubjectActions.editSubject),
      switchMap((data) =>
        this.marksService.editSubject(data.subject).pipe(
          tap((data) =>
            this.snackBar.open(
              `${data.code} ${data.name} Edited Successfully`,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            )
          ),
          map((subject) => {
            // console.log(teacher);
            return marksActions.editSubjectActions.editSubjectSuccess({
              subject,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.editSubjectActions.editSubjectFail({ ...error }))
          )
        )
      )
    )
  );

  deleteMark$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.deleteMarkActions.deleteMark),
      switchMap(({ mark }) =>
        this.marksService.deleteMark(mark).pipe(
          tap(() => {
            const studentLabel =
              mark.student?.name != null && mark.student?.surname != null
                ? `${mark.student.name} ${mark.student.surname}`
                : mark.student?.name ?? mark.student?.surname ?? 'Student';
            const markValue = mark.mark != null ? String(mark.mark) : '?';
            const subjectLabel =
              typeof mark.subject === 'object' && mark.subject?.name != null
                ? mark.subject.name
                : typeof mark.subject === 'string'
                  ? mark.subject
                  : 'subject';
            this.snackBar.open(
              `${studentLabel}'s ${markValue} in ${subjectLabel} deleted`,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
          }),
          map((deletedMark) =>
            marksActions.deleteMarkActions.deleteMarkSuccess({
              mark: deletedMark,
            })
          ),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.deleteMarkActions.deleteMarkFail({ ...error }))
          )
        )
      )
    )
  );

  fetchPerfomanceData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.perfomanceActions.fetchPerfomanceData),
      switchMap((par) =>
        this.marksService
          .getPerfomanceData(
            par.num,
            par.year,
            par.name,
            par.examType,
            par.termId
          )
          .pipe(
            map((data) =>
              marksActions.perfomanceActions.fetchPerfomanceDataSuccess({
                data,
              })
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                marksActions.perfomanceActions.fetchPerfomanceDataFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  fetchClassComments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.saveCommentActions.fetchClassComments),
      switchMap((data) =>
        this.marksService
          .fetchClassComments(data.name, data.num, data.year, data.examType)
          .pipe(
            map((comments) =>
              marksActions.saveCommentActions.fetchClassCommentsSuccess({
                comments,
              })
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                marksActions.saveCommentActions.fetchClassCommentsFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  saveComment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.saveCommentActions.saveComment),
      switchMap((data) =>
        this.marksService.saveComment(data.comment).pipe(
          tap((data) =>
            this.snackBar.open(
              `${data.comment} for Student ${data.student.name} ${data.student.surname} Saved`,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            )
          ),
          map((comment) => {
            // console.log(teacher);
            return marksActions.saveCommentActions.saveCommentSuccess({
              comment,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(marksActions.saveCommentActions.saveCommentFail({ ...error }))
          )
        )
      )
    )
  );

  fetchMarksProgress$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.fetchMarksProgressActions.fetchMarksProgress),
      switchMap((data) =>
        this.marksService
          .getMarksProgress(
            data.num,
            data.year,
            data.clas,
            data.examType,
            data.termId
          )
          .pipe(
            map((marksProgress) =>
              marksActions.fetchMarksProgressActions.fetchMarksProgressSuccess({
                marksProgress,
              })
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                marksActions.fetchMarksProgressActions.fetchMarksProgressFail({
                  ...error,
                })
              )
            )
          )
      )
    )
  );

  fetchStudentMarks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(marksActions.studentMarksActions.fetchStudentMarks),
      switchMap((data) =>
        this.marksService.getStudentMarks(data.studentNumber).pipe(
          map((marks) =>
            marksActions.studentMarksActions.fetchStudentMarksSuccess({
              marks,
            })
          ),
          catchError((error: HttpErrorResponse) =>
            of(
              marksActions.studentMarksActions.fetchStudentMarksFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );
}
