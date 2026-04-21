import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { TeachersModel } from '../models/teachers.model';
import {
  // selectDeleteSuccess,
  selectIsLoading,
  selectRegErrorMsg,
  selectTeachers,
} from '../store/registration.selectors';
import { map, Observable, Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, startWith, combineLatest } from 'rxjs';
import {
  deleteTeacherAction,
  fetchTeachers,
  resetAddSuccess,
} from '../store/registration.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { AddEditTeacherComponent } from './add-edit-teacher/add-edit-teacher.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-teachers-list',
  templateUrl: './teachers-list.component.html',
  styleUrls: ['./teachers-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeachersListComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(fetchTeachers());
  }

  private teachers$!: Observable<TeachersModel[]>;
  filteredTeachers$!: Observable<TeachersModel[]>;
  public errorMsg$!: Observable<string>;
  public isLoading$ = this.store.select(selectIsLoading);

  filtersForm!: FormGroup;

  displayedColumns: string[] = [
    'id',

    'title',
    'surname',
    'name',
    'role',
    'cell',
    'email',
    // 'address',

    // 'active',

    'action',
  ];
  public dataSource = new MatTableDataSource<TeachersModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.initializeForm();
    this.setupObservables();
    this.setupSearch();
    this.setupFiltering();
  }

  private initializeForm(): void {
    this.filtersForm = new FormGroup({
      males: new FormControl(true),
      females: new FormControl(true),
      active: new FormControl(true),
      inactive: new FormControl(true),
    });
  }

  private setupObservables(): void {
    this.teachers$ = this.store.select(selectTeachers);
    this.errorMsg$ = this.store.select(selectRegErrorMsg);
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.dataSource.filter = searchTerm.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
      this.cdr.markForCheck();
    });
  }

  private setupFiltering(): void {
    // Combine teachers data with form changes for efficient filtering
    combineLatest([
      this.teachers$,
      this.filtersForm.valueChanges.pipe(startWith(this.filtersForm.value))
    ]).pipe(
      map(([teachers, filters]) => this.applyFilters(teachers, filters)),
      takeUntil(this.destroy$)
    ).subscribe((filteredTeachers) => {
      this.dataSource.data = filteredTeachers;
      this.cdr.markForCheck();
    });
  }

  applyFilters(teachers: TeachersModel[], filters?: any): TeachersModel[] {
    if (!teachers) {
      return [];
    }

    const filterValues = filters || this.filtersForm.value;

    return teachers.filter((teacher) => {
      const genderMatch = (filterValues.males && teacher.gender === 'Male') || 
                         (filterValues.females && teacher.gender === 'Female');
      const statusMatch = (filterValues.active && teacher.active === true) || 
                         (filterValues.inactive && teacher.active === false);

      return genderMatch && statusMatch;
    });
  }

  get males() {
    return this.filtersForm.get('males');
  }
  get females() {
    return this.filtersForm.get('females');
  }
  get active() {
    return this.filtersForm.get('active');
  }
  get inactive() {
    return this.filtersForm.get('inactive');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchSubject.next(filterValue);
  }

  // TrackBy function for better performance
  trackByTeacherId(index: number, teacher: TeachersModel): string {
    return teacher.id;
  }

  openAddTeacherDialog() {
    const dialogRef = this.dialog.open(AddEditTeacherComponent);
    dialogRef.disableClose = true;
  }

  openEditTeacherDialog(data: TeachersModel) {
    this.dialog.open(AddEditTeacherComponent, { data });
  }

  deleteTeacher(id: string) {
    if (confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
      this.store.dispatch(deleteTeacherAction({ id }));
      this.snackBar.open('Teacher deleted successfully', 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRowColor(teacher: TeachersModel): string {
    if (teacher.active === false) {
      return 'inactive';
    } else return 'active';
  }

  openTeacherView(teacher: TeachersModel) {
    this.router.navigate(['/teacher-view', teacher.id]);
  }
}
