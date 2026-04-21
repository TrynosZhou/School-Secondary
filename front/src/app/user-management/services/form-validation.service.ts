/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormValidationService {

  constructor() { }

  // Custom validators
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /\d/.test(value);
      const hasSpecialChar = /[@$!%*?&]/.test(value);
      const hasMinLength = value.length >= 8;

      const errors: ValidationErrors = {};

      if (!hasMinLength) errors['minLength'] = { requiredLength: 8 };
      if (!hasUpperCase) errors['noUpperCase'] = true;
      if (!hasLowerCase) errors['noLowerCase'] = true;
      if (!hasNumeric) errors['noNumeric'] = true;
      if (!hasSpecialChar) errors['noSpecialChar'] = true;

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static usernameFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value;
      const isValidFormat = /^[a-zA-Z0-9_]+$/.test(value);
      const hasMinLength = value.length >= 3;
      const hasMaxLength = value.length <= 20;

      const errors: ValidationErrors = {};

      if (!hasMinLength) errors['minLength'] = { requiredLength: 3 };
      if (!hasMaxLength) errors['maxLength'] = { requiredLength: 20 };
      if (!isValidFormat) errors['invalidFormat'] = true;

      return Object.keys(errors).length > 0 ? errors : null;
    };
  }

  static phoneFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value;
      const isValidFormat = /^[\+]?[1-9][\d]{0,15}$/.test(value);

      return !isValidFormat ? { invalidFormat: true } : null;
    };
  }

  static emailFormat(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const value = control.value;
      const isValidFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      return !isValidFormat ? { invalidFormat: true } : null;
    };
  }

  // Error message getters
  getPasswordErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) return 'Password is required';
    if (errors['minLength']) return `Password must be at least ${errors['minLength'].requiredLength} characters`;
    if (errors['noUpperCase']) return 'Password must contain at least one uppercase letter';
    if (errors['noLowerCase']) return 'Password must contain at least one lowercase letter';
    if (errors['noNumeric']) return 'Password must contain at least one number';
    if (errors['noSpecialChar']) return 'Password must contain at least one special character (@$!%*?&)';
    return 'Invalid password format';
  }

  getUsernameErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) return 'Username is required';
    if (errors['minLength']) return `Username must be at least ${errors['minLength'].requiredLength} characters`;
    if (errors['maxLength']) return `Username must be no more than ${errors['maxLength'].requiredLength} characters`;
    if (errors['invalidFormat']) return 'Username must contain only letters, numbers, and underscores';
    return 'Invalid username format';
  }

  getPhoneErrorMessage(errors: ValidationErrors): string {
    if (errors['invalidFormat']) return 'Please enter a valid phone number';
    return 'Invalid phone format';
  }

  getEmailErrorMessage(errors: ValidationErrors): string {
    if (errors['required']) return 'Email is required';
    if (errors['invalidFormat']) return 'Please enter a valid email address';
    return 'Invalid email format';
  }

  getGenericErrorMessage(errors: ValidationErrors, fieldName: string): string {
    if (errors['required']) return `${fieldName} is required`;
    if (errors['minLength']) return `${fieldName} must be at least ${errors['minLength'].requiredLength} characters`;
    if (errors['maxLength']) return `${fieldName} must be no more than ${errors['maxLength'].requiredLength} characters`;
    if (errors['invalidFormat']) return `Invalid ${fieldName.toLowerCase()} format`;
    return `Invalid ${fieldName.toLowerCase()}`;
  }

  // Form validation helpers
  markFormGroupTouched(formGroup: any): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasFormErrors(formGroup: any): boolean {
    return Object.keys(formGroup.controls).some(key => {
      const control = formGroup.get(key);
      return control?.invalid && control?.touched;
    });
  }

  getFormErrors(formGroup: any): string[] {
    const errors: string[] = [];
    
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control?.invalid && control?.touched) {
        const fieldErrors = control.errors;
        if (fieldErrors) {
          Object.keys(fieldErrors).forEach(errorKey => {
            errors.push(`${key}: ${this.getGenericErrorMessage(fieldErrors, key)}`);
          });
        }
      }
    });

    return errors;
  }

  // Password strength checker
  getPasswordStrength(password: string): {
    score: number;
    label: string;
    color: string;
    requirements: { text: string; met: boolean }[];
  } {
    const requirements = [
      { text: 'At least 8 characters', met: password.length >= 8 },
      { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
      { text: 'Contains number', met: /\d/.test(password) },
      { text: 'Contains special character', met: /[@$!%*?&]/.test(password) }
    ];

    const metRequirements = requirements.filter(req => req.met).length;
    const score = Math.round((metRequirements / requirements.length) * 100);

    let label: string;
    let color: string;

    if (score < 40) {
      label = 'Weak';
      color = 'warn';
    } else if (score < 80) {
      label = 'Medium';
      color = 'accent';
    } else {
      label = 'Strong';
      color = 'primary';
    }

    return { score, label, color, requirements };
  }
}


