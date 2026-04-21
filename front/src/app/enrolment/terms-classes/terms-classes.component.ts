import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable, Subject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap, map, startWith } from 'rxjs/operators';
import { ClassesModel } from '../models/classes.model';
import { TermsModel } from '../models/terms.model';
import { EnrolsModel } from '../models/enrols.model';
import { Residence } from '../models/residence.enum';
import {
  selectClasses,
  selectEnrols,
  selectTerms,
  selectEnrolErrorMsg,
} from '../store/enrolment.selectors';
import {
  UnenrolStudentActions,
  fetchClasses,
  fetchTerms,
  getEnrolmentByClass,
} from '../store/enrolment.actions';
import { EnrolStudentComponent } from './enrol-student/enrol-student.component';
import { SharedService } from 'src/app/shared.service';
import { CurrentEnrolmentComponent } from '../../finance/student-finance/current-enrolment/current-enrolment.component';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { User } from 'src/app/auth/models/user.model';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { formatTermLabel } from '../models/term-label.util';

@Component({
  selector: 'app-terms-classes',
  templateUrl: './terms-classes.component.html',
  styleUrls: ['./terms-classes.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TermsClassesComponent implements OnInit, AfterViewInit, OnDestroy {
  classes$!: Observable<ClassesModel[]>;
  terms$!: Observable<TermsModel[]>;
  enrols$!: Observable<EnrolsModel[]>;
  errorMsg$!: Observable<string>;
  role$!: Observable<User | null>;
  isLoading = false;
  isAdmin$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasRole(ROLES.admin, role))
  );
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  
  searchControl = new FormControl('');
  
  public dataSource = new MatTableDataSource<EnrolsModel>();
  enrolForm!: FormGroup;
  residences = [...Object.values(Residence)];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    public title: Title,
    public sharedService: SharedService,
    private roleAccess: RoleAccessService
  ) {
    this.store.dispatch(fetchClasses());
    this.store.dispatch(fetchTerms());
    this.dataSource.filterPredicate = this.customFilterPredicate;
  }

  ngOnInit(): void {
    this.initializeObservables();
    this.setupSearch();
    this.initializeForm();
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
    this.terms$ = this.store.select(selectTerms);
    this.enrols$ = this.store.select(selectEnrols);
    this.role$ = this.store.select(selectUser);
    this.errorMsg$ = this.store.select(selectEnrolErrorMsg);

    this.enrols$.pipe(
      takeUntil(this.destroy$),
      tap((enrols) => {
        this.dataSource.data = enrols;
        this.isLoading = false;
        this.cdr.markForCheck();
      })
    ).subscribe();

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

  private initializeForm(): void {
    this.enrolForm = new FormGroup({
      clas: new FormControl('', [Validators.required]),
      term: new FormControl('', [Validators.required]),
    });
  }


  get clas() {
    return this.enrolForm.get('clas');
  }

  get term() {
    return this.enrolForm.get('term');
  }

  displayedColumns = [
    'index',
    'studentNumber',
    'surname',
    'name',
    'gender',
    'residence',
    'action',
  ];

  onSearchChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }

  fetchClassList(): void {
    if (this.enrolForm.invalid) {
      this.snackBar.open(
        'Please select both Class and Term to fetch student list.',
        'Close',
        { duration: 3000 }
      );
      this.enrolForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    const num = term.num;
    const year = term.year;
    const termId = term.id;

    this.store.dispatch(getEnrolmentByClass({ name, num, year, termId }));
  }

  openEnrolStudentsDialog(): void {
    console.log('Opening enrollment dialog...');
    
    if (this.enrolForm.invalid) {
      this.snackBar.open(
        'Please select Class and Term before enrolling students.',
        'Close',
        { duration: 3000 }
      );
      this.enrolForm.markAllAsTouched();
      return;
    }

    const name = this.clas?.value;
    const term: TermsModel = this.term?.value;

    if (!name || !term) {
      console.error('Missing class or term data');
      this.snackBar.open('Please select both Class and Term', 'Close', { duration: 3000 });
      return;
    }

    const num = term.num;
    const year = term.year;

    const data = {
      name,
      num,
      year,
    };

    console.log('Dialog data:', data);

    try {
      const dialogRef = this.dialog.open(EnrolStudentComponent, {
        data: data,
        height: '90vh',
        width: '80vw',
        maxWidth: '1200px',
        maxHeight: '90vh',
        disableClose: true,
        panelClass: 'enrol-dialog-panel'
      });

      console.log('Dialog opened successfully');

      dialogRef.afterClosed().pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        console.log('Dialog closed, refreshing class list');
        this.fetchClassList(); // Refresh data after dialog closes
      });
    } catch (error) {
      console.error('Error opening dialog:', error);
      this.snackBar.open('Error opening enrollment dialog', 'Close', { duration: 3000 });
    }
  }

  unenrolStudent(enrol: EnrolsModel): void {
    const confirmUnenrol = confirm(
      `Are you sure you want to unenrol ${enrol.student.name} ${enrol.student.surname}?`
    );
    if (confirmUnenrol) {
      this.store.dispatch(UnenrolStudentActions.unenrolStudent({ enrol }));
      this.snackBar.open('Student unenrolled successfully', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  trackByEnrolId(index: number, enrol: EnrolsModel): string {
    return enrol.student?.studentNumber || `${index}`;
  }

  /**
   * Custom filter predicate for MatTableDataSource to search within EnrolsModel.
   * Filters by student's number, surname, name, gender, and enrol's residence.
   * @param data The EnrolsModel object for the current row.
   * @param filter The filter string entered by the user.
   * @returns True if the row matches the filter, false otherwise.
   */
  customFilterPredicate = (data: EnrolsModel, filter: string): boolean => {
    const searchString = filter.trim().toLowerCase();

    // Explicitly concatenate all searchable fields, handling potential null/undefined
    const studentNumber =
      data.student?.studentNumber?.toString().toLowerCase() || '';
    const surname = data.student?.surname?.toLowerCase() || '';
    const name = data.student?.name?.toLowerCase() || '';
    const gender = data.student?.gender?.toLowerCase() || '';
    const residence = data.residence?.toLowerCase() || ''; // Assuming Residence enum can be converted to string

    // Combine all parts into a single searchable string
    const combinedString = `${studentNumber} ${surname} ${name} ${gender} ${residence}`;

    return combinedString.includes(searchString);
  };

  showCurrentEnrol(enrol: EnrolsModel) {
    const dialogRef = this.dialog.open(CurrentEnrolmentComponent, {
      data: { enrol },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result?.updated && this.enrolForm.valid) {
        const name = this.clas?.value;
        const term: TermsModel = this.term?.value;
        if (name && term) {
          this.store.dispatch(
            getEnrolmentByClass({
              name,
              num: term.num,
              year: term.year,
              termId: term.id,
            })
          );
        }
      }
    });
  }

  formatTerm(term: TermsModel): string {
    return formatTermLabel(term);
  }
}
