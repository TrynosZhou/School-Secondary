import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromAttendanceReducer from './attendance.reducer';

export const attendanceState =
  createFeatureSelector<fromAttendanceReducer.State>('attendance');

export const selectClassAttendance = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.classAttendance
);

export const selectAttendanceReports = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.attendanceReports
);

export const selectAttendanceSummary = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.attendanceSummary
);

export const selectAttendanceLoading = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.isLoading
);

export const selectAttendanceError = createSelector(
  attendanceState,
  (state: fromAttendanceReducer.State) => state.errorMessage
);
