import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { studentDashboardActions } from './dashboard.actions';
import { catchError, map, of, switchMap } from 'rxjs';
import { DashboardService } from '../services/dashboard.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class DashboardEffects {
  constructor(
    private actions$: Actions,
    private dashboardService: DashboardService
  ) {}

  fetchStudentDashboardSummary$ = createEffect(() =>
    this.actions$.pipe(
      ofType(studentDashboardActions.fetchStudentDashboardSummary),
      switchMap((action) =>
        this.dashboardService
          .getStudentDashboardSummary(action.studentNumber)
          .pipe(
            // Call your new service method
            map((summary) =>
              studentDashboardActions.fetchStudentDashboardSummarySuccess({
                summary,
              })
            ),
            catchError((error: HttpErrorResponse) =>
              of(
                studentDashboardActions.fetchStudentDashboardSummaryFail({
                  error,
                })
              )
            )
          )
      )
    )
  );
}
