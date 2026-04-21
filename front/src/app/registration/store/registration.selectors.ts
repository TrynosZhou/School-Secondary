import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRegistrationReducer from '../store/registration.reducer';

export const registrationState =
  createFeatureSelector<fromRegistrationReducer.State>('reg');

export const selectRegErrorMsg = createSelector(
  registrationState,
  (state: fromRegistrationReducer.State) => state.errorMessage
);

export const selectTeachers = createSelector(
  registrationState,
  (state: fromRegistrationReducer.State) => state.teachers
);

export const selectStudents = createSelector(
  registrationState,
  (state: fromRegistrationReducer.State) => state.students
);

export const selectIsLoading = createSelector(
  registrationState,
  (state: fromRegistrationReducer.State) => state.isLoading
);

export const selectAddSuccess = createSelector(
  registrationState,
  (state: fromRegistrationReducer.State) => state.addSuccess
);

// export const selectDeleteSuccess = createSelector(
//   registrationState,
//   (state: fromRegistrationReducer.State) => state.deleteSuccess
// );

// export const selectEditSuccess = createSelector(
//   registrationState,
//   (state: fromRegistrationReducer.State) => state.editSuccess
// );
