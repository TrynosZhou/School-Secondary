import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { SubjectsModel } from '../../models/subjects.model';
import { selectMarksErrorMsg, isLoading } from '../../store/marks.selectors';
import {
  addSubjectAction,
  editSubjectActions,
} from '../../store/marks.actions';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-subject',
  templateUrl: './add-edit-subject.component.html',
  styleUrls: ['./add-edit-subject.component.css'],
})
export class AddEditSubjectComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  addSubjectForm!: FormGroup;
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  isEditMode = false;
  formSubmitted = false;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditSubjectComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: SubjectsModel
  ) {
    this.isEditMode = !!this.data;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.initializeObservables();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.addSubjectForm = new FormGroup({
      code: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9\s]+$/)
      ]),
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]),
    });

    if (this.data) {
      this.addSubjectForm.patchValue(this.data);
    }
  }

  private initializeObservables(): void {
    this.errorMsg$ = this.store.select(selectMarksErrorMsg);
    this.isLoading$ = this.store.select(isLoading);
  }

  private setupFormValidation(): void {
    // Real-time validation feedback
    this.code?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.code?.markAsTouched();
        }
      });

    this.name?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        if (this.formSubmitted) {
          this.name?.markAsTouched();
        }
      });
  }

  get code() {
    return this.addSubjectForm.get('code');
  }

  get name() {
    return this.addSubjectForm.get('name');
  }

  addSubject(): void {
    this.formSubmitted = true;
    
    if (this.addSubjectForm.invalid) {
      this.markFormGroupTouched();
      this.showValidationErrors();
      return;
    }

    const subject: SubjectsModel = {
      code: this.addSubjectForm.value.code.trim().toUpperCase(),
      name: this.addSubjectForm.value.name.trim()
    };

    if (this.isEditMode) {
      this.store.dispatch(editSubjectActions.editSubject({ subject }));
    } else {
      this.store.dispatch(addSubjectAction({ subject }));
    }

    // Close dialog after successful submission
    this.dialogRef.close(true);
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addSubjectForm.controls).forEach(key => {
      const control = this.addSubjectForm.get(key);
      control?.markAsTouched();
    });
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
    if (this.code?.hasError('required')) {
      errors.push('Subject code is required');
    } else if (this.code?.hasError('minlength')) {
      errors.push('Subject code must be at least 2 characters');
    } else if (this.code?.hasError('maxlength')) {
      errors.push('Subject code must be less than 20 characters');
    } else if (this.code?.hasError('pattern')) {
      errors.push('Subject code can only contain letters, numbers, and spaces');
    }

    if (this.name?.hasError('required')) {
      errors.push('Subject name is required');
    } else if (this.name?.hasError('minlength')) {
      errors.push('Subject name must be at least 3 characters');
    } else if (this.name?.hasError('maxlength')) {
      errors.push('Subject name must be less than 100 characters');
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
    const field = this.addSubjectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.formSubmitted));
  }

  // Helper method to get field error message
  getFieldErrorMessage(fieldName: string): string {
    const field = this.addSubjectForm.get(fieldName);
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
