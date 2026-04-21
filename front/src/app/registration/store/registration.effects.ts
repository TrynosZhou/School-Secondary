import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { TeachersService } from '../services/teachers.service';
import * as fromRegistrationActions from './registration.actions';
import { catchError, exhaustMap, map, of, switchMap, tap } from 'rxjs';
import { TeachersModel } from '../models/teachers.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentsService } from '../services/students.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class RegistrationEffects {
  constructor(
    private actions$: Actions,
    private teachersService: TeachersService,
    private studentsService: StudentsService,
    private snackBar: MatSnackBar
  ) {}

  fetchTeachers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.fetchTeachers),
      switchMap(() =>
        this.teachersService.getAllTeachers().pipe(
          map((teachers) =>
            fromRegistrationActions.fetchTeachersSuccess({ teachers })
          ),

          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.fetchTeachersFailure({ ...error }))
          )
        )
      )
    )
  );

  addTeachers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.addTeacherAction),
      switchMap((data) =>
        this.teachersService.addTeacher(data.teacher).pipe(
          tap((teacher) =>
            this.snackBar.open('Teacher added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((teacher) => {
            // console.log(teacher);
            return fromRegistrationActions.addTeacherActionSuccess({ teacher });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.addTeacherActionFail({ error }))
          )
        )
      )
    )
  );

  fetchStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.fetchStudents),
      switchMap(() =>
        this.studentsService.getAllStudents().pipe(
          map((students) =>
            fromRegistrationActions.fetchStudentsSuccess({ students })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.fetchStudentsFailure({ ...error }))
          )
        )
      )
    )
  );

  // Server-side, paginated search for students
  searchStudents$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.searchStudents),
      switchMap(({ query, page, limit }) =>
        this.studentsService.searchStudents(query, page ?? 1, limit ?? 50).pipe(
          map(({ items, total }) =>
            fromRegistrationActions.searchStudentsSuccess({
              students: items,
              total,
            })
          ),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.searchStudentsFailure({ ...error }))
          )
        )
      )
    )
  );

  addStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.addStudentAction),
      switchMap((data) =>
        this.studentsService.addStudent(data.student).pipe(
          tap((student) =>
            this.snackBar.open('Student Added Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((student) => {
            // console.log(teacher);
            return fromRegistrationActions.addStudentActionSuccess({ student });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.addStudentActionFail({ error }))
          )
        )
      )
    )
  );

  deleteStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.deleteStudentAction),
      switchMap((data) =>
        this.studentsService.deleteStudent(data.studentNumber).pipe(
          tap(() =>
            this.snackBar.open('Student Deleted Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map(({ studentNumber }) => {
            // console.log(teacher);
            return fromRegistrationActions.deleteStudentSuccess({
              studentNumber,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.deleteStudentFail({ ...error }))
          )
        )
      )
    )
  );

  deleteTeacher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.deleteTeacherAction),
      switchMap((data) =>
        this.teachersService.deleteTeacher(data.id).pipe(
          tap((teacher) =>
            this.snackBar.open('Teacher Deleted Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map(({ id }) => {
            // console.log(teacher);
            return fromRegistrationActions.deleteTeacherSuccess({
              id,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.deleteTeacherFail({ ...error }))
          )
        )
      )
    )
  );

  editTeacher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.editTeacherAction),
      switchMap((data) =>
        this.teachersService.editTeacher(data.teacher.id, data.teacher).pipe(
          tap((teacher) =>
            this.snackBar.open('Teacher Edited Successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            })
          ),
          map((teacher) => {
            // console.log(teacher);
            return fromRegistrationActions.editTeacherSuccess({
              teacher,
            });
          }),
          catchError((error: HttpErrorResponse) =>
            of(fromRegistrationActions.editTeacherFail({ ...error }))
          )
        )
      )
    )
  );

  editStudent$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromRegistrationActions.editStudentAction),
      switchMap((data) =>
        this.studentsService
          .editStudent(data.student.studentNumber, data.student)
          .pipe(
            tap((student) =>
              this.snackBar.open('Student Edited Successfully', 'OK', {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              })
            ),
            map((student) => {
              // console.log(teacher);
              return fromRegistrationActions.editStudentSuccess({
                student,
              });
            }),
            catchError((error: HttpErrorResponse) =>
              of(fromRegistrationActions.editStudentFail({ ...error }))
            )
          )
      )
    )
  );
}
