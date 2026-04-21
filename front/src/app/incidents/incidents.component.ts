import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Subject, finalize, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ROLES } from '../registration/models/roles.enum';
import { ChargeableIncident, IncidentType, IncidentsApiService } from './incidents-api.service';
import { LibraryApiService, LibraryCopy } from '../library/library-api.service';

type IncidentForm = {
  type: IncidentType;
  studentNumber?: string;
  replacementCost: number;
  description: string;
  textbookCopyId?: string;
  roomId?: string;
  inventoryItemId?: string;
};

@Component({
  selector: 'app-incidents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './incidents.component.html',
  styleUrls: ['./incidents.component.scss'],
})
export class IncidentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  role: ROLES | null = null;
  loading = false;

  myIncidents: ChargeableIncident[] = [];
  pendingApproval: ChargeableIncident[] = [];

  form: IncidentForm = {
    type: 'lost_book',
    studentNumber: '',
    replacementCost: 0,
    description: '',
    textbookCopyId: '',
    roomId: '',
    inventoryItemId: '',
  };

  availableCopies: LibraryCopy[] = [];
  rejectReasonByIncidentId: Record<string, string> = {};

  displayedColumns: string[] = ['createdAt', 'type', 'student', 'cost', 'status', 'actions'];

  constructor(
    private readonly api: IncidentsApiService,
    private readonly snackBar: MatSnackBar,
    private readonly auth: AuthService,
    private readonly libraryApi: LibraryApiService,
  ) {}

  ngOnInit(): void {
    const auth = this.auth.getAuthStatus();
    this.role = auth.user?.role ?? null;

    this.loadMine();
    this.loadPending();
    this.loadAvailableCopies();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canSubmit(): boolean {
    return (
      this.role === ROLES.teacher ||
      this.role === ROLES.hod ||
      this.role === ROLES.seniorTeacher
    );
  }

  submit(): void {
    if (!this.canSubmit()) {
      this.snackBar.open('You are not allowed to report incidents', 'Close', { duration: 4000, verticalPosition: 'top' });
      return;
    }
    const desc = (this.form.description || '').trim();
    const cost = Number(this.form.replacementCost || 0);
    if (!desc || !Number.isFinite(cost) || cost < 0) {
      this.snackBar.open('Please provide a description and a valid cost', 'Close', { duration: 4000, verticalPosition: 'top' });
      return;
    }

    this.loading = true;
    this.api.createIncident({
      type: this.form.type,
      description: desc,
      replacementCost: cost,
      studentNumber: (this.form.studentNumber || '').trim() || null,
      textbookCopyId: this.form.textbookCopyId || null,
      roomId: this.form.roomId || null,
      inventoryItemId: this.form.inventoryItemId || null,
    })
    .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
    .subscribe({
      next: (created) => {
        this.snackBar.open('Incident reported', 'OK', { duration: 2500, verticalPosition: 'top' });
        this.myIncidents = [created, ...this.myIncidents];
        this.form.description = '';
        this.form.studentNumber = '';
        this.form.replacementCost = 0;
        this.form.textbookCopyId = '';
        this.form.roomId = '';
        this.form.inventoryItemId = '';
        this.loadPending();
      },
      error: () => this.snackBar.open('Failed to report incident', 'Close', { duration: 5000, verticalPosition: 'top' }),
    });
  }

  private loadMine(): void {
    this.api.getMyIncidents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.myIncidents = data ?? []),
        error: () => (this.myIncidents = []),
      });
  }

  private loadPending(): void {
    this.api.getPendingApproval()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => (this.pendingApproval = data ?? []),
        error: () => (this.pendingApproval = []),
      });
  }

  private loadAvailableCopies(): void {
    this.libraryApi
      .getCopies({ status: 'available' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (copies) => (this.availableCopies = copies ?? []),
        error: () => (this.availableCopies = []),
      });
  }

  act(row: ChargeableIncident, action: 'confirm' | 'deputy' | 'head' | 'accept' | 'reject'): void {
    if (action === 'reject') {
      const reason = (this.rejectReasonByIncidentId[row.id] || '').trim();
      if (!reason) {
        this.snackBar.open('Rejection reason is required', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
        });
        return;
      }
    }
    this.loading = true;
    const reason = (this.rejectReasonByIncidentId[row.id] || '').trim();
    const req =
      action === 'confirm'
        ? this.api.confirmHod(row.id)
        : action === 'deputy'
          ? this.api.signDeputy(row.id)
          : action === 'head'
            ? this.api.signHead(row.id)
          : action === 'reject'
            ? this.api.reject(row.id, reason)
            : this.api.accept(row.id);

    req.pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$)).subscribe({
      next: (updated) => {
        this.snackBar.open('Updated', 'OK', { duration: 2000, verticalPosition: 'top' });
        this.myIncidents = this.myIncidents.map((x) => (x.id === updated.id ? updated : x));
        this.pendingApproval = this.pendingApproval.filter((x) => x.id !== updated.id);
        this.loadMine();
        this.loadPending();
      },
      error: () => this.snackBar.open('Action failed', 'Close', { duration: 5000, verticalPosition: 'top' }),
    });
  }

  canAction(row: ChargeableIncident, action: 'confirm' | 'deputy' | 'head' | 'accept' | 'reject'): boolean {
    if (!this.role) return false;
    if (this.role === ROLES.dev || this.role === ROLES.admin) return true;
    if (action === 'confirm') return this.role === ROLES.hod && row.status === 'submitted';
    if (action === 'deputy') return this.role === ROLES.deputy && row.status === 'hod_confirmed';
    if (action === 'head') return this.role === ROLES.head && row.status === 'deputy_signed';
    if (action === 'accept') return (this.role === ROLES.auditor || this.role === ROLES.director) && row.status === 'head_signed';
    if (action === 'reject') return (this.role === ROLES.auditor || this.role === ROLES.director) && row.status === 'head_signed';
    return false;
  }
}

