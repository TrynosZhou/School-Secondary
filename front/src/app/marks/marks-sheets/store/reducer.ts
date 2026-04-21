import { ReportsModel } from 'src/app/reports/models/reports.model';
import { markSheetActions } from './actions';
import { createReducer, on } from '@ngrx/store';

export interface State {
  reports: ReportsModel[];
  isLoading: boolean;
  errorMessage: string;
}

export const initialState: State = {
  reports: [],
  isLoading: false,
  errorMessage: '',
};

export const markSheetsReducer = createReducer(
  initialState,
  on(markSheetActions.fetchMarkSheet, (state, { name, num, year }) => ({
    ...state,
    isLoading: true,
  })),
  on(markSheetActions.fechMarkSheetSuccess, (state, { reports }) => ({
    ...state,
    isLoading: false,
    reports,
  })),
  on(markSheetActions.fetchMarkSheetFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  }))
);
