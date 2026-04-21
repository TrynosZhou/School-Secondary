import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ClassesModel } from '../../models/classes.model';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  deleteClassAction,
  fetchClasses,
  // resetAddSuccess,
} from '../../store/enrolment.actions';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AddEditClassComponent } from './add-edit-class/add-edit-class.component';
import {
  selectClasses,
  // selectDeleteSuccess,
  selectEnrolErrorMsg,
} from '../../store/enrolment.selectors';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassesComponent implements OnInit, AfterViewInit, OnDestroy {
  classes$!: Observable<ClassesModel[]>;
  errorMsg$!: Observable<string>;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  searchControl = new FormControl('');
  filterControl = new FormControl('all');
  
  filteredClasses$!: Observable<ClassesModel[]>;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public title: Title
  ) {
    this.store.dispatch(fetchClasses());
  }

  displayedColumns: string[] = ['index', 'name', 'form', 'studentCount', 'action'];

  public dataSource = new MatTableDataSource<ClassesModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.initializeObservables();
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

  private initializeObservables(): void {
    this.classes$ = this.store.select(selectClasses);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
    
    this.classes$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((classes) => {
      this.dataSource.data = classes;
      this.isLoading = false;
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
    this.filteredClasses$ = combineLatest([
      this.classes$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.filterControl.valueChanges.pipe(startWith('all'))
    ]).pipe(
      map(([classes, searchTerm, filterValue]) => {
        let filtered = classes;
        
        // Apply search filter
        if (searchTerm) {
          filtered = filtered.filter(cls => 
            cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cls.form.toString().includes(searchTerm)
          );
        }
        
        // Apply form filter
        if (filterValue !== 'all') {
          filtered = filtered.filter(cls => cls.form.toString() === filterValue);
        }
        
        return filtered;
      }),
      takeUntil(this.destroy$)
    );
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  onFilterChange(): void {
    this.cdr.markForCheck();
  }

  trackByClassId(index: number, cls: ClassesModel): string {
    return cls.id || cls.name;
  }

  openAddEditClassDialog(): void {
    const dialogRef = this.dialog.open(AddEditClassComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true
    });
    
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.snackBar.open('Class operation completed successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }

  deleteClass(cls: ClassesModel): void {
    if (confirm(`Are you sure you want to delete class "${cls.name}"? This action cannot be undone.`)) {
      this.store.dispatch(deleteClassAction({ name: cls.name }));
      this.snackBar.open(`Class "${cls.name}" deleted successfully`, 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  openEditClassDialog(cls: ClassesModel): void {
    const dialogRef = this.dialog.open(AddEditClassComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      data: cls
    });
    
    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.snackBar.open('Class updated successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }
}
