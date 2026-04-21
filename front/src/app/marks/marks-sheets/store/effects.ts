import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ReportsService } from 'src/app/reports/services/reports.service';
import { markSheetActions } from './actions';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportsModel } from 'src/app/reports/models/reports.model';

@Injectable()
export class MarkSheetEffects {
  constructor(
    private actions$: Actions,
    private reportsService: ReportsService,

    private snackBar: MatSnackBar
  ) {}

  fetchMarkSheet$ = createEffect(() =>
    this.actions$.pipe(
      ofType(markSheetActions.fetchMarkSheet),
      switchMap((data) =>
        this.reportsService
          .generateReports(data.name, data.num, data.year, data.examType)
          .pipe(
            tap((reports) =>
              this.snackBar.open(`Mark sheet generated successfully`, 'OK', {
                duration: 3000,
                verticalPosition: 'top',
                horizontalPosition: 'center',
              })
            ),
            map((reports) =>
              markSheetActions.fechMarkSheetSuccess({ reports })
            ),
            catchError((error: HttpErrorResponse) =>
              of(markSheetActions.fetchMarkSheetFail({ ...error }))
            )
          )
      )
    )
  );

}
