import { createReducer, on } from '@ngrx/store';
import {
  signinActions,
  signupActions,
  accountStatsActions,
  userDetailsActions,
  resetErrorMessage,
  logout,
} from './auth.actions'; // Import grouped actions
import { User } from '../models/user.model';
import { AccountStats } from '../models/account-stats.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import { ParentsModel } from 'src/app/registration/models/parents.model'; // Import ParentsModel

export interface State {
  accessToken: string;
  errorMessage: string;
  isLoggedin: boolean;
  user: User | null;
  accStats: AccountStats | null;
  isLoading: boolean;
  userDetails: StudentsModel | TeachersModel | ParentsModel | null; // Added ParentsModel
}

export const initialState: State = {
  accessToken: '',
  errorMessage: '',
  isLoggedin: false,
  user: null,
  accStats: null,
  isLoading: false,
  userDetails: null,
};

export const authReducer = createReducer(
  initialState,
  on(signinActions.signin, (state) => ({
    // Use grouped action
    ...state,
    isLoading: true,
    accessToken: '',
    errorMessage: '',
    isLoggedin: false,
    accStats: null,
  })),
  on(signinActions.signinSuccess, (state, { accessToken, user }) => ({
    // Use grouped action
    ...state,
    accessToken,
    isLoggedin: true,
    errorMessage: '',
    user: user,
    accStats: null, // Clear stats on new signin
    isLoading: false,
  })),
  on(signinActions.signinFailure, (state, { error }) => {
    // Extract error message from HttpErrorResponse
    // Backend error messages are in error.error.message
    // Fallback to error.error.error, error.message, or default message
    let errorMessage = 'An error occurred during sign in';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error?.error) {
      errorMessage = error.error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      ...state,
      errorMessage,
      isLoggedin: false,
      accessToken: '',
      user: null,
      accStats: null,
      isLoading: false,
    };
  }),
  on(signupActions.signup, (state) => ({
    // Use grouped action
    ...state,
    errorMessage: '',
    isLoggedin: false,
    accessToken: '',
    user: null,
    accStats: null,
    isLoading: true,
  })),
  on(signupActions.signupSuccess, (state, { response }) => ({
    // Use grouped action
    ...state,
    errorMessage: '',
    accessToken: '',
    isLoggedin: false,
    user: null,
    accStats: null,
    isLoading: false,
  })),
  on(signupActions.signupFailure, (state, { error }) => {
    // Extract error message from HttpErrorResponse
    let errorMessage = 'An error occurred during sign up';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error?.error) {
      errorMessage = error.error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      ...state,
      errorMessage,
      isLoggedin: false,
      accessToken: '',
      user: null,
      accStats: null,
      isLoading: false,
    };
  }),
  on(resetErrorMessage, (state) => ({
    // Individual action
    ...state,
    errorMessage: '',
  })),
  on(logout, (state) => ({
    // Individual action
    ...state,
    isLoggedin: false,
    accessToken: '',
    errorMessage: '',
    user: null, // Clear user on logout
    accStats: null, // Clear account stats on logout
    userDetails: null, // Clear user details on logout
  })),
  on(accountStatsActions.fetchAccountStats, (state) => ({
    // Use grouped action
    ...state,
    isLoading: true,
  })),
  on(accountStatsActions.fetchAccountStatsSuccess, (state, { stats }) => ({
    // Use grouped action
    ...state,
    isLoading: false,
    accStats: { ...stats },
  })),
  on(accountStatsActions.fetchAccountStatsFailure, (state, { error }) => {
    let errorMessage = 'An error occurred while fetching account stats';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error?.error) {
      errorMessage = error.error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      ...state,
      isLoading: false,
      errorMessage,
    };
  }),
  on(userDetailsActions.fetchUser, (state) => ({
    // Use grouped action
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(userDetailsActions.fetchUserSuccess, (state, { user }) => ({
    // Use grouped action
    ...state,
    isLoading: false,
    errorMessage: '',
    userDetails: user,
  })),
  on(userDetailsActions.fetchUserFail, (state, { error }) => {
    let errorMessage = 'An error occurred while fetching user details';
    
    if (error?.error?.message) {
      errorMessage = error.error.message;
    } else if (error?.error?.error) {
      errorMessage = error.error.error;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return {
      ...state,
      isLoading: false,
      errorMessage,
      userDetails: null,
    };
  })
);
