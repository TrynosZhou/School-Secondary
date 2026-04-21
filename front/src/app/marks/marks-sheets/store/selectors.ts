import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromMarkSheetReducer from './reducer';

export const markSheetState =
  createFeatureSelector<fromMarkSheetReducer.State>('markSheet');

export const selectMarkSheet = createSelector(
  markSheetState,
  (state: fromMarkSheetReducer.State) => state.reports
);

export const selectMarkSheetErrorMsg = createSelector(
  markSheetState,
  (state: fromMarkSheetReducer.State) => state.errorMessage
);

export const selectIsLoading = createSelector(
  markSheetState,
  (state: fromMarkSheetReducer.State) => state.isLoading
);
