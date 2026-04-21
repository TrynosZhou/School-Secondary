import { createAction, props } from '@ngrx/store';
import { TeachersModel } from '../models/teachers.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentsModel } from '../models/students.model';

export const fetchTeachers = createAction(
  '[Teachers Registration] fetch teachers list'
);

export const fetchTeachersSuccess = createAction(
  '[Teachers Registration] fetch teachers list success',
  props<{ teachers: TeachersModel[] }>()
);

export const fetchTeachersFailure = createAction(
  '[Teachers Registration] fetch teachers list failure',
  props<{ error: HttpErrorResponse }>()
);

export const addTeacherAction = createAction(
  '[Add Teacher] add teachers',
  props<{ teacher: TeachersModel }>()
);

export const addTeacherActionSuccess = createAction(
  '[Add Teacher] add teacher success',
  props<{ teacher: TeachersModel }>()
);

export const addTeacherActionFail = createAction(
  '[Add Teacher] add teacher fail',
  props<{ error: HttpErrorResponse }>()
);

export const fetchStudents = createAction(
  '[Students Registration] fetch students list'
);

export const fetchStudentsSuccess = createAction(
  '[Students Registration] fetch students list success',
  props<{ students: StudentsModel[] }>()
);

export const fetchStudentsFailure = createAction(
  '[Students Registration] fetch students list failure',
  props<{ error: HttpErrorResponse }>()
);

export const searchStudents = createAction(
  '[Students Registration] search students',
  props<{ query: string; page?: number; limit?: number }>()
);

export const searchStudentsSuccess = createAction(
  '[Students Registration] search students success',
  props<{ students: StudentsModel[]; total: number }>()
);

export const searchStudentsFailure = createAction(
  '[Students Registration] search students failure',
  props<{ error: HttpErrorResponse }>()
);

export const addStudentAction = createAction(
  '[Add Student] add student',
  props<{ student: StudentsModel }>()
);

export const addStudentActionSuccess = createAction(
  '[Add Student] add student success',
  props<{ student: StudentsModel }>()
);

export const addStudentActionFail = createAction(
  '[Add Student] add student fail',
  props<{ error: HttpErrorResponse }>()
);

export const resetAddSuccess = createAction('[Add Student] reset add success');

export const resetErrorMsg = createAction(
  '[Add Student Component] reset error message'
);

export const deleteStudentAction = createAction(
  '[Add Student] delete student',
  props<{ studentNumber: string }>()
);

export const deleteStudentSuccess = createAction(
  '[Add Student] delete student success',
  props<{ studentNumber: string }>()
);

export const deleteStudentFail = createAction(
  '[Add Student] delete student fail',
  props<{ error: HttpErrorResponse }>()
);

export const deleteTeacherAction = createAction(
  '[Add Teacher] delete teacher',
  props<{ id: string }>()
);

export const deleteTeacherSuccess = createAction(
  '[Add Teacher] delete teacher success',
  props<{ id: string }>()
);

export const deleteTeacherFail = createAction(
  '[Add Teacher] delete teacher fail',
  props<{ error: HttpErrorResponse }>()
);

export const editTeacherAction = createAction(
  '[Add Teacher] edit teacher',
  props<{ teacher: TeachersModel }>()
);

export const editTeacherSuccess = createAction(
  '[Add Teacher] edit teacher success',
  props<{ teacher: TeachersModel }>()
);

export const editTeacherFail = createAction(
  '[Add Teacher] edit teacher fail',
  props<{ error: HttpErrorResponse }>()
);

export const editStudentAction = createAction(
  '[Add Student] edit student',
  props<{ student: StudentsModel }>()
);

export const editStudentSuccess = createAction(
  '[Add Student] edit student success',
  props<{ student: StudentsModel }>()
);

export const editStudentFail = createAction(
  '[Add Student] edit student fail',
  props<{ error: HttpErrorResponse }>()
);
