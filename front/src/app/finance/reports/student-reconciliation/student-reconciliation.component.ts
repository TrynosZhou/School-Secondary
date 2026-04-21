import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { StudentSearchComponent } from 'src/app/shared/search-by-student-number/search-by-student-number.component';
import { ReconciliationResultModel } from 'src/app/finance/models/reconciliation-result.model';
import { invoiceActions, receiptActions } from '../../store/finance.actions';

@Component({
  selector: 'app-student-reconciliation',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatListModule,
    MatChipsModule,
    StudentSearchComponent,
  ],
  templateUrl: './student-reconciliation.component.html',
  styleUrls: ['./student-reconciliation.component.scss'],
})
export class StudentReconciliationComponent implements OnInit, OnDestroy {
  selectedStudent: StudentsModel | null = null;
  isReconciling = false;
  reconciliationResult: ReconciliationResultModel | null = null;
  private destroy$ = new Subject<void>();
  baseURL = `${environment.apiUrl}/payment/`;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private store: Store, // Add Store to refresh data after reconciliation
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onStudentSelected(student: StudentsModel): void {
    this.selectedStudent = student;
  }

  reconcileStudent(): void {
    if (!this.selectedStudent?.studentNumber) {
      this.snackBar.open('Please select a student first', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
      return;
    }

    this.isReconciling = true;
    const studentNumber = this.selectedStudent.studentNumber;

    this.http
      .post<ReconciliationResultModel>(
        `${this.baseURL}reconcile/${studentNumber}`,
        {},
      )
      .subscribe({
        next: (response) => {
          this.isReconciling = false;
          this.reconciliationResult = response;
          
          // Refresh invoices and receipts after successful reconciliation
          // This ensures the updated data (with correct allocations and balances) is loaded
          this.store.dispatch(invoiceActions.fetchAllInvoices());
          this.store.dispatch(receiptActions.fetchAllReceipts());
          
          this.snackBar.open(response.message || 'Reconciliation completed successfully', 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar'],
          });
        },
        error: (error) => {
          this.isReconciling = false;
          this.reconciliationResult = null;
          const errorMessage =
            error.error?.message || error.message || 'Failed to reconcile student finances';
          this.snackBar.open(`Error: ${errorMessage}`, 'Close', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar'],
          });
        },
      });
  }

  clearSelection(): void {
    this.selectedStudent = null;
    this.reconciliationResult = null;
  }

  get correctedInvoices() {
    return this.reconciliationResult?.details?.correctedInvoices || [];
  }
}

