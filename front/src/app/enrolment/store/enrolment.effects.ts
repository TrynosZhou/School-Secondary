import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as fromEnrolmentActions from './enrolment.actions';
import { catchError, concatMap, map, of, switchMap, tap } from 'rxjs';
import { ClassesService } from '../services/classes.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TermsService } from '../services/terms.service';
import { EnrolService } from '../services/enrol.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class EnrolmentEffects {
  constructor(
    private actions$: Actions,
    private classesService: ClassesService,
    private termsService: TermsService,
    private enrolService: EnrolService,
    private snackBar: MatSnackBar
  ) {}

  fetchClasses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchClasses),
      switchMap(() =>
        this.classesService.getAllClasses().pipe(
          // map((classes) =>
          //   fromEnrolmentActions.fetchClassesSuccess({ classes })
          // ),
          map((classes) => {
            // Sort the classes array here
            const sortedClasses = [...classes].sort((a, b) => {
              // Replace 'name' with the property you want to sort by
              // and adjust the sorting logic as needed.
              if (a.name < b.name) {
                return -1;
              }
              if (a.name > b.name) {
                return 1;
              }
              return 0; // Equal
            });

            return fromEnrolmentActions.fetchClassesSuccess({
              classes: sortedClasses,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.fetchClassesFailure({ ...error }))
          )
        )
      )
    )
  );

  addClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.addClassAction),
      switchMap((data) =>
        this.classesService.addClass(data.clas).pipe(
          tap((data) =>
            this.snackBar.open('Class Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((clas) => {
            // console.log(teacher);
            return fromEnrolmentActions.addClassActionSuccess({ clas });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.addClassActionFail({ ...error }))
          )
        )
      )
    )
  );

  deleteClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.deleteClassAction),
      switchMap((data) =>
        this.classesService.deleteClass(data.name).pipe(
          tap((data) =>
            this.snackBar.open('Class Deleted Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map(({ name }) => {
            // console.log(teacher);
            return fromEnrolmentActions.deleteClassSuccess({
              name,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.deleteClassFail({ ...error }))
          )
        )
      )
    )
  );

  editClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.editClassAction),
      switchMap((data) =>
        this.classesService.editClass(data.clas).pipe(
          tap((data) =>
            this.snackBar.open('Class Edited Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((clas) => {
            // console.log(teacher);
            return fromEnrolmentActions.editClassSuccess({
              clas,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.editClassFail({ ...error }))
          )
        )
      )
    )
  );

  fetchTerms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchTerms),
      switchMap(() =>
        this.termsService.getAllTerms().pipe(
          // map((terms) => fromEnrolmentActions.fetchTermsSuccess({ terms })),
          map((terms) => {
            // Sort the terms array here
            const sortedTerms = [...terms].sort((a, b) => {
              // Replace 'startDate' with the property you want to sort by
              // and adjust the sorting logic as needed.
              if (b.startDate < a.startDate) {
                return -1;
              }
              if (a.startDate > b.startDate) {
                return 1;
              }
              return 0; // Equal
            });

            return fromEnrolmentActions.fetchTermsSuccess({
              terms: sortedTerms,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.fetchTermsFailure({ ...error }))
          )
        )
      )
    )
  );

  fetchCurrentTerm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.currentTermActions.fetchCurrentTerm),
      switchMap(() =>
        this.termsService.getCurrentTerm().pipe(
          map((term) => {
            return fromEnrolmentActions.currentTermActions.fetchCurrentTermSuccess(
              {
                term,
              }
            );
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              fromEnrolmentActions.currentTermActions.fetchCurrentTermFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );

  addTerm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.addTermAction),
      switchMap((data) =>
        this.termsService.addTerm(data.term).pipe(
          tap((data) =>
            this.snackBar.open('Term Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((term) => {
            // console.log(teacher);
            return fromEnrolmentActions.addTermActionSuccess({ term });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.addTermActionFail({ ...error }))
          )
        )
      )
    )
  );

  editTerm$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.editTermAction),
      switchMap((data) =>
        this.termsService.editTerm(data.term).pipe(
          tap((data) =>
            this.snackBar.open('Term Edited Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((term) => {
            // console.log(teacher);
            return fromEnrolmentActions.editTermSuccess({
              term,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.editTermFail({ ...error }))
          )
        )
      )
    )
  );

  fetchEnrolmentByClass$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.getEnrolmentByClass),
      switchMap(({ name, num, year, termId }) =>
        this.enrolService.getEnrolmentByClass(name, num, year, termId).pipe(
          map((enrols) =>
            fromEnrolmentActions.getEnrolmentByClassSuccess({ enrols })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.getEnrolmentByClassFail({ ...error }))
          )
        )
      )
    )
  );

  enrolStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.enrolStudents),
      switchMap((data) =>
        this.enrolService.enrolStudents(data.enrols).pipe(
          tap((data) =>
            this.snackBar.open('Students Enrolled Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((enrols) => {
            // console.log(teacher);
            return fromEnrolmentActions.enrolStudentsSuccess({ enrols });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.enrolStudentsFail({ ...error }))
          )
        )
      )
    )
  );

  fetchTotalEnrols$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchTotalEnrols),
      concatMap(({ num, year, termId }) => {
        return this.enrolService.getTotalEnrolment(num, year, termId).pipe(
          // And this method call
          map((summary) =>
            fromEnrolmentActions.fetchTotalEnrolsSuccess({ summary })
          ),
          catchError((error) =>
            of(fromEnrolmentActions.fetchTotalEnrolsFailure({ error }))
          )
        );
      })
    );
  });

  // fetchTotalEnrolment$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(fromEnrolmentActions.fetchTotalEnrols),
  //     switchMap((data) =>
  //       this.enrolService.getTotalEnrolment(data.num, data.year).pipe(
  //         map((summary) =>
  //           fromEnrolmentActions.fetchTotalEnrolsSuccess({ summary })
  //         ),
  //         catchError((error: HttpErrorResponse) =>
  //           of(fromEnrolmentActions.fetchTotalEnrolsFailure({ ...error }))
  //         )
  //       )
  //     )
  //   )
  // );

  fetchEnrolsStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.fetchEnrolsStats),
      switchMap(() =>
        this.enrolService.getEnrolsStats().pipe(
          map((stats) =>
            fromEnrolmentActions.fetchEnrolsStatsSuccess({ stats })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromEnrolmentActions.getEnrolmentByClassFail({ ...error }))
          )
        )
      )
    )
  );

  unEnrolStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.UnenrolStudentActions.unenrolStudent),
      // 'action' here is the original action dispatched, containing { enrol: EnrolsModel }
      switchMap((action) =>
        this.enrolService.unenrolStudent(action.enrol).pipe(
          tap(() =>
            // tap receives the service response, but we don't need it for the snackbar
            this.snackBar.open('Student Removed From Class', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          // CORRECTED LINE: Pass the original 'action.enrol' to the success action
          map(() =>
            fromEnrolmentActions.UnenrolStudentActions.unenrolStudentSuccess({
              enrol: action.enrol,
            })
          ),
          catchError((error: HttpErrorResponse) => {
            this.snackBar.open(
              'Error Removing Student From Class due to : ' + error.statusText,
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            );
            return of(
              fromEnrolmentActions.UnenrolStudentActions.unenrolStudentFail({
                ...error,
              })
            );
          })
        )
      )
    )
  );

  migrateClassEnrolment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.migrateClassActions.migrateClassEnrolment),
      switchMap((data) =>
        this.enrolService
          .migrateClass(
            data.fromName,
            data.fromNum,
            data.fromYear,
            data.fromTermId,
            data.toName,
            data.toNum,
            data.toYear,
            data.toTermId,
          )
          .pipe(
            map((response) => {
              return fromEnrolmentActions.migrateClassActions.migrateClassEnrolmentSuccess(
                {
                  result: !!response?.result,
                  message: response?.message,
                }
              );
            }),
            catchError((error: HttpErrorResponse) =>
              of(
                fromEnrolmentActions.migrateClassActions.migrateClassEnrolmentFail(
                  {
                    ...error,
                  }
                )
              )
            )
          )
      )
    )
  );

  fetchCurrentEnrolment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        fromEnrolmentActions.currentEnrolementActions.fetchCurrentEnrolment
      ),
      switchMap((data) =>
        this.enrolService.getCurrentEnrolment(data.studentNumber).pipe(
          map((enrols) => {
            return fromEnrolmentActions.currentEnrolementActions.fetchCurrentEnrolmentSuccess(
              {
                enrols,
              }
            );
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              fromEnrolmentActions.currentEnrolementActions.fetchCurrentEnrolmentFail(
                {
                  ...error,
                }
              )
            )
          )
        )
      )
    )
  );

  editCurrentEnrolment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        fromEnrolmentActions.currentEnrolementActions.updateCurrentEnrolment
      ),
      switchMap((data) =>
        this.enrolService.updateCurrentEnrolment(data.enrol).pipe(
          tap((enrol) =>
            this.snackBar.open(
              'Enrolment updated' + (enrol.name ? ` (${enrol.name}, ${enrol.residence})` : ''),
              'OK',
              {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              }
            )
          ),
          map((enrol) => {
            // console.log(teacher);
            return fromEnrolmentActions.currentEnrolementActions.updateCurrentEnrolmentSuccess(
              {
                enrol,
              }
            );
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              fromEnrolmentActions.currentEnrolementActions.updateCurrentEnrolmentFail(
                { ...error }
              )
            )
          )
        )
      )
    )
  );

  fetchTermEnrols$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromEnrolmentActions.termEnrolsActions.fetchTermEnrols),
      switchMap((data) =>
        this.enrolService.getTermEnrolments(data.num, data.year, data.termId).pipe(
          map((termEnrols) => {
            return fromEnrolmentActions.termEnrolsActions.fetchTermEnrolsSuccess(
              {
                termEnrols,
              }
            );
          }),
          catchError((error: HttpErrorResponse) =>
            of(
              fromEnrolmentActions.termEnrolsActions.fetchTermEnrolsFail({
                ...error,
              })
            )
          )
        )
      )
    )
  );
}
