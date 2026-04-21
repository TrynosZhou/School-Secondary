/* eslint-disable prettier/prettier */
import { createReducer, on } from '@ngrx/store';
import { UserManagementModel, UserDetailsModel, UserListPaginatedModel, UserActivityPaginatedModel } from '../models/user-management.model';
import { userManagementActions } from './user-management.actions';

export interface UserManagementState {
  users: UserManagementModel[] | null;
  userDetails: UserDetailsModel | null;
  userActivity: UserActivityPaginatedModel | null;
  systemActivity: UserActivityPaginatedModel | null;
  loading: boolean;
  error: string | null;
}

export const initialState: UserManagementState = {
  users: null,
  userDetails: null,
  userActivity: null,
  systemActivity: null,
  loading: false,
  error: null,
};

export const userManagementReducer = createReducer(
  initialState,

  // Load Users
  on(userManagementActions.loadUsers, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.loadUsersSuccess, (state, { users }) => ({
    ...state,
    users,
    loading: false,
    error: null,
  })),
  on(userManagementActions.loadUsersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load User Details
  on(userManagementActions.loadUserDetails, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.loadUserDetailsSuccess, (state, { user }) => ({
    ...state,
    userDetails: user,
    loading: false,
    error: null,
  })),
  on(userManagementActions.loadUserDetailsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Create User
  on(userManagementActions.createUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.createUserSuccess, (state, { user }) => ({
    ...state,
    userDetails: user,
    loading: false,
    error: null,
  })),
  on(userManagementActions.createUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update User
  on(userManagementActions.updateUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.updateUserSuccess, (state, { user }) => ({
    ...state,
    userDetails: user,
    loading: false,
    error: null,
  })),
  on(userManagementActions.updateUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete User
  on(userManagementActions.deleteUser, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.deleteUserSuccess, (state, { id }) => ({
    ...state,
    users: state.users?.filter(user => user.id !== id) || null,
    loading: false,
    error: null,
  })),
  on(userManagementActions.deleteUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Change Password
  on(userManagementActions.changePassword, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.changePasswordSuccess, (state, { message }) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(userManagementActions.changePasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Reset Password
  on(userManagementActions.resetPassword, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.resetPasswordSuccess, (state, { message, generatedPassword }) => ({
    ...state,
    loading: false,
    error: null,
  })),
  on(userManagementActions.resetPasswordFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load User Activity
  on(userManagementActions.loadUserActivity, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.loadUserActivitySuccess, (state, { activity }) => ({
    ...state,
    userActivity: activity,
    loading: false,
    error: null,
  })),
  on(userManagementActions.loadUserActivityFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load System Activity
  on(userManagementActions.loadSystemActivity, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(userManagementActions.loadSystemActivitySuccess, (state, { activity }) => ({
    ...state,
    systemActivity: activity,
    loading: false,
    error: null,
  })),
  on(userManagementActions.loadSystemActivityFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Clear State
  on(userManagementActions.clearUsers, (state) => ({
    ...state,
    users: null,
  })),
  on(userManagementActions.clearUserDetails, (state) => ({
    ...state,
    userDetails: null,
  })),
  on(userManagementActions.clearActivity, (state) => ({
    ...state,
    userActivity: null,
    systemActivity: null,
  })),
);


