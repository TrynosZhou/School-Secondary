/* eslint-disable prettier/prettier */
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { ROLES, ROLES_FOR_SELECTION } from '../../../registration/models/roles.enum';
import { CreateUserModel } from '../../models/user-management.model';
import { userManagementActions } from '../../store/user-management.actions';
import { selectLoading } from '../../store/user-management.selectors';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './create-user-dialog.component.html',
  styleUrls: ['./create-user-dialog.component.scss']
})
export class CreateUserDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  createUserForm: FormGroup;
  roles = ROLES_FOR_SELECTION;
  loading$ = this.store.select(selectLoading);

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private dialogRef: MatDialogRef<CreateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.createUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern(/^[\+]?[1-9][\d]{0,15}$/)]],
      profileId: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.store.select(selectLoading)
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        if (!loading) {
          // Dialog will close after successful creation
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.createUserForm.valid) {
      const formValue = this.createUserForm.value;
      const createUserData: CreateUserModel = {
        username: formValue.username,
        password: formValue.password,
        role: formValue.role,
        name: formValue.name,
        email: formValue.email || undefined,
        phone: formValue.phone || undefined,
        profileId: formValue.profileId
      };

      this.store.dispatch(userManagementActions.createUser({ user: createUserData }));
      
      setTimeout(() => {
        this.dialogRef.close(true);
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createUserForm.controls).forEach(key => {
      const control = this.createUserForm.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.createUserForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['pattern']) {
        return this.getPatternErrorMessage(fieldName);
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      profileId: 'Profile ID'
    };
    return displayNames[fieldName] || fieldName;
  }

  private getPatternErrorMessage(fieldName: string): string {
    const patternMessages: { [key: string]: string } = {
      username: 'Username must contain only letters, numbers, and underscores',
      password: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      phone: 'Please enter a valid phone number'
    };
    return patternMessages[fieldName] || 'Invalid format';
  }

  getRoleDisplayName(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }
}
