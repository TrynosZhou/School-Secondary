import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { SubjectsModel } from '../models/subjects.model';
import { Observable, Subject } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import * as marksActions from '../store/marks.actions';
import { selectMarksErrorMsg, selectSubjects, isLoading } from '../store/marks.selectors';
import { AddEditSubjectComponent } from './add-edit-subject/add-edit-subject.component';
import { deleteSubjectAction } from '../store/marks.actions';
import { Title } from '@angular/platform-browser';
import { takeUntil } from 'rxjs/operators';
// ConfirmDialogComponent will be lazy loaded

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
})
export class SubjectsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    public title: Title,
    private store: Store,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.title.setTitle('Manage Subjects - School Management System');
  }

  subjects$!: Observable<SubjectsModel[]>;
  errorMsg$!: Observable<string>;
  isLoading$!: Observable<boolean>;

  public dataSource = new MatTableDataSource<SubjectsModel>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['code', 'name', 'action'];

  ngOnInit(): void {
    this.initializeObservables();
    this.setupSubscriptions();
    this.store.dispatch(marksActions.fetchSubjects());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeObservables(): void {
    this.subjects$ = this.store.select(selectSubjects);
    this.errorMsg$ = this.store.select(selectMarksErrorMsg);
    this.isLoading$ = this.store.select(isLoading);
  }

  private setupSubscriptions(): void {
    this.subjects$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((subjects) => {
      this.dataSource.data = subjects;
    });

    // Listen for delete success/failure
    this.store.select(selectMarksErrorMsg).pipe(
      takeUntil(this.destroy$)
    ).subscribe((error) => {
      if (error) {
        this.snackBar.open(error, 'Close', {
          duration: 5000,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['error-snackbar']
        });
      }
    });
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

  openAddEditSubjectDialog(): void {
    const dialogRef = this.dialog.open(AddEditSubjectComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      if (result) {
        // Refresh the subjects list if needed
        this.store.dispatch(marksActions.fetchSubjects());
      }
    });
  }

  openEditSubjectDialog(data: SubjectsModel): void {
    const dialogRef = this.dialog.open(AddEditSubjectComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: true,
      data: data
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe((result) => {
      if (result) {
        // Refresh the subjects list if needed
        this.store.dispatch(marksActions.fetchSubjects());
      }
    });
  }

  async confirmDeleteSubject(subject: SubjectsModel): Promise<void> {
    const { ConfirmDialogComponent } = await import('src/app/shared/confirm-dialog/confirm-dialog.component');
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: {
        title: 'Delete Subject',
        message: `Are you sure you want to delete "${subject.name}" (${subject.code})?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'warning'
      }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.deleteSubject(subject);
      }
    });
  }

  private deleteSubject(subject: SubjectsModel): void {
    this.store.dispatch(deleteSubjectAction({ subject }));
  }
}
