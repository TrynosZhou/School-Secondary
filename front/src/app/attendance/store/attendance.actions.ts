import { HttpErrorResponse } from '@angular/common/http';
import { createActionGroup, props } from '@ngrx/store';
import { AttendanceRecord, AttendanceReport, AttendanceSummary } from '../services/attendance.service';

export const attendanceActions = createActionGroup({
  source: 'Attendance Component',
  events: {
    // Get class attendance
    getClassAttendance: props<{
      className: string;
      termNum: number;
      year: number;
      date?: string;
    }>(),
    getClassAttendanceSuccess: props<{ attendance: AttendanceRecord[] }>(),
    getClassAttendanceFail: props<{ error: HttpErrorResponse }>(),

    // Mark attendance
    markAttendance: props<{
      studentNumber: string;
      className: string;
      termNum: number;
      year: number;
      present: boolean;
      date: string;
    }>(),
    markAttendanceSuccess: props<{ attendance: AttendanceRecord }>(),
    markAttendanceFail: props<{ error: HttpErrorResponse }>(),

    // Get attendance reports
    getAttendanceReports: props<{
      className: string;
      termNum: number;
      year: number;
      startDate?: string;
      endDate?: string;
    }>(),
    getAttendanceReportsSuccess: props<{ reports: AttendanceReport }>(),
    getAttendanceReportsFail: props<{ error: HttpErrorResponse }>(),

    // Get attendance summary
    getAttendanceSummary: props<{
      className: string;
      termNum: number;
      year: number;
    }>(),
    getAttendanceSummarySuccess: props<{ summary: AttendanceSummary }>(),
    getAttendanceSummaryFail: props<{ error: HttpErrorResponse }>(),

    // Clear attendance data
    clearAttendanceData: props<{ clear: boolean }>(),
  },
});
