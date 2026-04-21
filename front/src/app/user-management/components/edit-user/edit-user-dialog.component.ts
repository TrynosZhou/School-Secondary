import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Subject, takeUntil, switchMap, catchError, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UserManagementService } from '../../services/user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { DepartmentModel } from '../../models/user-management.model';

@Component({
  selector: 'app-edit-user-dialog',
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
    MatSlideToggleModule,
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  editUserForm: FormGroup;
  loading = false;
  // For user-management only, allow all roles including dev
  roles = Object.values(ROLES);
  departments: DepartmentModel[] = [];

  constructor(
    private fb: FormBuilder,
    private userManagementService: UserManagementService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editUserForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', [Validators.required]],
      name: ['', [Validators.required]],
      surname: [''],
      email: ['', [this.optionalEmailValidator]],
      cell: [''],
      address: [''],
      departmentId: [''],
      active: [true],
    });
  }

  ngOnInit(): void {
    // Initialize form with user data when available
    if (this.data.user) {
      this.editUserForm.patchValue({
        username: this.data.user.username || '',
        role: this.data.user.role || '',
        name: this.data.user.name || '',
        surname: this.data.user.surname || '',
        email: this.data.user.email || '',
        cell: this.data.user.cell || '',
        address: this.data.user.address || '',
        departmentId: this.data.user.departmentId || '',
        active: this.data.user.active !== undefined ? this.data.user.active : true,
      });
    }

    this.userManagementService
      .getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (departments) => (this.departments = departments),
        error: () => {
          // Silent failure – department selection is optional and falls back gracefully
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.editUserForm.valid) {
      this.loading = true;
      const formValue = this.editUserForm.value;
      
      // Prepare profile data (exclude username)
      // Include active status in profile data for backend to handle
      const { username, role, departmentId, ...profileData } = formValue;

      const profileUpdate = {
        ...profileData,
        ...(departmentId ? { departmentId } : {}),
      };

      // Chain both updates using RxJS operators
      this.userManagementService.updateUser(this.data.userId, { username: formValue.username, role: formValue.role })
        .pipe(
          switchMap(accountResponse =>
            this.userManagementService.updateProfile(this.data.userId, profileUpdate)
          ),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: (profileResponse) => {
            this.loading = false;
            // Close dialog first
            this.dialogRef.close(true);
            // Then show success message
            this.snackBar.open('User updated successfully', 'OK', {
              duration: 3000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          },
          error: (error) => {
            this.loading = false;
            this.snackBar.open('Failed to update user', 'Close', {
              duration: 5000,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          }
        });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getFieldError(fieldName: string): string {
    const field = this.editUserForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  // Check if form has any changes
  hasFormChanges(): boolean {
    if (!this.data.user) return false;
    
    const currentValues = {
      username: this.data.user.username || '',
      role: this.data.user.role || '',
      name: this.data.user.name || '',
      surname: this.data.user.surname || '',
      email: this.data.user.email || '',
      cell: this.data.user.cell || '',
      address: this.data.user.address || '',
      active: this.data.user.active !== undefined ? this.data.user.active : true,
    };

    const formValues = this.editUserForm.value;
    
    return Object.keys(currentValues).some(key => 
      currentValues[key as keyof typeof currentValues] !== formValues[key as keyof typeof formValues]
    );
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      username: 'Username',
      name: 'Name',
      surname: 'Surname',
      email: 'Email',
      cell: 'Phone',
      address: 'Address',
    };
    return displayNames[fieldName] || fieldName;
  }

  // Custom validator for optional email
  private optionalEmailValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value || control.value.trim() === '') {
      return null; // Valid when empty
    }
    return Validators.email(control); // Use standard email validator when not empty
  }
}

