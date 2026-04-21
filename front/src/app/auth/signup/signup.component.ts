import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { SignupInterface } from '../models/signup.model';
import { resetErrorMessage, signupActions } from '../store/auth.actions';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isLoading, selectErrorMsg } from '../store/auth.selectors';
import { ROLES, ROLES_FOR_SELECTION } from 'src/app/registration/models/roles.enum';
import { Title } from '@angular/platform-browser';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentTheme: Theme = 'light';

  constructor(
    private store: Store, 
    private router: Router,
    private title: Title,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Sign Up');
    
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
    
    this.errorMsg$ = this.store.select(selectErrorMsg);
    this.isLoading$ = this.store.select(isLoading);
    this.store.dispatch(resetErrorMessage());

    this.initializeForm();
    this.setupFormValidation();
    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  signupForm!: FormGroup;
  hide = true;
  roles = [...ROLES_FOR_SELECTION];
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  formSubmitted = false;

  private initializeForm(): void {
    this.signupForm = new FormGroup({
      id: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]),
      role: new FormControl('', Validators.required),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9._-]+$/)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100)
      ]),
    });
  }

  private setupFormValidation(): void {
    // Real-time validation feedback
    this.id?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.id?.markAsTouched();
        }
      });

    this.username?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.username?.markAsTouched();
        }
      });

    this.password?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.password?.markAsTouched();
        }
      });
  }

  signup(): void {
    this.formSubmitted = true;
    
    if (this.signupForm.invalid) {
      this.markFormGroupTouched();
      this.showValidationErrors();
      return;
    }

    const formValue = this.signupForm.value;
    const roleValue = this.role?.value || formValue.role;
    
    // Ensure role is set
    if (!roleValue || roleValue === '') {
      this.snackBar.open('Please select a role', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
      this.role?.markAsTouched();
      return;
    }

    const signupData: SignupInterface = {
      id: (formValue.id || '').trim(),
      role: roleValue,
      username: (formValue.username || '').trim(),
      password: formValue.password || ''
    };

    this.store.dispatch(signupActions.signup({ signupData }));
  }

  switchToSignIn(): void {
    this.router.navigateByUrl('/signin');
  }

  // Helper methods for dynamic field labels and hints
  getPlaceholder(): string {
    const role = this.role?.value;
    if (role === 'teacher' || role === 'dev') {
      return '03123456F98';
    } else if (role === 'student') {
      return 'S2405234';
    } else if (role === 'parent') {
      return 'parent@example.com';
    }
    return 'Enter your identifier';
  }

  getHint(): string {
    const role = this.role?.value;
    if (role === 'teacher' || role === 'dev') {
      return 'Format: 03123456F98';
    } else if (role === 'student') {
      return 'Format: S2405234';
    } else if (role === 'parent') {
      return 'Format: parent@example.com';
    }
    return 'Enter your identifier';
  }

  getFieldLabel(): string {
    const role = this.role?.value;
    if (role === 'teacher' || role === 'dev') {
      return 'I.D Number';
    } else if (role === 'student') {
      return 'Student Number';
    } else if (role === 'parent') {
      return 'Email Address';
    }
    return 'Identifier';
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
    if (this.role?.hasError('required')) {
      errors.push('Role is required');
    }

    if (this.id?.hasError('required')) {
      errors.push(`${this.getFieldLabel()} is required`);
    } else if (this.id?.hasError('minlength')) {
      errors.push(`${this.getFieldLabel()} must be at least 3 characters`);
    } else if (this.id?.hasError('maxlength')) {
      errors.push(`${this.getFieldLabel()} must be less than 50 characters`);
    }

    if (this.username?.hasError('required')) {
      errors.push('Username is required');
    } else if (this.username?.hasError('minlength')) {
      errors.push('Username must be at least 2 characters');
    } else if (this.username?.hasError('maxlength')) {
      errors.push('Username must be less than 50 characters');
    } else if (this.username?.hasError('pattern')) {
      errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }

    if (this.password?.hasError('required')) {
      errors.push('Password is required');
    } else if (this.password?.hasError('minlength')) {
      errors.push('Password must be at least 8 characters');
    } else if (this.password?.hasError('maxlength')) {
      errors.push('Password must be less than 100 characters');
    }

    if (errors.length > 0) {
      this.snackBar.open(errors.join(', '), 'Close', {
        duration: 5000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  // Form control getters
  get username() {
    return this.signupForm.get('username');
  }

  get role() {
    return this.signupForm.get('role');
  }

  get id() {
    return this.signupForm.get('id');
  }

  get password() {
    return this.signupForm.get('password');
  }

  // Compare function for mat-select to ensure proper value binding
  compareRoles(role1: string, role2: string): boolean {
    return role1 === role2;
  }

  // Helper method to check if field has error
  hasFieldError(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    }
    if (field.hasError('minlength')) {
      const requiredLength = field.errors['minlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters`;
    }
    if (field.hasError('maxlength')) {
      const requiredLength = field.errors['maxlength'].requiredLength;
      return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be less than ${requiredLength} characters`;
    }
    if (field.hasError('pattern')) {
      return `Invalid ${fieldName} format`;
    }

    return '';
  }
}
