import { createReducer, on } from '@ngrx/store';
import { ReportsModel } from '../models/reports.model';
import * as reportsActions from './reports.actions';
import { ReportModel } from '../models/report.model';

export interface State {
  reports: ReportsModel[];
  studentReports: ReportsModel[];
  selectedReport: ReportsModel | null;
  isLoading: boolean;
  isLoaded: boolean;
  errorMessage: string;
  viewReportsError: string;
  reportsGenerated: boolean; // Track if reports were successfully generated
}

export const initialState: State = {
  reports: [],
  studentReports: [],
  selectedReport: null,
  isLoading: false,
  isLoaded: false,
  errorMessage: '',
  viewReportsError: '',
  reportsGenerated: false,
};

export const reportsReducer = createReducer(
  initialState,
  on(reportsActions.generateReports, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(reportsActions.generateReportsSuccess, (state, { reports }) => ({
    ...state,
    reports,
    isLoading: false,
    reportsGenerated: true, // Mark that reports were successfully generated
  })),
  on(reportsActions.generateReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(reportsActions.saveReportActions.saveReports, (state) => ({
    ...state,
    isLoading: true,
    reports: [],
    reportsGenerated: false, // Reset after saving
  })),
  on(
    reportsActions.saveReportActions.saveReportsSuccess,
    (state, { reports }) => ({
      ...state,
      isLoading: false,
      reports: [...reports],
    })
  ),
  // Teacher comment save (same pattern as head comment)
  on(
    reportsActions.saveTeacherCommentActions.saveTeacherComment,
    (state, { comment }) => ({
      ...state,
    })
  ),
  on(
    reportsActions.saveTeacherCommentActions.saveTeacherCommentSuccess,
    (state, { report }) => ({
      ...state,
      reports: [
        ...state.reports.map((rep) =>
          rep.studentNumber === report.studentNumber ? report : rep
        ),
      ],
    })
  ),
  on(
    reportsActions.saveTeacherCommentActions.saveTeacherCommentFail,
    (state, { error }) => ({
      ...state,
      errorMessage: error.message,
    })
  ),
  on(reportsActions.saveReportActions.saveReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(reportsActions.viewReportsActions.viewReports, (state) => ({
    ...state,
    isLoading: true,
    isLoaded: false,
    reports: [],
    reportsGenerated: false, // Reset when viewing reports
  })),
  on(
    reportsActions.viewReportsActions.viewReportsSuccess,
    (state, { reports }) => ({
      ...state,
      isLoading: false,
      isLoaded: true,
      reports: [...reports],
    })
  ),
  on(reportsActions.viewReportsActions.viewReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    isLoaded: false,
    errorMessage: error.message,
    reports: [],
  })),
  on(
    reportsActions.saveHeadCommentActions.saveHeadComment,
    (state, { comment }) => ({
      ...state,
      // isLoading: true,
    })
  ),
  on(
    reportsActions.saveHeadCommentActions.saveHeadCommentSuccess,
    (state, { report }) => ({
      ...state,
      // isLoading: false,
      reports: [
        ...state.reports.map((rep) =>
          rep.studentNumber === report.studentNumber
            ? (rep = report)
            : (rep = rep)
        ),
      ],
    })
  ),
  on(
    reportsActions.saveHeadCommentActions.saveHeadCommentFail,
    (state, { error }) => ({
      ...state,
      // isLoading: false,
      errorMessage: error.message,
    })
  ),
  on(reportsActions.generatePdfActions.generatePdf, (state) => ({
    ...state,
    isLoading: true,
  })),
  on(reportsActions.generatePdfActions.generatePdfSuccess, (state) => ({
    ...state,
    isLoading: false,
  })),
  on(reportsActions.viewReportsActions.fetchStudentReports, (state) => ({
    ...state,
    isLoading: true,
    isLoaded: false,
    errorMessage: '',
    reports: [],
    selectedReport: null,
  })),
  on(
    reportsActions.viewReportsActions.fetchStudentReportsSuccess,
    (state, { reports }) => ({
      ...state,
      isLoading: false,
      isLoaded: true,
      errorMessage: '',
      reports: [],
      studentReports: [...reports],
      selectedReport: null,
    })
  ),
  on(
    reportsActions.viewReportsActions.fetchStudentReportsFail,
    (state, { error }) => ({
      ...state,
      isLoading: false,
      isLoaded: false,
      errorMessage: error.message,
      reports: [],
      studentReports: [],
      selectedReport: null,
    })
  ),
  on(
    reportsActions.viewReportsActions.selectStudentReport,
    (state, { report }) => ({
      ...state,
      selectedReport: report, // Set the selected report for display
      errorMessage: '', // Clear any previous error
    })
  ),
  on(reportsActions.viewReportsActions.clearSelectedReport, (state) => ({
    ...state,
    selectedReport: null, // Clear the currently displayed report
    errorMessage: '', // Clear any previous error
  })),
  on(reportsActions.viewReportsActions.resetReports, (state) => ({
    ...state,
    reports: [],
    reportsGenerated: false, // Reset when reports are reset
  })),
  // --- YOUR NEW REDUCER HANDLER IS HERE ---
  on(
    reportsActions.viewReportsActions.setReportsErrorMsg,
    (state, { errorMsg }) => ({
      ...state,
      errorMessage: errorMsg,
    })
  )
  // on(reportsActions.saveHeadCommentActions.saveHeadCommentSuccess, (state))
);
