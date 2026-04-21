import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ROLES } from '../registration/models/roles.enum';
import { AuthService } from '../auth/auth.service';
import {
  DepartmentTeacherLite,
  LibraryApiService,
  LibraryCopy,
  LibraryLoan,
  LibraryTitle,
} from './library-api.service';
import { InventoryApiService, Room } from '../inventory/inventory-api.service';

@Component({
  selector: 'app-library',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
})
export class LibraryComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  loading = false;
  role: ROLES | null = null;
  canManage = false;

  rooms: Room[] = [];
  departmentTeachers: DepartmentTeacherLite[] = [];

  titles: LibraryTitle[] = [];
  copies: LibraryCopy[] = [];
  loans: LibraryLoan[] = [];

  titleQuery = '';
  copyQuery = '';
  loanQuery = '';
  loanStatus: 'all' | 'open' | 'returned' = 'open';

  titleForm = {
    title: '',
    author: '',
    edition: '',
    isbn: '',
    publisher: '',
    subject: '',
    notes: '',
  };

  receiveForm = {
    titleId: '',
    roomId: '',
    copiesCount: 1,
    assignedTeacherId: '',
  };

  issueForm = {
    copyId: '',
    studentNumber: '',
    dueAt: '',
    notes: '',
  };

  returnForm = {
    loanId: '',
    notes: '',
  };

  assignForm = {
    copyId: '',
    assignedTeacherId: '',
  };

  titleColumns = ['title', 'author', 'subject', 'isbn'] as const;
  copyColumns = ['bookNumber', 'title', 'status', 'room', 'assignedTeacher'] as const;
  loanColumns = ['bookNumber', 'studentNumber', 'borrowedAt', 'dueAt', 'returnedAt'] as const;

  constructor(
    private readonly libraryApi: LibraryApiService,
    private readonly inventoryApi: InventoryApiService,
    private readonly auth: AuthService,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const auth = this.auth.getAuthStatus();
    this.role = auth.user?.role ?? null;
    this.canManage =
      this.role === ROLES.hod ||
      this.role === ROLES.teacher ||
      this.role === ROLES.seniorTeacher ||
      this.role === ROLES.deputy ||
      this.role === ROLES.head ||
      this.role === ROLES.admin ||
      this.role === ROLES.dev;

    this.inventoryApi
      .getRooms({ page: 1, limit: 200, isActive: 'true' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (res) => (this.rooms = res.items ?? []), error: () => (this.rooms = []) });

    this.libraryApi
      .getDepartmentTeachers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (teachers) => (this.departmentTeachers = teachers ?? []),
        error: () => (this.departmentTeachers = []),
      });

    this.reloadAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  reloadAll(): void {
    this.loadTitles();
    this.loadCopies();
    this.loadLoans();
  }

  loadTitles(): void {
    this.libraryApi
      .getTitles(this.titleQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (data) => (this.titles = data ?? []), error: () => (this.titles = []) });
  }

  loadCopies(): void {
    this.libraryApi
      .getCopies({ q: this.copyQuery })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (data) => (this.copies = data ?? []), error: () => (this.copies = []) });
  }

  loadLoans(): void {
    this.libraryApi
      .getLoans({
        q: this.loanQuery,
        status: this.loanStatus === 'all' ? undefined : this.loanStatus,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: (data) => (this.loans = data ?? []), error: () => (this.loans = []) });
  }

  createTitle(): void {
    const title = (this.titleForm.title || '').trim();
    if (!title) {
      this.toast('Title is required');
      return;
    }
    this.loading = true;
    this.libraryApi
      .createTitle({
        title,
        author: this.titleForm.author || null,
        edition: this.titleForm.edition || null,
        isbn: this.titleForm.isbn || null,
        publisher: this.titleForm.publisher || null,
        subject: this.titleForm.subject || null,
        notes: this.titleForm.notes || null,
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast('Title created');
          this.titleForm = {
            title: '',
            author: '',
            edition: '',
            isbn: '',
            publisher: '',
            subject: '',
            notes: '',
          };
          this.loadTitles();
        },
        error: () => this.toast('Failed to create title'),
      });
  }

  receiveCopies(): void {
    if (!this.receiveForm.titleId || this.receiveForm.copiesCount < 1) {
      this.toast('Select title and quantity');
      return;
    }
    this.loading = true;
    this.libraryApi
      .receiveCopies({
        titleId: this.receiveForm.titleId,
        roomId: this.receiveForm.roomId || null,
        copiesCount: Number(this.receiveForm.copiesCount || 0),
        assignedTeacherId: this.receiveForm.assignedTeacherId || null,
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: (resp) => {
          this.toast(`Received ${resp.created} copies`);
          this.receiveForm.copiesCount = 1;
          this.loadCopies();
        },
        error: () => this.toast('Failed to receive copies'),
      });
  }

  assignCopy(): void {
    if (!this.assignForm.copyId) {
      this.toast('Select a copy to assign');
      return;
    }
    this.loading = true;
    this.libraryApi
      .assignCopy({
        copyId: this.assignForm.copyId,
        assignedTeacherId: this.assignForm.assignedTeacherId || null,
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast('Copy assignment updated');
          this.loadCopies();
        },
        error: () => this.toast('Failed to assign copy'),
      });
  }

  issueLoan(): void {
    if (!this.issueForm.copyId || !this.issueForm.studentNumber || !this.issueForm.dueAt) {
      this.toast('Copy, student number, and due date are required');
      return;
    }
    this.loading = true;
    this.libraryApi
      .issueLoan({
        copyId: this.issueForm.copyId,
        studentNumber: this.issueForm.studentNumber.trim(),
        dueAt: new Date(this.issueForm.dueAt).toISOString(),
        notes: this.issueForm.notes || null,
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast('Loan issued');
          this.issueForm = { copyId: '', studentNumber: '', dueAt: '', notes: '' };
          this.loadCopies();
          this.loadLoans();
        },
        error: () => this.toast('Failed to issue loan'),
      });
  }

  returnLoan(): void {
    if (!this.returnForm.loanId) {
      this.toast('Select a loan to return');
      return;
    }
    this.loading = true;
    this.libraryApi
      .returnLoan({
        loanId: this.returnForm.loanId,
        notes: this.returnForm.notes || null,
      })
      .pipe(finalize(() => (this.loading = false)), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toast('Book returned');
          this.returnForm = { loanId: '', notes: '' };
          this.loadCopies();
          this.loadLoans();
        },
        error: () => this.toast('Failed to return loan'),
      });
  }

  teacherLabel(id?: string | null): string {
    if (!id) return '—';
    const t = this.departmentTeachers.find((x) => x.id === id);
    return t ? `${t.name} ${t.surname}`.trim() : id;
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3500, verticalPosition: 'top' });
  }
}

