import { createAction, createActionGroup, props } from '@ngrx/store';
import { SubjectsModel } from '../models/subjects.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MarksModel } from '../models/marks.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { StudentComment } from '../models/student-comment';
import { ExamType } from '../models/examtype.enum';
import { MarksProgressModel } from '../models/marks-progress.model';

export const fetchSubjects = createAction(
  '[Subjects Component] fetch all subjects'
);

export const fetchSubjectsSuccess = createAction(
  '[Subjects Component] fetch all subjects success',
  props<{ subjects: SubjectsModel[] }>()
);

export const fetchSubjectsFailure = createAction(
  '[Subjects Component] fetch all subjects failure',
  props<{ error: HttpErrorResponse }>()
);

export const addSubjectAction = createAction(
  '[Add Subject Component] add subject',
  props<{ subject: SubjectsModel }>()
);

export const addSubjectActionSuccess = createAction(
  '[Add Subject Cmponent] add subject success',
  props<{ subject: SubjectsModel }>()
);

export const addSubjectActionFail = createAction(
  '[Add Subject Component] add subject fail',
  props<{ error: HttpErrorResponse }>()
);

export const deleteSubjectAction = createAction(
  '[Subjects Component] delete subject',
  props<{ subject: SubjectsModel }>()
);

export const deleteSubjectSuccess = createAction(
  '[Subjects Component] delete subject success',
  props<{ code: string }>()
);

export const deleteSubjectFail = createAction(
  '[Subjects Component] delete subject fail',
  props<{ error: HttpErrorResponse }>()
);

export const fetchSubjectMarksInClass = createAction(
  '[Enter Marks Component] fetch subject marks for the class',
  props<{
    name: string;
    num: number;
    year: number;
    termId?: number;
    subjectCode: string;
    examType: ExamType;
  }>()
);

export const fetchSubjectMarksInClassSuccess = createAction(
  '[Enter Marks Component] fetch subject marks for the class success',
  props<{ marks: MarksModel[] }>()
);

export const fetchSubjectMarksInFail = createAction(
  '[Enter Marks Component] fetch subject marks for the class fail',
  props<{ error: HttpErrorResponse }>()
);

export const saveMarkAction = createAction(
  '[Enter Mark Component] save mark',
  props<{ mark: MarksModel }>()
);

export const saveMarkActionSuccess = createAction(
  '[Enter Mark Component] save mark success',
  props<{ mark: MarksModel }>()
);

export const saveMarkActionFail = createAction(
  '[Enter Mark Component] save mark fail',
  props<{ error: HttpErrorResponse; mark?: MarksModel }>()
);

export const editSubjectActions = createActionGroup({
  source: 'Add Edit Subject Component',
  events: {
    editSubject: props<{ subject: SubjectsModel }>(),
    editSubjectSuccess: props<{ subject: SubjectsModel }>(),
    editSubjectFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const deleteMarkActions = createActionGroup({
  source: 'Enter Marks Component',
  events: {
    deleteMark: props<{ mark: MarksModel }>(),
    deleteMarkSuccess: props<{ mark: MarksModel }>(),
    deleteMarkFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const perfomanceActions = createActionGroup({
  source: 'Perfomance component',
  events: {
    fetchPerfomanceData: props<{
      num: number;
      year: number;
      termId?: number;
      name: string;
      examType: ExamType;
    }>(),
    fetchPerfomanceDataSuccess: props<{
      data: {
        subjects: SubjectsModel[];
        subjectsMarks: Array<MarksModel[]>;
        marks: Array<number[]>;
        xAxes: number[];
      };
    }>(),
    fetchPerfomanceDataFail: props<{ error: HttpErrorResponse }>(),
    plotSubjectPerf: props<{ subject: string; index: number }>(),
  },
});

export const saveCommentActions = createActionGroup({
  source: 'Teachers comment component',
  events: {
    saveComment: props<{ comment: StudentComment }>(),
    saveCommentFail: props<{ error: HttpErrorResponse }>(),
    saveCommentSuccess: props<{ comment: StudentComment }>(),
    fetchClassComments: props<{
      name: string;
      num: number;
      year: number;
      examType: ExamType;
    }>(),
    fetchClassCommentsSuccess: props<{ comments: StudentComment[] }>(),
    fetchClassCommentsFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const fetchMarksProgressActions = createActionGroup({
  source: 'Marks Progress component',
  events: {
    fetchMarksProgress: props<{
      num: number;
      year: number;
      termId?: number;
      clas: string;
      // fom: number;
      examType: ExamType;
    }>(),
    fetchMarksProgressFail: props<{ error: HttpErrorResponse }>(),
    fetchMarksProgressSuccess: props<{ marksProgress: MarksProgressModel[] }>(),
  },
});

export const studentMarksActions = createActionGroup({
  source: 'Student Dashboard',
  events: {
    fetchStudentMarks: props<{ studentNumber: string }>(),
    fetchStudentMarksSuccess: props<{ marks: MarksModel[] }>(),
    fetchStudentMarksFail: props<{ error: HttpErrorResponse }>(),
  },
});
