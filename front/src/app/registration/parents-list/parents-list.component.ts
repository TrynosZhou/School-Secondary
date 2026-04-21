import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Subject, of } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  catchError,
} from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ParentsModel } from '../models/parents.model';
import { ParentsService } from '../services/parents.service';
import { Title } from '@angular/platform-browser';
import { AddEditParentDialogComponent } from './add-edit-parent-dialog/add-edit-parent-dialog.component';
import { LinkStudentsDialogComponent } from './link-students-dialog/link-students-dialog.component';
import { ConfirmDialogComponent } from 'src/app/shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-parents-list',
  templateUrl: './parents-list.component.html',
  styleUrls: ['./parents-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ParentsListComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild(MatSort) sort!: MatSort;
  displayedColumns: string[] = [
    'title',
    'surname',
    'email',
    'cell',
    'linkedStudents',
    'action',
  ];
  dataSource = new MatTableDataSource<ParentsModel>([]);
  isLoading = false;
  errorMsg: string | null = null;
  searchControl = new FormControl<string>('', { nonNullable: true });

  constructor(
    private parentsService: ParentsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public title: Title,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Manage Parents');
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(this.searchControl.value || ''),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe((term) => {
        this.fetchParents(term || '');
      });
  }

  loadParents(): void {
    // Explicitly reload using the current search term (e.g., after add/edit/delete/link).
    const currentTerm = this.searchControl.value || '';
    this.fetchParents(currentTerm);
  }

  private fetchParents(term: string): void {
    this.isLoading = true;
    this.errorMsg = null;
    this.cdr.markForCheck();
    this.parentsService
      .search(term || '')
      .pipe(
        takeUntil(this.destroy$),
        catchError((err) => {
          const msg =
            err?.error?.message || err?.message || 'Failed to load parents';
          this.errorMsg = msg;
          this.snackBar.open(msg, 'Close', { duration: 5000 });
          this.cdr.markForCheck();
          return of<ParentsModel[]>([]);
        }),
      )
      .subscribe((parents) => {
        this.dataSource.data = parents;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(AddEditParentDialogComponent, {
      width: '500px',
      data: { parent: null },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('Parent added successfully', 'Close', {
            duration: 3000,
          });
          this.loadParents();
        }
      });
  }

  openEditDialog(parent: ParentsModel): void {
    const dialogRef = this.dialog.open(AddEditParentDialogComponent, {
      width: '500px',
      data: { parent: { ...parent } },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.snackBar.open('Parent updated successfully', 'Close', {
            duration: 3000,
          });
          this.loadParents();
        }
      });
  }

  openLinkStudentsDialog(parent: ParentsModel): void {
    // IMPORTANT: backend endpoint is "replace-all" (setLinkedStudents). To avoid accidentally
    // unlinking existing students, always load the latest parent (with current students)
    // before opening the dialog.
    this.isLoading = true;
    this.cdr.markForCheck();
    this.parentsService
      .getByEmail(parent.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (freshParent) => {
          this.isLoading = false;
          const dialogRef = this.dialog.open(LinkStudentsDialogComponent, {
            width: '600px',
            data: { parent: freshParent },
          });
          dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result: ParentsModel | undefined) => {
              if (result) {
                this.snackBar.open('Linked students updated', 'Close', {
                  duration: 3000,
                });
                this.mergeUpdatedParent(result);
                // Refresh this row from the server (includes relations) so the table reflects persisted state.
                this.parentsService
                  .getByEmail(result.email)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: (fresh) => this.mergeUpdatedParent(fresh),
                    error: () => {
                      // If refresh fails, keep the merged payload (still useful for immediate feedback).
                    },
                  });
              }
            });
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.isLoading = false;
          const msg =
            err?.error?.message ||
            err?.message ||
            'Failed to load parent details';
          this.snackBar.open(msg, 'Close', { duration: 5000 });
          this.cdr.markForCheck();
        },
      });
  }

  /** Merge updated parent (e.g. from link-students dialog) into the table so UI updates without waiting for refetch. */
  private mergeUpdatedParent(updated: ParentsModel): void {
    const email = updated?.email;
    if (!email) return;
    const idx = this.dataSource.data.findIndex((p) => p.email === email);
    if (idx === -1) return;
    const students = Array.isArray(updated.students) ? updated.students : [];
    const merged: ParentsModel = { ...this.dataSource.data[idx], ...updated, students };
    const newData = [...this.dataSource.data];
    newData[idx] = merged;
    this.dataSource.data = newData;
    // Force table to re-render (MatTableDataSource + OnPush)
    this.dataSource._updateChangeSubscription();
    this.cdr.markForCheck();
  }

  deleteParent(parent: ParentsModel): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Parent',
        message: `Are you sure you want to delete ${parent.title} ${parent.surname} (${parent.email})? This will unlink any linked students.`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
      },
    });
    ref
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.parentsService
            .delete(parent.email)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.snackBar.open('Parent deleted successfully', 'Close', {
                  duration: 3000,
                });
                this.loadParents();
              },
              error: (err) => {
                this.snackBar.open(
                  err.error?.message || err.message || 'Delete failed',
                  'Close',
                  { duration: 5000 },
                );
              },
            });
        }
      });
  }

  getLinkedStudentsLabel(parent: ParentsModel): string {
    const students = Array.isArray(parent?.students) ? parent.students : [];
    if (students.length === 0) return 'None';
    if (students.length === 1) {
      const s = students[0];
      return s.studentNumber + (s.name ? ` (${s.name} ${s.surname || ''})` : '');
    }
    return `${students.length} students`;
  }
}
