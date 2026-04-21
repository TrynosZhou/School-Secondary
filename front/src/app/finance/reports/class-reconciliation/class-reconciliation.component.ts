import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { ClassesService } from 'src/app/enrolment/services/classes.service';
import { TermsService } from 'src/app/enrolment/services/terms.service';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import {
  ClassReconciliationReport,
  ClassReconciliationResultItem,
} from '../../models/class-reconciliation-report.model';
import { invoiceActions, receiptActions } from '../../store/finance.actions';

@Component({
  selector: 'app-class-reconciliation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
  ],
  templateUrl: './class-reconciliation.component.html',
  styleUrls: ['./class-reconciliation.component.scss'],
})
export class ClassReconciliationComponent implements OnInit, OnDestroy {
  classes: ClassesModel[] = [];
  terms: TermsModel[] = [];
  selectedClass: ClassesModel | null = null;
  selectedTerm: TermsModel | null = null;
  isReconciling = false;
  report: ClassReconciliationReport | null = null;
  resultsDataSource = new MatTableDataSource<ClassReconciliationResultItem>([]);
  displayedColumns: string[] = ['studentNumber', 'studentName', 'status', 'details'];
  private destroy$ = new Subject<void>();
  private baseURL = `${environment.apiUrl}/payment/`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private classesService: ClassesService,
    private termsService: TermsService,
    private store: Store,
  ) {}

  ngOnInit(): void {
    this.classesService
      .getAllClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => (this.classes = list || []),
        error: () => this.snackBar.open('Failed to load classes', 'Close', { duration: 3000 }),
      });
    this.termsService
      .getAllTerms()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (list) => (this.terms = list || []),
        error: () => this.snackBar.open('Failed to load terms', 'Close', { duration: 3000 }),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runReconciliation(): void {
    if (!this.selectedClass?.name || this.selectedTerm == null) {
      this.snackBar.open('Please select a class and a term', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    const name = encodeURIComponent(this.selectedClass.name);
    const num = this.selectedTerm.num;
    const year = this.selectedTerm.year;
    this.isReconciling = true;
    this.report = null;

    this.http
      .post<ClassReconciliationReport>(`${this.baseURL}reconcile/class/${name}/${num}/${year}`, {})
      .subscribe({
        next: (response) => {
          this.isReconciling = false;
          this.report = response;
          this.resultsDataSource.data = response.results || [];
          this.store.dispatch(invoiceActions.fetchAllInvoices());
          this.store.dispatch(receiptActions.fetchAllReceipts());
          this.snackBar.open(
            `Reconciliation complete: ${response.succeeded} succeeded, ${response.failed} failed`,
            'Close',
            {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar'],
            },
          );
        },
        error: (error) => {
          this.isReconciling = false;
          this.report = null;
          this.resultsDataSource.data = [];
          const msg = error.error?.message || error.message || 'Class reconciliation failed';
          this.snackBar.open(`Error: ${msg}`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  clearReport(): void {
    this.report = null;
    this.resultsDataSource.data = [];
  }

  downloadReport(): void {
    if (!this.report) return;
    const blob = new Blob([JSON.stringify(this.report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-reconciliation-${this.report.className}-T${this.report.termNum}-${this.report.year}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  termLabel(term: TermsModel): string {
    return `Term ${term.num} ${term.year}`;
  }
}
