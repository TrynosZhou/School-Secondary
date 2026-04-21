import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import {
  selectAddSuccess,
  selectRegErrorMsg,
  selectIsLoading
} from '../../store/registration.selectors';
import { StudentsModel } from '../../models/students.model';
import {
  resetErrorMsg,
  resetAddSuccess,
  addStudentAction,
  editStudentAction,
} from '../../store/registration.actions';
import { ROLES } from '../../models/roles.enum';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-add-edit-student',
  templateUrl: './add-edit-student.component.html',
  styleUrls: ['./add-edit-student.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddEditStudentComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  genders = ['Male', 'Female'];
  addStudentForm!: FormGroup;
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;
  isLoading = false;

  constructor(
    private store: Store,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AddEditStudentComponent>,
    private cdr: ChangeDetectorRef,
    private title: Title,
    @Inject(MAT_DIALOG_DATA)
    public data: StudentsModel
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.addStudentForm = new FormGroup({
      idnumber: new FormControl('', [
        // Validators.required,
        Validators.minLength(10),
        Validators.pattern(/^[0-9]{2}[0-9]{6}[A-Z]{1}[0-9]{2}$/)
      ]),
      name: new FormControl('', [Validators.required, Validators.minLength(2)]),
      surname: new FormControl('', [Validators.required, Validators.minLength(2)]),
      dob: new FormControl(''),
      gender: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl(''),
      cell: new FormControl('', [Validators.minLength(10)]),
      email: new FormControl('', [Validators.email]),
      address: new FormControl(''),
      prevSchool: new FormControl(''),
      studentNumber: new FormControl(''),
      role: new FormControl(ROLES.student),
    });

    // Patch form with existing data for edit mode
    if (this.data) {
      this.addStudentForm.patchValue({
        ...this.data,
        dob: this.data.dob ? new Date(this.data.dob) : null,
        dateOfJoining: this.data.dateOfJoining ? new Date(this.data.dateOfJoining) : null,
      });
      this.title.setTitle(`Edit Student - ${this.data.name} ${this.data.surname}`);
    } else {
      this.title.setTitle('Add New Student');
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

  get cell() {
    return this.addStudentForm.get('cell');
  }

  get email() {
    return this.addStudentForm.get('email');
  }

  get gender() {
    return this.addStudentForm.get('gender');
  }

  get surname() {
    return this.addStudentForm.get('surname');
  }

  get dateOfJoining() {
    return this.addStudentForm.get('dateOfJoining');
  }

  get name() {
    return this.addStudentForm.get('name');
  }

  get idnumber() {
    return this.addStudentForm.get('idnumber');
  }

  get dob() {
    return this.addStudentForm.get('dob');
  }

  get studentNumber() {
    return this.addStudentForm.get('studentNumber');
  }

  get prevSchool() {
    return this.addStudentForm.get('prevSchool');
  }

  get address() {
    return this.addStudentForm.get('address');
  }


  addStudent(): void {
    this.store.dispatch(resetErrorMsg());

    if (this.addStudentForm.invalid) {
      this.markFormGroupTouched(this.addStudentForm);
      return;
    }

    const formValue = this.addStudentForm.value;
    const student: StudentsModel = {
      ...formValue,
      dob: formValue.dob ? formValue.dob.toISOString() : new Date().toISOString(),
      dateOfJoining: formValue.dateOfJoining ? formValue.dateOfJoining.toISOString() : new Date().toISOString(),
      role: ROLES.student
    };

    if (this.data) {
      this.store.dispatch(editStudentAction({ student }));
      this.snackBar.open('Student updated successfully!', 'Close', {
        duration: 3000,
        verticalPosition: 'top'
      });
    } else {
      this.store.dispatch(resetAddSuccess());
      this.store.dispatch(addStudentAction({ student }));
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
