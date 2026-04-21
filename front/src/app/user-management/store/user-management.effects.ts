/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserManagementService } from '../services/user-management.service';
import { userManagementActions } from './user-management.actions';

@Injectable()
export class UserManagementEffects {
  constructor(
    private actions$: Actions,
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar
  ) {}

  // Load Users
  loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.loadUsers),
      switchMap(({ page, limit, search, role, status }) =>
        this.userManagementService.getAllUsers(page, limit, search, role, status).pipe(
          map((response: any[]) => {
            // Filter the response array based on search criteria if needed
            let filteredUsers = response;
            
            if (search) {
              const searchLower = search.toLowerCase();
              filteredUsers = filteredUsers.filter(user => 
                user.username?.toLowerCase().includes(searchLower) ||
                user.name?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower)
              );
            }
            
            if (role) {
              filteredUsers = filteredUsers.filter(user => user.role === role);
            }
            
            if (status) {
              filteredUsers = filteredUsers.filter(user => user.status === status);
            }
            
            return userManagementActions.loadUsersSuccess({ users: filteredUsers });
          }),
          catchError((error) =>
            of(userManagementActions.loadUsersFailure({ error: error.message || 'Failed to load users' }))
          )
        )
      )
    )
  );

  // Load User Details
  loadUserDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.loadUserDetails),
      switchMap(({ id, role }) =>
        this.userManagementService.getUserById(id, role).pipe(
          map((user) => userManagementActions.loadUserDetailsSuccess({ user })),
          catchError((error) =>
            of(userManagementActions.loadUserDetailsFailure({ error: error.message || 'Failed to load user details' }))
          )
        )
      )
    )
  );

  // Create User
  createUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.createUser),
      switchMap(({ user }) =>
        this.userManagementService.createUser(user).pipe(
          map((createdUser) => userManagementActions.createUserSuccess({ user: createdUser })),
          catchError((error) =>
            of(userManagementActions.createUserFailure({ error: error.message || 'Failed to create user' }))
          )
        )
      )
    )
  );

  // Update User
  updateUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.updateUser),
      switchMap(({ id, user }) =>
        this.userManagementService.updateUser(id, user).pipe(
          map((response) => {
            this.snackBar.open(response.message || 'User updated successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
            return userManagementActions.updateUserSuccess({ user: null as any });
          }),
          catchError((error) =>
            of(userManagementActions.updateUserFailure({ error: error.message || 'Failed to update user' }))
          )
        )
      )
    )
  );

  // Delete User
  deleteUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.deleteUser),
      switchMap(({ id }) =>
        this.userManagementService.deleteUser(id).pipe(
          map(() => userManagementActions.deleteUserSuccess({ id })),
          catchError((error) =>
            of(userManagementActions.deleteUserFailure({ error: error.message || 'Failed to delete user' }))
          )
        )
      )
    )
  );

  // Change Password
  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.changePassword),
      switchMap(({ id, passwordData }) =>
        this.userManagementService.changePassword(id, passwordData).pipe(
          map((response) => userManagementActions.changePasswordSuccess({ message: response.message })),
          catchError((error) =>
            of(userManagementActions.changePasswordFailure({ error: error.message || 'Failed to change password' }))
          )
        )
      )
    )
  );

  // Reset Password
  resetPassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.resetPassword),
      switchMap(({ id }) =>
        this.userManagementService.resetPassword(id).pipe(
          map((response) => userManagementActions.resetPasswordSuccess({ 
            message: response.message, 
            generatedPassword: response.generatedPassword 
          })),
          catchError((error) =>
            of(userManagementActions.resetPasswordFailure({ error: error.message || 'Failed to reset password' }))
          )
        )
      )
    )
  );

  // Load User Activity
  loadUserActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.loadUserActivity),
      switchMap(({ id, page, limit }) =>
        this.userManagementService.getUserActivity(id, page, limit).pipe(
          map((activity) => userManagementActions.loadUserActivitySuccess({ activity })),
          catchError((error) =>
            of(userManagementActions.loadUserActivityFailure({ error: error.message || 'Failed to load user activity' }))
          )
        )
      )
    )
  );

  // Load System Activity
  loadSystemActivity$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.loadSystemActivity),
      switchMap(({ page, limit, action, userId, startDate, endDate }) =>
        this.userManagementService.getSystemActivity(page, limit, action, userId, startDate, endDate).pipe(
          map((activity) => userManagementActions.loadSystemActivitySuccess({ activity })),
          catchError((error) =>
            of(userManagementActions.loadSystemActivityFailure({ error: error.message || 'Failed to load system activity' }))
          )
        )
      )
    )
  );

  // Success notifications
  createUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.createUserSuccess),
      tap(() => {
        this.snackBar.open('User created successfully', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  updateUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.updateUserSuccess),
      tap(() => {
        this.snackBar.open('User updated successfully', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  deleteUserSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.deleteUserSuccess),
      tap(() => {
        this.snackBar.open('User deleted successfully', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  changePasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.changePasswordSuccess),
      tap(() => {
        this.snackBar.open('Password changed successfully', 'OK', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  resetPasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.resetPasswordSuccess),
      tap(({ generatedPassword }) => {
        this.snackBar.open(`Password reset successfully. Generated password: ${generatedPassword}`, 'OK', {
          duration: 10000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  // Error notifications
  createUserFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.createUserFailure),
      tap(({ error }) => {
        this.snackBar.open(`Failed to create user: ${error}`, 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  updateUserFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.updateUserFailure),
      tap(({ error }) => {
        this.snackBar.open(`Failed to update user: ${error}`, 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );

  deleteUserFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userManagementActions.deleteUserFailure),
      tap(({ error }) => {
        this.snackBar.open(`Failed to delete user: ${error}`, 'OK', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      })
    ),
    { dispatch: false }
  );
}


