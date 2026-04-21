import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromEnrolmentReducer from './enrolment.reducer';

export const enrolmentState =
  createFeatureSelector<fromEnrolmentReducer.State>('enrol');

export const selectClasses = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.classes
);

export const selectEnrolErrorMsg = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.errorMessage
);

export const selectTotalEnroment = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.totalEnrolment
);

export const selectTerms = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.terms
);

export const selectEnrols = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.enrols
);

export const selectEnrolsStats = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.enrolStats
);

export const selectMigrateClassResult = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.migrateClassResult
);

export const selectMigrateClassMessage = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.migrateClassMessage
);

export const selectCurrentEnrolment = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.currentEnrolment
);

export const selectCurrentEnrolmentLoading = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.currentEnrolmentLoading
);

export const selectCurrentEnrolmentLoaded = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.currentEnrolmentLoaded
);

export const selectCurrentTerm = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.currentTerm
);

export const selectTermEnrols = createSelector(
  enrolmentState,
  (state: fromEnrolmentReducer.State) => state.termEnrols
);
