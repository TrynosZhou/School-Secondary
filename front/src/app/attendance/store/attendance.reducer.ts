import { createReducer, on } from '@ngrx/store';
import { attendanceActions } from './attendance.actions';
import { AttendanceRecord, AttendanceReport, AttendanceSummary } from '../services/attendance.service';

export interface State {
  classAttendance: AttendanceRecord[];
  attendanceReports: AttendanceReport | null;
  attendanceSummary: AttendanceSummary | null;
  isLoading: boolean;
  errorMessage: string;
  lastMarkedAttendance: AttendanceRecord | null; // Track last marked attendance for success feedback
}

export const initialState: State = {
  classAttendance: [],
  attendanceReports: null,
  attendanceSummary: null,
  isLoading: false,
  errorMessage: '',
  lastMarkedAttendance: null,
};

export const attendanceReducer = createReducer(
  initialState,
  // Attendance actions
  on(attendanceActions.getClassAttendance, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.getClassAttendanceSuccess, (state, { attendance }) => ({
    ...state,
    isLoading: false,
    classAttendance: attendance,
  })),
  on(attendanceActions.getClassAttendanceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.markAttendance, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.markAttendanceSuccess, (state, { attendance }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    lastMarkedAttendance: attendance, // Store last marked attendance for success feedback
    classAttendance: state.classAttendance.map(record =>
      record.studentNumber === attendance.studentNumber ? attendance : record
    ),
  })),
  on(attendanceActions.markAttendanceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.getAttendanceReports, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.getAttendanceReportsSuccess, (state, { reports }) => ({
    ...state,
    isLoading: false,
    attendanceReports: reports,
  })),
  on(attendanceActions.getAttendanceReportsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.getAttendanceSummary, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(attendanceActions.getAttendanceSummarySuccess, (state, { summary }) => ({
    ...state,
    isLoading: false,
    attendanceSummary: summary,
  })),
  on(attendanceActions.getAttendanceSummaryFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(attendanceActions.clearAttendanceData, (state) => ({
    ...state,
    classAttendance: [],
    attendanceReports: null,
    attendanceSummary: null,
    errorMessage: '',
  }))
);
