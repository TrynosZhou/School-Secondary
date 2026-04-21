import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, map, startWith } from 'rxjs/operators';
import { TermsModel } from '../../models/terms.model';
import {
  deleteTermAction,
  fetchTerms,
} from '../../store/enrolment.actions';
import {
  selectEnrolErrorMsg,
  selectTerms,
} from '../../store/enrolment.selectors';
import { AddEditTermComponent } from './add-edit-term/add-edit-term.component';
import { formatTermLabel } from '../../models/term-label.util';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsComponent implements OnInit, AfterViewInit, OnDestroy {
  terms$!: Observable<TermsModel[]>;
  errorMsg$!: Observable<string>;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  searchControl = new FormControl('');
  yearFilterControl = new FormControl('all');
  
  filteredTerms$!: Observable<TermsModel[]>;

  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.store.dispatch(fetchTerms());
  }

  displayedColumns: string[] = [
    'index',
    'type',
    'label',
    'num',
    'year',
    'startDate',
    'endDate',
    'duration',
    'status',
    'action',
  ];

  public dataSource = new MatTableDataSource<TermsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.initializeObservables();
    this.setupSearch();
    this.setupFiltering();
  }

  private initializeObservables(): void {
    this.terms$ = this.store.select(selectTerms);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);
    
    this.terms$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((terms) => {
      this.dataSource.data = terms;
      this.isLoading = false;
      this.cdr.markForCheck();
    });

    this.errorMsg$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((msg) => {
      if (msg) {
        this.isLoading = false;
        this.cdr.markForCheck();
      }
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
    this.filteredTerms$ = combineLatest([
      this.terms$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.yearFilterControl.valueChanges.pipe(startWith('all'))
    ]).pipe(
      map(([terms, searchTerm, yearFilter]) => {
        let filtered = terms;
        
        // Apply search filter
        if (searchTerm) {
          filtered = filtered.filter(term => 
            term.num.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.year.toString().includes(searchTerm) ||
            (term.type || 'regular').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (term.label || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.startDate.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.endDate.toString().toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply year filter
        if (yearFilter !== 'all') {
          filtered = filtered.filter(term => term.year.toString() === yearFilter);
        }
        
        return filtered;
      }),
      takeUntil(this.destroy$)
    );
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  onFilterChange(): void {
    this.cdr.markForCheck();
  }

  openAddEditTermDialog(): void {
    const dialogRef = this.dialog.open(AddEditTermComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.snackBar.open('Term operation completed successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }

  deleteTerm(term: TermsModel): void {
    const confirmDelete = confirm(
      `Are you sure you want to delete Term ${term.num} ${term.year}?`
    );
    if (confirmDelete) {
      this.store.dispatch(deleteTermAction({ term }));
      this.snackBar.open('Term deleted successfully', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  openEditTermDialog(data: TermsModel): void {
    const dialogRef = this.dialog.open(AddEditTermComponent, {
      data,
      width: '600px',
      maxWidth: '90vw',
      disableClose: true
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.snackBar.open('Term updated successfully', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }

  trackByTermId(index: number, term: TermsModel): string {
    return `${term.num}-${term.year}`;
  }

  getTermStatus(term: TermsModel): string {
    const now = new Date();
    const startDate = new Date(term.startDate);
    const endDate = new Date(term.endDate);
    
    if (now < startDate) {
      return 'upcoming';
    } else if (now >= startDate && now <= endDate) {
      return 'current';
    } else {
      return 'completed';
    }
  }

  getTermDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getAvailableYears(): number[] {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  }

  formatTermLabel(term: TermsModel): string {
    return formatTermLabel(term);
  }
}
