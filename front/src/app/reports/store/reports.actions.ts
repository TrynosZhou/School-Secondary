import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { ReportsModel } from '../models/reports.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportModel } from '../models/report.model';
import { HeadCommentModel, TeacherCommentModel } from '../models/comment.model';
import { ExamType } from 'src/app/marks/models/examtype.enum';

export const generateReports = createAction(
  '[Reports Component] generate reports',
  props<{ name: string; num: number; year: number; termId?: number; examType: ExamType }>()
);

export const generateReportsSuccess = createAction(
  '[Reports Component] generate reports success',
  props<{ reports: ReportsModel[] }>()
);

export const generateReportsFail = createAction(
  '[Reports Component] generate reports fail',
  props<{ error: HttpErrorResponse }>()
);

export const saveReportActions = createActionGroup({
  source: 'Reports Component',
  events: {
    saveReports: props<{
      name: string;
      num: number;
      year: number;
      termId?: number;
      reports: ReportsModel[];
      examType: ExamType;
    }>(),
    saveReportsSuccess: props<{ reports: ReportsModel[] }>(),
    saveReportsFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const viewReportsActions = createActionGroup({
  source: 'Reports Component',
  events: {
    viewReports: props<{
      name: string;
      num: number;
      year: number;
      termId?: number;
      examType: ExamType;
    }>(),
    viewReportsSuccess: props<{ reports: ReportsModel[] }>(),
    viewReportsFail: props<{ error: HttpErrorResponse }>(),
    fetchStudentReports: props<{ studentNumber: string }>(),
    fetchStudentReportsSuccess: props<{ reports: ReportsModel[] }>(),
    fetchStudentReportsFail: props<{ error: HttpErrorResponse }>(),
    // --- NEW ACTION ---
    selectStudentReport: props<{ report: ReportsModel }>(),
    // --- NEW ACTION TO CLEAR DISPLAYED REPORT ---
    clearSelectedReport: emptyProps(),
    resetReports: emptyProps(),

    'Set Reports Error Msg': props<{ errorMsg: string }>(),
  },
});

export const saveHeadCommentActions = createActionGroup({
  source: 'Report Component',
  events: {
    saveHeadComment: props<{ comment: HeadCommentModel }>(),
    saveHeadCommentSuccess: props<{ report: ReportsModel }>(),
    saveHeadCommentFail: props<{ error: HttpErrorResponse }>(),
  },
});

// New action group for saving the class / form teacher's comment
export const saveTeacherCommentActions = createActionGroup({
  source: 'Report Component',
  events: {
    saveTeacherComment: props<{ comment: TeacherCommentModel }>(),
    saveTeacherCommentSuccess: props<{ report: ReportsModel }>(),
    saveTeacherCommentFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const downloadReportActions = createActionGroup({
  source: 'Reports Component',
  events: {
    downloadReport: props<{
      name: string;
      num: number;
      year: number;
      termId?: number;
      examType: ExamType;
      studentNumber: string;
    }>(),
    downloadReportSuccess: emptyProps(),
    downloadReportFail: props<{ error: HttpErrorResponse }>(),
  },
});

export const generatePdfActions = createActionGroup({
  source: 'Report Component',
  events: {
    generatePdf: emptyProps(),
    generatePdfSuccess: emptyProps(),
  },
});
