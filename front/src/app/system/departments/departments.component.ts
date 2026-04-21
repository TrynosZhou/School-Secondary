import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, finalize, takeUntil, startWith, map } from 'rxjs';
import {
  DepartmentModel,
} from '../../user-management/models/user-management.model';
import { UserManagementService } from '../../user-management/services/user-management.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DepartmentEditDialogComponent } from './department-edit-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  DepartmentsApiService,
  DepartmentDetails,
  TeacherSummary,
  SubjectSummary,
} from './departments-api.service';

@Component({
  selector: 'app-departments',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatSelectModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatAutocompleteModule,
    DepartmentEditDialogComponent,
  ],
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  departments: DepartmentDetails[] = [];
  newDeptName = '';
  newDeptDescription = '';
  saving = false;

  displayedColumns: string[] = ['name', 'description', 'actions'];

  selectedDepartmentId: string | null = null;
  selectedDepartment: DepartmentDetails | null = null;

  allTeachers: TeacherSummary[] = [];
  allSubjects: SubjectSummary[] = [];

  teacherToAddControl = new FormControl<string>('');
  subjectToAddControl = new FormControl<string>('');

  filteredTeachers$ = this.teacherToAddControl.valueChanges.pipe(
    startWith(''),
    map((term) => {
      const q = String(term || '').toLowerCase().trim();
      if (!q) return this.allTeachers;
      return this.allTeachers.filter((t) =>
        `${t.name} ${t.surname} ${t.email}`.toLowerCase().includes(q),
      );
    }),
  );

  filteredSubjects$ = this.subjectToAddControl.valueChanges.pipe(
    startWith(''),
    map((term) => {
      const q = String(term || '').toLowerCase().trim();
      if (!q) return this.allSubjects;
      return this.allSubjects.filter((s) =>
        `${s.code} ${s.name}`.toLowerCase().includes(q),
      );
    }),
  );

  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly departmentsApi: DepartmentsApiService,
    private readonly snackBar: MatSnackBar,
    private readonly cdr: ChangeDetectorRef,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
    this.loadLookups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDepartments(): void {
    this.loading = true;
    this.cdr.markForCheck();
    this.departmentsApi
      .getDepartments()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (departments) => {
          this.departments = departments;
          if (this.selectedDepartmentId) {
            this.selectedDepartment =
              departments.find((d) => d.id === this.selectedDepartmentId) ?? null;
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open(
            'Failed to load departments',
            'Close',
            {
              duration: 4000,
              verticalPosition: 'top',
            },
          );
        },
      });
  }

  private loadLookups(): void {
    this.departmentsApi
      .getTeachers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teachers) => {
          this.allTeachers = teachers ?? [];
          this.cdr.markForCheck();
        },
      });

    this.departmentsApi
      .getSubjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subjects) => {
          this.allSubjects = subjects ?? [];
          this.cdr.markForCheck();
        },
      });
  }

  addDepartment(): void {
    const name = (this.newDeptName || '').trim();
    const description = (this.newDeptDescription || '').trim();

    if (!name) {
      this.snackBar.open('Department name is required', 'Close', {
        duration: 3000,
        verticalPosition: 'top',
      });
      return;
    }

    this.saving = true;
    this.cdr.markForCheck();

    this.userManagementService
      .createDepartment({ name, description: description || undefined })
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          this.newDeptName = '';
          this.newDeptDescription = '';
          this.loadDepartments();
          this.cdr.markForCheck();
          this.snackBar.open('Department created', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Failed to create department', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
        },
      });
  }

  deleteDepartment(id: string): void {
    if (
      !confirm(
        'Delete this department? This may affect teachers currently assigned to it.',
      )
    ) {
      return;
    }

    this.userManagementService
      .deleteDepartment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.departments = this.departments.filter((d) => d.id !== id);
          if (this.selectedDepartmentId === id) {
            this.selectedDepartmentId = null;
            this.selectedDepartment = null;
          }
          this.cdr.markForCheck();
          this.snackBar.open('Department deleted', 'OK', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        error: () => {
          this.snackBar.open('Failed to delete department', 'Close', {
            duration: 5000,
            verticalPosition: 'top',
          });
        },
      });
  }

  editDepartment(dept: DepartmentModel): void {
    const dialogRef = this.dialog.open(DepartmentEditDialogComponent, {
      width: '420px',
      data: { department: dept },
      disableClose: true,
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((updated?: DepartmentModel) => {
      if (!updated) {
        return;
      }
      this.loadDepartments();
    });
  }

  selectDepartment(dept: DepartmentDetails): void {
    this.selectedDepartmentId = dept.id;
    this.selectedDepartment = dept;
    this.cdr.markForCheck();
  }

  formatTeacherName(t: TeacherSummary): string {
    return `${t.name} ${t.surname}`.trim();
  }

  displayTeacherId = (teacherId?: string | null): string => {
    const id = (teacherId ?? '').trim();
    if (!id) return '';
    const t = this.allTeachers.find((x) => x.id === id);
    return t ? `${this.formatTeacherName(t)} (${t.id})` : id;
  };

  displaySubjectCode = (code?: string | null): string => {
    const c = (code ?? '').trim();
    if (!c) return '';
    const s = this.allSubjects.find((x) => x.code === c);
    return s ? `${s.name} (${s.code})` : c;
  };

  setHod(teacherId: string | null): void {
    if (!this.selectedDepartmentId) return;
    this.departmentsApi
      .setHod(this.selectedDepartmentId, teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.departments = this.departments.map((d) => (d.id === updated.id ? updated : d));
          this.selectedDepartment = updated;
          this.cdr.markForCheck();
          this.snackBar.open('HOD updated', 'OK', { duration: 2500, verticalPosition: 'top' });
        },
        error: () => {
          this.snackBar.open('Failed to update HOD', 'Close', { duration: 5000, verticalPosition: 'top' });
        },
      });
  }

  addTeacherToDepartment(): void {
    if (!this.selectedDepartmentId) return;
    const teacherId = (this.teacherToAddControl.value || '').trim();
    if (!teacherId) return;
    this.departmentsApi
      .addTeacher(this.selectedDepartmentId, teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.departments = this.departments.map((d) => (d.id === updated.id ? updated : d));
          this.selectedDepartment = updated;
          this.teacherToAddControl.setValue('');
          this.cdr.markForCheck();
          this.snackBar.open('Teacher assigned', 'OK', { duration: 2500, verticalPosition: 'top' });
        },
        error: () => {
          this.snackBar.open('Failed to assign teacher', 'Close', { duration: 5000, verticalPosition: 'top' });
        },
      });
  }

  removeTeacherFromDepartment(teacherId: string): void {
    if (!this.selectedDepartmentId) return;
    this.departmentsApi
      .removeTeacher(this.selectedDepartmentId, teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.departments = this.departments.map((d) => (d.id === updated.id ? updated : d));
          this.selectedDepartment = updated;
          this.cdr.markForCheck();
          this.snackBar.open('Teacher removed', 'OK', { duration: 2500, verticalPosition: 'top' });
        },
        error: () => {
          this.snackBar.open('Failed to remove teacher', 'Close', { duration: 5000, verticalPosition: 'top' });
        },
      });
  }

  addSubjectToDepartment(): void {
    if (!this.selectedDepartmentId) return;
    const subjectCode = (this.subjectToAddControl.value || '').trim();
    if (!subjectCode) return;
    this.departmentsApi
      .addSubject(this.selectedDepartmentId, subjectCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.departments = this.departments.map((d) => (d.id === updated.id ? updated : d));
          this.selectedDepartment = updated;
          this.subjectToAddControl.setValue('');
          this.cdr.markForCheck();
          this.snackBar.open('Subject linked', 'OK', { duration: 2500, verticalPosition: 'top' });
        },
        error: () => {
          this.snackBar.open('Failed to link subject', 'Close', { duration: 5000, verticalPosition: 'top' });
        },
      });
  }

  removeSubjectFromDepartment(subjectCode: string): void {
    if (!this.selectedDepartmentId) return;
    this.departmentsApi
      .removeSubject(this.selectedDepartmentId, subjectCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.departments = this.departments.map((d) => (d.id === updated.id ? updated : d));
          this.selectedDepartment = updated;
          this.cdr.markForCheck();
          this.snackBar.open('Subject removed', 'OK', { duration: 2500, verticalPosition: 'top' });
        },
        error: () => {
          this.snackBar.open('Failed to remove subject', 'Close', { duration: 5000, verticalPosition: 'top' });
        },
      });
  }
}

