import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FinanceDataModel } from '../../finance/models/finance-data.model';
import { HttpErrorResponse } from '@angular/common/http';
import { StudentDashboardSummary } from '../models/student-dashboard-summary';

export const studentDashboardActions = createActionGroup({
  source: 'Student Dashboard Summary',
  events: {
    fetchStudentDashboardSummary: props<{ studentNumber: string }>(),
    fetchStudentDashboardSummarySuccess: props<{
      summary: StudentDashboardSummary;
    }>(),
    fetchStudentDashboardSummaryFail: props<{ error: HttpErrorResponse }>(),
  },
});
