import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { signinActions } from '../store/auth.actions';
import { SigninInterface } from '../models/signin.model';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as fromAuthSelectors from '../store/auth.selectors';
import { Title } from '@angular/platform-browser';
import { resetErrorMessage } from '../store/auth.actions';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentTheme: Theme = 'light';

  constructor(
    private store: Store,
    private router: Router,
    private title: Title,
    private snackBar: MatSnackBar,
    private themeService: ThemeService
  ) {}

  signinForm!: FormGroup;
  hide = true;
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  formSubmitted = false;

  ngOnInit(): void {
    this.title.setTitle('Sign In');
    
    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
    
    this.errorMsg$ = this.store.select(fromAuthSelectors.selectErrorMsg);
    this.isLoading$ = this.store.select(fromAuthSelectors.isLoading);
    this.store.dispatch(resetErrorMessage());

    this.initializeForm();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.signinForm = new FormGroup({
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
      rememberMe: new FormControl(false)
    });
  }

  private setupFormValidation(): void {
    // Real-time validation feedback
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

  get username() {
    return this.signinForm.get('username');
  }

  get password() {
    return this.signinForm.get('password');
  }

  get rememberMe() {
    return this.signinForm.get('rememberMe');
  }

  signin(): void {
    this.formSubmitted = true;

    if (this.signinForm.invalid) {
      this.markFormGroupTouched();
      this.showValidationErrors();
      return;
    }

    const signinData: SigninInterface = {
      username: this.signinForm.value.username.trim(),
      password: this.signinForm.value.password
    };

    // Handle remember me functionality
    if (this.signinForm.value.rememberMe) {
      localStorage.setItem('rememberUsername', signinData.username);
    } else {
      localStorage.removeItem('rememberUsername');
    }

    this.store.dispatch(signinActions.signin({ signinData }));
  }

  switchToSignUp(): void {
    this.router.navigateByUrl('/signup');
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    this.snackBar.open('Forgot password functionality coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signinForm.controls).forEach(key => {
      const control = this.signinForm.get(key);
      control?.markAsTouched();
    });
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
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

  // Helper method to check if field has error
  hasFieldError(fieldName: string): boolean {
    const field = this.signinForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const field = this.signinForm.get(fieldName);
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
