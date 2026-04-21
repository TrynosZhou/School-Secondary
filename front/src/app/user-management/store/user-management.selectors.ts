/* eslint-disable prettier/prettier */
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserManagementState } from './user-management.reducer';

export const selectUserManagementState = createFeatureSelector<UserManagementState>('userManagement');

export const selectUsers = createSelector(
  selectUserManagementState,
  (state) => state.users
);

export const selectUserDetails = createSelector(
  selectUserManagementState,
  (state) => state.userDetails
);

export const selectUserActivity = createSelector(
  selectUserManagementState,
  (state) => state.userActivity
);

export const selectSystemActivity = createSelector(
  selectUserManagementState,
  (state) => state.systemActivity
);

export const selectLoading = createSelector(
  selectUserManagementState,
  (state) => state.loading
);

export const selectError = createSelector(
  selectUserManagementState,
  (state) => state.error
);

export const selectUsersList = createSelector(
  selectUsers,
  (users) => users || []
);

export const selectUsersPagination = createSelector(
  selectUsers,
  (users) => users ? {
    total: users.length,
    page: 1,
    limit: users.length,
    totalPages: 1,
  } : null
);


