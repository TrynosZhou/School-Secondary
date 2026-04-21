import {
  createAction,
  createActionGroup,
  emptyProps,
  props,
} from '@ngrx/store';
import { SigninInterface } from '../models/signin.model';
import { SignupInterface } from '../models/signup.model';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../models/user.model';
import { AccountStats } from '../models/account-stats.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { ParentsModel } from 'src/app/registration/models/parents.model';
import { ROLES } from 'src/app/registration/models/roles.enum';

// Grouping Sign-in Actions
export const signinActions = createActionGroup({
  source: 'Auth/Signin',
  events: {
    // Action to initiate sign-in
    signin: props<{ signinData: SigninInterface }>(),
    // Action for successful sign-in
    'signin success': props<{ accessToken: string; user: User }>(),
    // Action for failed sign-in
    'signin failure': props<{ error: HttpErrorResponse }>(),
  },
});

// Grouping Sign-up Actions
export const signupActions = createActionGroup({
  source: 'Auth/Signup',
  events: {
    // Action to initiate sign-up
    signup: props<{ signupData: SignupInterface }>(),
    // Action for successful sign-up
    'signup success': props<{ response: boolean }>(),
    // Action for failed sign-up
    'signup failure': props<{ error: HttpErrorResponse }>(),
  },
});

// Grouping Account Stats Actions
export const accountStatsActions = createActionGroup({
  source: 'Auth/Account Stats',
  events: {
    // Action to fetch account stats
    'fetch account stats': emptyProps(), // No props needed for fetching
    // Action for successful fetching of account stats
    'fetch account stats success': props<{ stats: AccountStats }>(),
    // Action for failed fetching of account stats
    'fetch account stats failure': props<{ error: HttpErrorResponse }>(),
  },
});

// Grouping User Details Actions (already using createActionGroup, just clarifying source)
export const userDetailsActions = createActionGroup({
  source: 'Auth/Profile Component', // Changed source for consistency
  events: {
    // Action to fetch a specific user's details
    'fetch user': props<{ id: string; role: ROLES }>(),
    // Action for successful fetching of user details
    'fetch user success': props<{
      user: TeachersModel | StudentsModel | ParentsModel | null; // Added ParentsModel as it's a possibility
    }>(),
    // Action for failed fetching of user details
    'fetch user fail': props<{ error: HttpErrorResponse }>(),
  },
});

// Individual Actions (for general module concerns)
export const resetErrorMessage = createAction(
  '[Auth Module] reset error message'
);
export const logout = createAction('[Auth] logout'); // Changed source for consistency
export const checkAuthStatus = createAction('[Auth] Check Auth Status');
