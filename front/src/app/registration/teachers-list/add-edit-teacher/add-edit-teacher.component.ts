import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TeachersModel } from '../../models/teachers.model';
import {
  resetAddSuccess,
  addTeacherAction,
  editTeacherAction,
} from '../../store/registration.actions';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  selectAddSuccess,
  selectRegErrorMsg,
  selectIsLoading
} from '../../store/registration.selectors';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ROLES, ROLES_FOR_SELECTION } from '../../models/roles.enum';

@Component({
  selector: 'app-add-edit-teacher',
  templateUrl: './add-edit-teacher.component.html',
  styleUrls: ['./add-edit-teacher.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditTeacherComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  genders = ['Male', 'Female'];
  titles = ['Prof', 'Dr', 'Mr', 'Mrs', 'Miss', 'Ms'];
  addTeacherForm!: FormGroup;
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  activeValues = [true, false];
  roles = ROLES_FOR_SELECTION;
  isLoading = false;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditTeacherComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA)
    public data: TeachersModel
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
  }

  private initializeForm(): void {
    this.addTeacherForm = new FormGroup({
      id: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9]{2}[0-9]{6}[A-Z]{1}[0-9]{2}$/)]),
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]),
      surname: new FormControl('', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s]+$/)]),
      dob: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl('', [Validators.required]),
      dateOfLeaving: new FormControl(''),
      qualifications: new FormArray([]),
      cell: new FormControl('', [Validators.required, Validators.minLength(10), Validators.pattern(/^[0-9+\-\s()]+$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      address: new FormControl(''),
      role: new FormControl('', [Validators.required]),
      active: new FormControl(true, [Validators.required]),
    });

    // Patch form with existing data if editing
    if (this.data) {
      this.addTeacherForm.patchValue({
        ...this.data,
        dob: this.data.dob ? new Date(this.data.dob) : null,
        dateOfJoining: this.data.dateOfJoining ? new Date(this.data.dateOfJoining) : null,
        dateOfLeaving: this.data.dateOfLeaving ? new Date(this.data.dateOfLeaving) : null,
      });

      // Add existing qualifications
      if (this.data.qualifications && this.data.qualifications.length > 0) {
        this.data.qualifications.forEach(qual => {
          this.addQualification(qual);
        });
      }
    } else {
      // Add one empty qualification field for new teachers
      this.addQualification();
    }
  }

  private setupObservables(): void {
    this.errorMsg$ = this.store.select(selectRegErrorMsg);
    this.isLoading$ = this.store.select(selectIsLoading);
    
    this.isLoading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
      this.cdr.markForCheck();
    });

    this.store.select(selectAddSuccess).pipe(
      takeUntil(this.destroy$)
    ).subscribe(addSuccess => {
      if (addSuccess === true) {
        this.dialogRef.close(true);
        this.store.dispatch(resetAddSuccess());
      }
    });
  }


  get role() {
    return this.addTeacherForm.get('role');
  }

  get qualifications() {
    return this.addTeacherForm.get('qualifications') as FormArray;
  }

  get cell() {
    return this.addTeacherForm.get('cell');
  }

  get email() {
    return this.addTeacherForm.get('email');
  }

  get gender() {
    return this.addTeacherForm.get('gender');
  }

  get title() {
    return this.addTeacherForm.get('title');
  }

  get surname() {
    return this.addTeacherForm.get('surname');
  }

  get dateOfJoining() {
    return this.addTeacherForm.get('dateOfJoining');
  }

  get name() {
    return this.addTeacherForm.get('name');
  }

  get id() {
    return this.addTeacherForm.get('id');
  }

  get dob() {
    return this.addTeacherForm.get('dob');
  }

  get dateOfLeaving() {
    return this.addTeacherForm.get('dateOfLeaving');
  }

  get active() {
    return this.addTeacherForm.get('active');
  }

  addTeacher() {
    if (this.addTeacherForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.addTeacherForm.value;
    const teacher: TeachersModel = {
      ...formValue,
      dob: formValue.dob ? formValue.dob.toISOString() : new Date().toISOString(),
      dateOfJoining: formValue.dateOfJoining ? formValue.dateOfJoining.toISOString() : new Date().toISOString(),
      qualifications: formValue.qualifications.filter((qual: string) => qual && qual.trim().length > 0)
    };
    if (formValue.dateOfLeaving) {
      teacher.dateOfLeaving = formValue.dateOfLeaving.toISOString();
    }

    if (this.data) {
      this.store.dispatch(editTeacherAction({ teacher }));
    } else {
      this.store.dispatch(resetAddSuccess());
      this.store.dispatch(addTeacherAction({ teacher }));
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.addTeacherForm.controls).forEach(key => {
      const control = this.addTeacherForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          arrayControl.markAsTouched();
        });
      }
    });
  }

  addQualification(value: string = '') {
    // Qualifications are optional; empty entries are filtered out on submit.
    const qual = new FormControl(value);
    this.qualifications.push(qual);
    this.cdr.markForCheck();
  }

  addControl() {
    this.addQualification();
  }

  delete(qualIndex: number) {
    this.qualifications.removeAt(qualIndex);
    this.cdr.markForCheck();
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
