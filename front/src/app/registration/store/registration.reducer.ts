import { createReducer, on } from '@ngrx/store';
import { ParentsModel } from '../models/parents.model';
import { StudentsModel } from '../models/students.model';
import { TeachersModel } from '../models/teachers.model';
import * as registrationActions from './registration.actions';

export interface State {
  teachers: TeachersModel[];
  students: StudentsModel[];
  parents: ParentsModel[];
  errorMessage: string;
  isLoading: boolean;
  addSuccess: boolean | null;
  deleteSuccess: boolean | null;
  editSuccess: boolean | null;
}

export const initialState: State = {
  teachers: [],
  parents: [],
  students: [],
  errorMessage: '',
  isLoading: false,
  addSuccess: null,
  deleteSuccess: null,
  editSuccess: null,
};

export const registrationReducer = createReducer(
  initialState,
  // Extract useful backend error details instead of generic HttpErrorResponse.message
  // (e.g., ValidationPipe arrays like ["email must be an email"]).
  // Keeps UI feedback actionable in modal forms.
  on(registrationActions.fetchTeachers, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(registrationActions.fetchTeachersSuccess, (state, { teachers }) => ({
    ...state,
    teachers,
    errorMessage: '',
    isLoading: false,
  })),
  on(registrationActions.fetchTeachersFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
    teachers: [],
  })),
  on(registrationActions.addTeacherAction, (state, { teacher }) => ({
    ...state,
    errorMessage: '',
    isLoading: true,
  })),
  on(registrationActions.addTeacherActionSuccess, (state, { teacher }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    teachers: [teacher, ...state.teachers],
    addSuccess: true,
  })),
  on(registrationActions.addTeacherActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: Array.isArray(error?.error?.message)
      ? error.error.message.join(', ')
      : error?.error?.message || error.message,
    addSuccess: false,
  })),
  on(registrationActions.fetchStudents, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(registrationActions.fetchStudentsSuccess, (state, { students }) => ({
    ...state,
    students,
    isLoading: false,
    errorMessage: '',
  })),
  on(registrationActions.fetchStudentsFailure, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
  })),
  on(registrationActions.searchStudents, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(registrationActions.searchStudentsSuccess, (state, { students }) => ({
    ...state,
    students,
    isLoading: false,
    errorMessage: '',
  })),
  on(registrationActions.searchStudentsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(registrationActions.addStudentAction, (state, { student }) => ({
    ...state,
    errorMessage: '',
    isLoading: true,
  })),
  on(registrationActions.addStudentActionSuccess, (state, { student }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    students: [student, ...state.students],
    addSuccess: true,
  })),
  on(registrationActions.addStudentActionFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: Array.isArray(error?.error?.message)
      ? error.error.message.join(', ')
      : error?.error?.message || error.message,
    addSuccess: false,
  })),
  on(registrationActions.resetAddSuccess, (state) => ({
    ...state,
    addSuccess: null,
  })),
  on(registrationActions.resetErrorMsg, (state) => ({
    ...state,
    errorMessage: '',
  })),
  on(registrationActions.deleteStudentAction, (state, { studentNumber }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(registrationActions.deleteStudentSuccess, (state, { studentNumber }) => ({
    ...state,
    isLoading: false,
    students: [
      ...state.students.filter(
        (student) => student.studentNumber !== studentNumber
      ),
    ],
    deleteSuccess: true,
  })),
  on(registrationActions.deleteStudentFail, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
    deleteSuccess: false,
  })),

  on(registrationActions.deleteTeacherAction, (state, { id }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(registrationActions.deleteTeacherSuccess, (state, { id }) => ({
    ...state,
    isLoading: false,
    teachers: [...state.teachers.filter((teacher) => teacher.id !== id)],
    deleteSuccess: true,
  })),
  on(registrationActions.deleteTeacherFail, (state, { error }) => ({
    ...state,
    errorMessage: error.message,
    isLoading: false,
    deleteSuccess: false,
  })),
  on(registrationActions.editTeacherAction, (state, { teacher }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(registrationActions.editTeacherSuccess, (state, { teacher }) => ({
    ...state,
    isLoading: false,
    editSuccess: true,
    teachers: [
      ...state.teachers.map((tr) => (tr.id !== teacher.id ? tr : teacher)),
    ],
  })),
  on(registrationActions.editTeacherFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    editSuccess: false,
  })),
  on(registrationActions.editStudentAction, (state, { student }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(registrationActions.editStudentSuccess, (state, { student }) => ({
    ...state,
    isLoading: false,
    editSuccess: true,
    students: [
      ...state.students.map((st) =>
        st.studentNumber !== student.studentNumber ? st : student
      ),
    ],
  })),
  on(registrationActions.editStudentFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    editSuccess: false,
  }))
);
