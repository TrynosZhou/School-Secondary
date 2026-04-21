/* eslint-disable prettier/prettier */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { UserManagementService } from '../../services/user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { UserDetailsModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectUserDetails, selectLoading, selectError } from '../../store/user-management.selectors';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { EditUserDialogComponent } from '../edit-user/edit-user-dialog.component';
import { ResetPasswordDialogComponent } from '../reset-password/reset-password-dialog.component';
import { UserActivityComponent } from '../user-activity/user-activity.component';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './user-details-dialog.component.html',
  styleUrls: ['./user-details-dialog.component.scss']
})
export class UserDetailsDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  userDetails$ = this.store.select(selectUserDetails);
  loading$ = this.store.select(selectLoading);
  error$ = this.store.select(selectError);

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; role: string },
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.dispatch(userManagementActions.loadUserDetails({ id: this.data.userId, role: this.data.role }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEditUser(): void {
    this.userDetails$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        const editDialogRef = this.dialog.open(EditUserDialogComponent, {
          width: '600px',
          data: { 
            userId: this.data.userId, 
            role: this.data.role,
            user: user
          }
        });

        editDialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Reload user details if update was successful
            this.store.dispatch(userManagementActions.loadUserDetails({ 
              id: this.data.userId, 
              role: this.data.role 
            }));
          }
        });
      }
    });
  }

  onResetPassword(): void {
    // Open reset password dialog
    const resetPasswordDialogRef = this.dialog.open(ResetPasswordDialogComponent, {
      width: '700px',
      data: { 
        userId: this.data.userId, 
        role: this.data.role,
        user: null // Will be populated from userDetails$
      }
    });

    // Pass the current user data when it loads
    this.userDetails$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user && resetPasswordDialogRef.componentInstance?.data) {
        resetPasswordDialogRef.componentInstance.data.user = user;
      }
    });

    resetPasswordDialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Reload user details if password was reset successfully
        this.store.dispatch(userManagementActions.loadUserDetails({ 
          id: this.data.userId, 
          role: this.data.role 
        }));
      }
    });
  }

  onViewActivity(): void {
    this.userDetails$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.dialog.open(UserActivityComponent, {
          width: '900px',
          height: '600px',
          data: { 
            userId: this.data.userId, 
            userName: `${user.name || ''} ${user.surname || ''}`.trim() || user.username || 'User'
          }
        });
      }
    });
  }

  getRoleDisplayName(role: string): string {
    if (!role) return 'Unknown';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  getStatusColor(status: string): string {
    if (!status) return 'primary';
    switch (status) {
      case 'active':
        return 'primary';
      case 'inactive':
        return 'warn';
      case 'suspended':
        return 'accent';
      default:
        return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    if (!status) return 'help';
    switch (status) {
      case 'active':
        return 'check_circle';
      case 'inactive':
        return 'pause_circle';
      case 'suspended':
        return 'block';
      default:
        return 'help';
    }
  }
}
