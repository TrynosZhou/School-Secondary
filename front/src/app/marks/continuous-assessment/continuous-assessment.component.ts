import { Component, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { Title } from '@angular/platform-browser';
import {
  ClassRosterEntry,
  ContinuousAssessmentService,
  CreateContinuousAssessmentDto,
} from './continuous-assessment.service';
import { ClassesService } from 'src/app/enrolment/services/classes.service';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';

interface SaveStatus {
  state: 'idle' | 'saving' | 'saved' | 'error';
  message?: string;
}

interface RosterRow extends ClassRosterEntry {
  maxScore?: number | null;
  status: SaveStatus;
}

@Component({
  selector: 'app-continuous-assessment',
  standalone: true,
  templateUrl: './continuous-assessment.component.html',
  styleUrls: ['./continuous-assessment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
})
export class ContinuousAssessmentComponent implements OnInit, OnDestroy {
  classes: ClassesModel[] = [];
  roster: RosterRow[] = [];
  selectedClassName = '';
  canCreate = false;
  isLoadingClasses = false;
  isLoadingRoster = false;

  filtersForm = this.fb.group({
    classId: [null, Validators.required],
    topic: ['', Validators.required],
    assessmentDate: [new Date(), Validators.required],
    assessmentType: ['exercise'],
    maxScore: [null],
  });

  private destroy$ = new Subject<void>();
  private saveTimers = new Map<string, any>();

  constructor(
    private continuousService: ContinuousAssessmentService,
    private classesService: ClassesService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private title: Title,
    private roleAccess: RoleAccessService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Continuous Assessment');
    this.roleAccess.getCurrentRole$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(role => {
        this.canCreate = [ROLES.teacher, ROLES.hod, ROLES.admin, ROLES.director].includes(role as ROLES);
        this.cdr.markForCheck();
      });

    this.isLoadingClasses = true;
    this.classesService
      .getAllClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.classes = classes;
          this.isLoadingClasses = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoadingClasses = false;
          this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 });
          this.cdr.markForCheck();
        },
      });
  }

  loadRoster(): void {
    if (this.filtersForm.invalid) {
      this.filtersForm.markAllAsTouched();
      this.snackBar.open('Select class, topic, and date to load students.', 'Close', { duration: 4000 });
      return;
    }

    const { classId, topic, assessmentDate, assessmentType } = this.filtersForm.value;
    if (!classId || !topic || !assessmentDate) {
      this.snackBar.open('Class, topic, and date are required.', 'Close', { duration: 4000 });
      return;
    }

    const selectedClass = this.classes.find((cls) => Number(cls.id) === Number(classId));
    this.selectedClassName = selectedClass?.name || '';

    const isoDate =
      assessmentDate instanceof Date
        ? assessmentDate.toISOString()
        : new Date(assessmentDate as any).toISOString();

    this.isLoadingRoster = true;
    this.clearSaveTimers();
    this.continuousService
      .getClassRoster(Number(classId), {
        assessmentDate: isoDate,
        topic: topic.trim(),
        assessmentType: assessmentType || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rows) => {
          this.roster = rows.map((row) => ({
            ...row,
            maxScore: row.maxScore ?? (this.filtersForm.value.maxScore ?? null),
            status: { state: row.score != null ? 'saved' : 'idle' },
          }));
          this.isLoadingRoster = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isLoadingRoster = false;
          this.snackBar.open('Failed to load class list', 'Close', { duration: 4000 });
          this.cdr.markForCheck();
        },
      });
  }

  applyMaxScoreToAll(): void {
    const globalMax = this.filtersForm.value.maxScore;
    if (globalMax == null) {
      this.snackBar.open('Enter a value in "Out of" before applying.', 'Close', { duration: 3000 });
      return;
    }
    this.roster.forEach((row) => {
      row.maxScore = globalMax;
      if (row.score != null) {
        this.queueSave(row);
      }
    });
    this.cdr.markForCheck();
  }

  onScoreChange(row: RosterRow): void {
    this.queueSave(row);
  }

  onMaxScoreChange(row: RosterRow): void {
    this.queueSave(row);
  }

  private queueSave(row: RosterRow): void {
    if (!this.canCreate || this.filtersForm.invalid) {
      row.status = { state: 'error', message: 'Complete form first' };
      this.cdr.markForCheck();
      return;
    }

    const key = row.studentId;
    if (this.saveTimers.has(key)) {
      clearTimeout(this.saveTimers.get(key));
    }

    row.status = { state: 'saving' };
    const timer = setTimeout(() => this.saveRow(row), 600);
    this.saveTimers.set(key, timer);
  }

  private saveRow(row: RosterRow): void {
    const { classId, topic, assessmentDate, assessmentType, maxScore } = this.filtersForm.value;
    if (!classId || !topic || !assessmentDate) {
      row.status = { state: 'error', message: 'Missing details' };
      this.cdr.markForCheck();
      return;
    }

    if (row.score == null || isNaN(Number(row.score))) {
      row.status = { state: 'idle' };
      this.cdr.markForCheck();
      return;
    }

    const payload: CreateContinuousAssessmentDto = {
      studentId: row.studentId,
      classId: Number(classId),
      topicOrSkill: topic.trim(),
      assessmentDate:
        assessmentDate instanceof Date ? assessmentDate.toISOString() : new Date(assessmentDate as any).toISOString(),
      score: Number(row.score),
      maxScore: row.maxScore != null ? Number(row.maxScore) : maxScore != null ? Number(maxScore) : undefined,
      assessmentType: assessmentType || 'exercise',
    };

    this.continuousService
      .createEntry(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (entry) => {
          row.status = { state: 'saved', message: 'Saved' };
          row.entryId = entry.id;
          row.maxScore = entry.maxScore ?? row.maxScore;
          this.cdr.markForCheck();
        },
        error: () => {
          row.status = { state: 'error', message: 'Save failed' };
          this.snackBar.open(`Failed to save ${row.studentName}`, 'Close', { duration: 4000 });
          this.cdr.markForCheck();
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.clearSaveTimers();
  }

  private clearSaveTimers(): void {
    this.saveTimers.forEach((timer) => clearTimeout(timer));
    this.saveTimers.clear();
  }
}

