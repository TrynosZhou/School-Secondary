import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { ClassesModel } from '../models/classes.model';
import { HttpErrorResponse } from '@angular/common/http';
import { TermsModel } from '../models/terms.model';
import { EnrolsModel } from '../models/enrols.model';
import { EnrolStats } from '../models/enrol-stats.model';
import { StudentsSummary } from '../models/students-summary.model';

export const fetchClasses = createAction('[Enrolment] fetch classes list');

export const fetchClassesSuccess = createAction(
  '[Enrolment] fetch classes list success',
  props<{ classes: ClassesModel[] }>()
);

export const fetchClassesFailure = createAction(
  '[Enrolment] fetch classes list failure',
  props<{ error: HttpErrorResponse }>()
);

export const addClassAction = createAction(
  '[Add Class] add class',
  props<{ clas: ClassesModel }>()
);

export const addClassActionSuccess = createAction(
  '[Add Class] add class success',
  props<{ clas: ClassesModel }>()
);

export const addClassActionFail = createAction(
  '[Add Class] add class fail',
  props<{ error: HttpErrorResponse }>()
);

export const deleteClassAction = createAction(
  '[Class List] delete class',
  props<{ name: string }>()
);

export const deleteClassSuccess = createAction(
  '[Class List] delete class success',
  props<{ name: string }>()
);

export const deleteClassFail = createAction(
  '[Class List] delete class fail',
  props<{ error: HttpErrorResponse }>()
);

export const editClassAction = createAction(
  '[Add Class] edit class',
  props<{ clas: ClassesModel }>()
);

export const editClassSuccess = createAction(
  '[Add Class] edit class success',
  props<{ clas: ClassesModel }>()
);

export const editClassFail = createAction(
  '[Add Class] edit class fail',
  props<{ error: HttpErrorResponse }>()
);

export const fetchTerms = createAction('[Enrolment] fetch terms list');

export const fetchTermsSuccess = createAction(
  '[Enrolment] fetch terms list success',
  props<{ terms: TermsModel[] }>()
);

export const fetchTermsFailure = createAction(
  '[Enrolment] fetch terms list failure',
  props<{ error: HttpErrorResponse }>()
);

export const addTermAction = createAction(
  '[Add Term] add term',
  props<{ term: TermsModel }>()
);

export const addTermActionSuccess = createAction(
  '[Add Term] add term success',
  props<{ term: TermsModel }>()
);

export const addTermActionFail = createAction(
  '[Add Term] add term fail',
  props<{ error: HttpErrorResponse }>()
);

export const deleteTermAction = createAction(
  '[Terms List] delete term',
  props<{ term: TermsModel }>()
);

export const deleteTermSuccess = createAction(
  '[Terms List] delete term success',
  props<{ term: TermsModel }>()
);

export const deleteTermFail = createAction(
  '[Terms List] delete term fail',
  props<{ error: HttpErrorResponse }>()
);

export const editTermAction = createAction(
  '[Add Terms Form] edit term',
  props<{ term: TermsModel }>()
);

export const editTermSuccess = createAction(
  '[Add Term Form] edit term success',
  props<{ term: TermsModel }>()
);

export const editTermFail = createAction(
  '[Add Term Form] edit term fail',
  props<{ error: HttpErrorResponse }>()
);

export const getEnrolmentByClass = createAction(
  '[Terms-Classes Component] fetch enrolment for class',
  props<{ name: string; num: number; year: number; termId?: number }>()
);

export const getEnrolmentByClassSuccess = createAction(
  '[Terms-Classes Component] fetch enrolment for class success',
  props<{ enrols: EnrolsModel[] }>()
);

export const getEnrolmentByClassFail = createAction(
  '[Terms-Classes Component] fetch enrolment for class failure',
  props<{ error: HttpErrorResponse }>()
);

export const enrolStudents = createAction(
  '[Enrol Student Component] enrol list of students',
  props<{ enrols: EnrolsModel[] }>()
);

export const enrolStudentsSuccess = createAction(
  '[Enrol Student Component] enrol list of students success',
  props<{ enrols: EnrolsModel[] }>()
);

export const enrolStudentsFail = createAction(
  '[Enrol Student Component] enrol list of students fail',
  props<{ error: HttpErrorResponse }>()
);

export const fetchTotalEnrols = createAction(
  '[Terms Classes Component] fetch enrolments',
  props<{ num: number; year: number; termId?: number }>()
);

export const fetchTotalEnrolsSuccess = createAction(
  '[Terms Classes Component] fetch enrols success',
  props<{ summary: StudentsSummary }>()
);

export const fetchTotalEnrolsFailure = createAction(
  '[Terms Classes Component] fetch enrols success',
  props<{ error: HttpErrorResponse }>()
);

export const fetchEnrolsStats = createAction(
  '[Dashboard Compmonent] fetch enrolment stats'
);

export const fetchEnrolsStatsSuccess = createAction(
  '[Dashboard Component] fetch enrol stats success',
  props<{ stats: EnrolStats }>()
);

export const fetchEnrolsStatsFail = createAction(
  '[Dashboard Component] failed to load stats',
  props<{ error: HttpErrorResponse }>()
);

export const UnenrolStudentActions = createActionGroup({
  source: 'Terms Classes Component',
  events: {
    unenrolStudent: props<{ enrol: EnrolsModel }>(),
    unenrolStudentSuccess: props<{ enrol: EnrolsModel }>(),
    unenrolStudentFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const migrateClassActions = createActionGroup({
  source: 'Migrate Class Enrolment Component',
  events: {
    resetMigrateClassResult: emptyProps(),
    migrateClassEnrolment: props<{
      fromName: string;
      fromNum: number;
      fromYear: number;
      fromTermId?: number;
      toName: string;
      toNum: number;
      toYear: number;
      toTermId?: number;
    }>(),
    migrateClassEnrolmentSuccess: props<{ result: boolean; message?: string }>(),
    migrateClassEnrolmentFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const currentEnrolementActions = createActionGroup({
  source: 'Current Enrolment Component',
  events: {
    fetchCurrentEnrolment: props<{ studentNumber: string }>(),
    fetchCurrentEnrolmentSuccess: props<{ enrols: EnrolsModel }>(),
    fetchCurrentEnrolmentFail: props<{ error: HttpErrorResponse }>(),
    updateCurrentEnrolment: props<{ enrol: EnrolsModel }>(),
    updateCurrentEnrolmentSuccess: props<{ enrol: EnrolsModel }>(),
    updateCurrentEnrolmentFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const currentTermActions = createActionGroup({
  source: 'Current Term',
  events: {
    fetchCurrentTerm: emptyProps(),
    fetchCurrentTermSuccess: props<{ term: TermsModel }>(),
    fetchCurrentTermFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const termEnrolsActions = createActionGroup({
  source: 'Term Enrols',
  events: {
    fetchTermEnrols: props<{ num: number; year: number; termId?: number }>(),
    fetchTermEnrolsSuccess: props<{ termEnrols: EnrolsModel[] }>(),
    fetchTermEnrolsFail: props<{ error: HttpErrorResponse }>(),
  },
});
