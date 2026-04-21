import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import {
  addClassAction,
  editClassAction,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  // selectAddSuccess,
  selectEnrolErrorMsg,
} from 'src/app/enrolment/store/enrolment.selectors';

@Component({
  selector: 'app-add-edit-class',
  templateUrl: './add-edit-class.component.html',
  styleUrls: ['./add-edit-class.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditClassComponent implements OnInit, OnDestroy {
  addClassForm!: FormGroup;
  errorMsg$!: Observable<string>;
  isLoading = false;
  isEditMode = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddEditClassComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ClassesModel
  ) {
    this.isEditMode = !!data;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.addClassForm = new FormGroup({
      name: new FormControl('', [
        Validators.required, 
        Validators.minLength(2),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9\s]+$/)
      ]),
      form: new FormControl('', [
        Validators.required
      ]),
    });

    if (this.data) {
      console.log('Initializing form with data:', this.data);
      this.addClassForm.patchValue({
        name: this.data.name,
        form: this.data.form.toString() // Convert number to string for dropdown
      });
      console.log('Form value after patch:', this.addClassForm.value);
    }

    // Force change detection after form initialization
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 0);
  }

  private setupObservables(): void {
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
    
    this.errorMsg$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(errorMsg => {
      if (errorMsg) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get name() {
    return this.addClassForm.get('name');
  }

  get form() {
    return this.addClassForm.get('form');
  }

  addClass(): void {
    if (this.addClassForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const formValue = this.addClassForm.value;
    const clas: ClassesModel = {
      ...formValue,
      form: Number(formValue.form)
    };

    if (this.isEditMode) {
      clas.id = this.data.id;
      this.store.dispatch(editClassAction({ clas }));
      this.snackBar.open('Class updated successfully', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    } else {
      this.store.dispatch(addClassAction({ clas }));
      this.snackBar.open('Class added successfully', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }

    this.dialogRef.close(true);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addClassForm.controls).forEach(key => {
      const control = this.addClassForm.get(key);
      control?.markAsTouched();
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  getFormErrorMessage(controlName: string): string {
    const control = this.addClassForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('maxlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must not exceed ${control.errors?.['maxlength'].requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('max')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must not exceed ${control.errors?.['max'].max}`;
    }
    if (control?.hasError('pattern')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} can only contain letters, numbers, and spaces`;
    }
    return '';
  }
}
