import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  selectIsLoading,
  selectRegErrorMsg,
  selectTeachers,
} from '../../store/registration.selectors';
import { MatTableDataSource } from '@angular/material/table';
import { TeachersModel } from '../../models/teachers.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Title } from '@angular/platform-browser';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap, startWith, combineLatest } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teachers-summary-list',
  templateUrl: './teachers-summary-list.component.html',
  styleUrls: ['./teachers-summary-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TeachersSummaryListComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  public dataSource = new MatTableDataSource<TeachersModel>();
  teachers$ = this.store.select(selectTeachers);
  public isLoading$ = this.store.select(selectIsLoading);
  public errorMsg$ = this.store.select(selectRegErrorMsg);
  
  // Form for filtering
  filterForm = new FormGroup({
    search: new FormControl(''),
    role: new FormControl(''),
    status: new FormControl('')
  });

  displayedColumns: string[] = [
    'title',
    'surname', 
    'name',
    'role',
    'cell',
    'email',
    'action',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private store: Store, 
    public title: Title,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupObservables();
    this.setupSearch();
    this.setupFiltering();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupObservables(): void {
    this.teachers$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((teachers) => {
      this.dataSource.data = teachers;
      this.cdr.markForCheck();
    });
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
    });
  }

  private setupFiltering(): void {
    combineLatest([
      this.filterForm.get('search')!.valueChanges.pipe(startWith('')),
      this.filterForm.get('role')!.valueChanges.pipe(startWith('')),
      this.filterForm.get('status')!.valueChanges.pipe(startWith(''))
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([search, role, status]) => {
      this.dataSource.filterPredicate = (data: TeachersModel, filter: string) => {
        const searchMatch = !search || 
          data.name.toLowerCase().includes(search.toLowerCase()) ||
          data.surname.toLowerCase().includes(search.toLowerCase()) ||
          data.email.toLowerCase().includes(search.toLowerCase()) ||
          data.cell.toLowerCase().includes(search.toLowerCase());
        
        const roleMatch = !role || data.role === role;
        const statusMatch = !status || data.active.toString() === status;
        
        return searchMatch && roleMatch && statusMatch;
      };
      
      this.dataSource.filter = 'trigger';
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  viewTeacher(teacher: TeachersModel): void {
    this.router.navigate(['/teachers', teacher.id]);
  }

  trackByTeacherId(index: number, teacher: TeachersModel): string {
    return teacher.id;
  }
}
