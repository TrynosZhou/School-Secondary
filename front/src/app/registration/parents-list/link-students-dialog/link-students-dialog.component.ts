import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentsModel } from '../../models/parents.model';
import { ParentsService } from '../../services/parents.service';
import { StudentsModel } from '../../models/students.model';
import { StudentSearchComponent } from 'src/app/shared/search-by-student-number/search-by-student-number.component';
import { Store } from '@ngrx/store';
import { fetchStudents } from '../../store/registration.actions';
import { selectStudents } from '../../store/registration.selectors';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { map, filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-link-students-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    StudentSearchComponent,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Link students to {{ data.parent.title }} {{ data.parent.surname }}</h2>
    <mat-dialog-content>
      <p class="hint">Select the children linked to this parent. They will be able to view finances and reports for these students when logged in.</p>
      <div class="search-row">
        <app-student-search (studentSelected)="addStudent($event)"></app-student-search>
      </div>

      <mat-form-field appearance="outline" class="bulk-field">
        <mat-label>Add by student number(s)</mat-label>
        <input
          matInput
          [(ngModel)]="bulkInput"
          (keyup.enter)="addBulk()"
          placeholder="e.g. S2403003, S2502607"
        />
        <button mat-icon-button matSuffix type="button" (click)="addBulk()" [disabled]="!bulkInput.trim()">
          <mat-icon>add</mat-icon>
        </button>
      </mat-form-field>

      <div class="selected-block">
        <div class="selected-title">
          Linked students
          <span class="count">({{ selectedStudentNumbers.size }})</span>
          <button mat-button type="button" class="clear-btn" (click)="clearAll()" *ngIf="selectedStudentNumbers.size > 0">
            Clear
          </button>
        </div>
        <p class="empty" *ngIf="selectedStudentNumbers.size === 0">No linked students selected.</p>
        <mat-chip-set *ngIf="selectedStudentNumbers.size > 0" aria-label="Linked students">
          <mat-chip *ngFor="let sn of selectedStudentNumbersArray" (removed)="removeStudent(sn)">
            {{ formatStudent(sn) }}
            <button matChipRemove aria-label="Remove linked student">
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        </mat-chip-set>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="saving || !hasChanges">
        {{ saving ? 'Saving...' : 'Save' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .hint { margin-bottom: 16px; color: rgba(0,0,0,0.6); font-size: 14px; }
      .search-row { margin-bottom: 12px; }
      .bulk-field { width: 100%; }
      .selected-block { margin-top: 16px; }
      .selected-title { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 8px; }
      .count { font-weight: 500; color: rgba(0,0,0,0.6); }
      .clear-btn { margin-left: auto; }
      .empty { margin: 0; color: rgba(0,0,0,0.6); font-size: 13px; }
    `,
  ],
})
export class LinkStudentsDialogComponent implements OnInit {
  private studentsIndex = new Map<string, StudentsModel>();
  private destroy$ = new Subject<void>();
  selectedStudentNumbers = new Set<string>();
  private initialSelected = new Set<string>();
  bulkInput = '';
  saving = false;

  constructor(
    private parentsService: ParentsService,
    private store: Store,
    private dialogRef: MatDialogRef<LinkStudentsDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { parent: ParentsModel },
  ) {
    const linked = data.parent.students || [];
    linked.forEach((s) => this.selectedStudentNumbers.add(s.studentNumber));
    linked.forEach((s) => this.initialSelected.add(s.studentNumber));
  }

  ngOnInit(): void {
    // Ensure students are available for the search component.
    this.store.dispatch(fetchStudents());

    // Build an index so we can show nice labels in chips.
    this.store
      .select(selectStudents)
      .pipe(
        map((list) => list || []),
        filter((list) => list.length > 0),
        takeUntil(this.destroy$),
      )
      .subscribe((list) => {
        this.studentsIndex = new Map(list.map((s) => [s.studentNumber, s]));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get selectedStudentNumbersArray(): string[] {
    return Array.from(this.selectedStudentNumbers).sort();
  }

  get hasChanges(): boolean {
    if (this.initialSelected.size !== this.selectedStudentNumbers.size) return true;
    for (const sn of this.selectedStudentNumbers) {
      if (!this.initialSelected.has(sn)) return true;
    }
    return false;
  }

  addStudent(student: StudentsModel): void {
    if (!student?.studentNumber) return;
    if (this.selectedStudentNumbers.has(student.studentNumber)) {
      this.snackBar.open('Student already linked', 'Close', { duration: 2000 });
      return;
    }
    this.selectedStudentNumbers.add(student.studentNumber);
    this.studentsIndex.set(student.studentNumber, student);
    this.snackBar.open(`Added ${student.studentNumber}`, 'Close', { duration: 2000 });
  }

  removeStudent(studentNumber: string): void {
    this.selectedStudentNumbers.delete(studentNumber);
  }

  clearAll(): void {
    this.selectedStudentNumbers.clear();
  }

  addBulk(): void {
    const raw = (this.bulkInput || '').trim();
    if (!raw) return;
    const tokens = raw
      .split(/[\s,;]+/g)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    let added = 0;
    let skipped = 0;
    let notFound = 0;

    for (const sn of tokens) {
      if (this.selectedStudentNumbers.has(sn)) {
        skipped++;
        continue;
      }
      const s = this.studentsIndex.get(sn);
      if (s) {
        this.selectedStudentNumbers.add(sn);
        added++;
      } else {
        // Allow adding unknown student numbers (in case store isn't loaded yet),
        // but flag it to the user.
        this.selectedStudentNumbers.add(sn);
        notFound++;
      }
    }

    this.bulkInput = '';
    const parts = [
      added ? `Added ${added}` : null,
      skipped ? `Skipped ${skipped}` : null,
      notFound ? `Unknown ${notFound}` : null,
    ].filter(Boolean);
    this.snackBar.open(parts.join(' • ') || 'Done', 'Close', { duration: 3000 });
  }

  formatStudent(studentNumber: string): string {
    const s = this.studentsIndex.get(studentNumber);
    if (!s) return studentNumber;
    const name = `${s.name || ''} ${s.surname || ''}`.trim();
    return name ? `${studentNumber} – ${name}` : studentNumber;
  }

  save(): void {
    if (this.saving) return;
    const studentNumbers = Array.from(this.selectedStudentNumbers)
      .map((sn) => (sn || '').trim())
      .filter(Boolean);
    if (!this.hasChanges) {
      this.snackBar.open('No changes to save', 'Close', { duration: 2000 });
      return;
    }
    // Guardrail: prevent accidental unlinking if selection is empty due to a UI/state bug.
    if (studentNumbers.length === 0 && this.initialSelected.size > 0) {
      this.snackBar.open(
        'No linked students selected. This would unlink all existing students — please reselect and try again.',
        'Close',
        { duration: 6000 },
      );
      return;
    }
    this.saving = true;
    this.parentsService
      .setLinkedStudents(this.data.parent.email, studentNumbers)
      .subscribe({
        next: () => {
          this.snackBar.open('Linked students updated', 'Close', { duration: 2000 });
          // Always pass students from what we just saved (selection), so the list can show them without relying on API response
          const students = studentNumbers.slice().sort().map((sn) => {
            const s = this.studentsIndex.get(sn);
            return { studentNumber: sn, name: s?.name, surname: s?.surname };
          });
          const payload: ParentsModel = {
            ...this.data.parent,
            email: this.data.parent.email,
            students,
          };
          this.dialogRef.close(payload);
        },
        error: (err) => {
          this.saving = false;
          const msg = err?.error?.message || err?.message || 'Failed to update linked students';
          this.snackBar.open(msg, 'Close', { duration: 5000 });
        },
      });
  }
}
