import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { takeUntil, tap, map, startWith, distinctUntilChanged } from 'rxjs/operators';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  fetchClasses,
  fetchTerms,
  getEnrolmentByClass,
} from 'src/app/enrolment/store/enrolment.actions';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
} from 'src/app/enrolment/store/enrolment.selectors';
import { attendanceActions } from '../store/attendance.actions';
import { 
  selectClassAttendance, 
  selectAttendanceLoading, 
  selectAttendanceError 
} from '../store/attendance.selectors';
import { AttendanceRecord } from '../services/attendance.service';

@Component({
  selector: 'app-mark-register',
  templateUrl: './mark-register.component.html',
  styleUrls: ['./mark-register.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkRegisterComponent implements OnInit, OnDestroy {
  terms$!: Observable<TermsModel[]>;
  classes$!: Observable<ClassesModel[]>;
  registerForm!: FormGroup;
  classAttendance$!: Observable<AttendanceRecord[]>;
  isLoading$!: Observable<boolean>;
  errorMsg$!: Observable<string>;
  
  today = new Date();
  selectedDate = new Date();
  destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    private store: Store,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
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
    this.registerForm = new FormGroup({
      term: new FormControl('', [Validators.required]),
      clas: new FormControl('', [Validators.required]),
      date: new FormControl(this.selectedDate, [Validators.required]),
    });
  }

  private setupObservables(): void {
    this.classes$ = this.store.select(selectClasses);
    this.terms$ = this.store.select(selectTerms);
    this.classAttendance$ = this.store.select(selectClassAttendance);
    this.isLoading$ = this.store.select(selectAttendanceLoading);
    this.errorMsg$ = this.store.select(selectAttendanceError);

    // Handle error messages
    this.errorMsg$.pipe(
      takeUntil(this.destroy$),
      tap(errorMsg => {
        if (errorMsg) {
          this.snackBar.open(errorMsg, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      })
    ).subscribe();

    // Handle success messages when attendance is marked
    let previousMarkedId: number | null = null;
    this.store.select((state: any) => state.attendance?.lastMarkedAttendance).pipe(
      takeUntil(this.destroy$),
      tap((lastMarked: any) => {
        if (lastMarked && lastMarked.id !== previousMarkedId) {
          previousMarkedId = lastMarked.id;
          const status = lastMarked.present ? 'Present' : 'Absent';
          // Use student.surname and student.name from the nested student object
          // Note: lastMarked.name is the class name (e.g., "4 Blue"), not the student name
          const student = lastMarked.student || {};
          const studentName = (student.surname && student.name)
            ? `${student.surname}, ${student.name}`
            : student.surname || student.name || lastMarked.studentNumber || 'Student';
          this.snackBar.open(
            `✓ ${studentName} marked as ${status}`,
            'Close',
            {
              duration: 2000,
              panelClass: ['success-snackbar'],
              horizontalPosition: 'end',
              verticalPosition: 'top'
            }
          );
        }
      })
    ).subscribe();

    // Update data source when class attendance changes
    this.classAttendance$.pipe(
      takeUntil(this.destroy$),
      tap(attendance => {
        this.dataSource.data = attendance;
        this.cdr.markForCheck();
      })
    ).subscribe();
  }

  get term() {
    return this.registerForm.get('term');
  }

  get clas() {
    return this.registerForm.get('clas');
  }

  get date() {
    return this.registerForm.get('date');
  }

  displayedColumns: string[] = [
    'index',
    'studentNumber',
    'surname',
    'name',
    'gender',
    'attendance',
  ];

  public dataSource = new MatTableDataSource<AttendanceRecord>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  selectWeek() {
    return Array(7)
      .fill(new Date())
      .map((el, idx) => new Date(el.setDate(el.getDate() - el.getDay() + idx)));
  }

  fetchClassList() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;
    const date = this.date?.value;

    const num = term.num;
    const year = term.year;

    this.store.dispatch(
      attendanceActions.getClassAttendance({ 
        className: name, 
        termNum: num, 
        year, 
        date: date ? date.toISOString().split('T')[0] : undefined 
      })
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  markPresent(attendance: AttendanceRecord, present: boolean) {
    const term: TermsModel = this.term?.value;
    const date = this.date?.value;

    this.store.dispatch(
      attendanceActions.markAttendance({
        studentNumber: attendance.studentNumber,
        className: attendance.className,
        termNum: attendance.termNum,
        year: attendance.year,
        present,
        date: date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      })
    );
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (control?.hasError('required')) {
      return `${this.getFieldDisplayName(controlName)} is required`;
    }
    return '';
  }

  private getFieldDisplayName(controlName: string): string {
    const fieldNames: { [key: string]: string } = {
      term: 'Term',
      clas: 'Class',
      date: 'Date'
    };
    return fieldNames[controlName] || controlName;
  }

  trackByStudentNumber(index: number, attendance: AttendanceRecord): string {
    return attendance.studentNumber;
  }

  getGenderIcon(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }

  getGenderColor(gender: string): string {
    return gender?.toLowerCase() === 'male' ? 'male' : 'female';
  }
}
