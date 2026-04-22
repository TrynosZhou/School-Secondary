import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { PaymentMethods } from '../../enums/payment-methods.enum';
import { Store } from '@ngrx/store';
import {
  selectAmountDue,
} from '../../store/finance.selector';
import { receiptActions } from '../../store/finance.actions';
import { map, combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { State } from '../../store/finance.reducer';
import { ReceiptModel } from '../../models/payment.model';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Actions, ofType } from '@ngrx/effects';

@Component({
  selector: 'app-add-receipt-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    SharedModule,
  ],
  templateUrl: './add-receipt-dialog.component.html',
  styleUrls: ['./add-receipt-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddReceiptDialogComponent implements OnInit, OnDestroy {
  addReceiptForm: FormGroup;
  student!: StudentsModel;
  paymentMethods = [...Object.values(PaymentMethods)];

  // Observables for state from NgRx Store
  amountDue$: Observable<number> = new Observable<number>();
  isSaving = false;
  isLoadingBalance$: Observable<boolean> = new Observable<boolean>();
  
  // Computed observables for suggestions
  outstandingAfterPayment$: Observable<number> = new Observable<number>();
  isOverpayment$: Observable<boolean> = new Observable<boolean>();
  suggestionMessage$: Observable<string | null> = new Observable<string | null>();
  
  currentTheme: Theme = 'light';
  private destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<AddReceiptDialogComponent>,
    private fb: FormBuilder,
    private store: Store<State>,
    private actions$: Actions,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
  ) {
    this.addReceiptForm = this.fb.group({
      amountPaid: ['', [Validators.required, Validators.min(0.01)]],
      paymentMethod: ['', Validators.required],
      description: [''],
    });

    // Watch for form changes to calculate suggestions
    this.setupSuggestionObservables();
  }

  private setupSuggestionObservables(): void {
    const amountPaidControl = this.addReceiptForm.get('amountPaid');
    
    if (amountPaidControl) {
      this.outstandingAfterPayment$ = combineLatest([
        this.amountDue$,
        amountPaidControl.valueChanges.pipe(map(val => +val || 0))
      ]).pipe(
        map(([amountDue, amountPaid]) => Math.max(0, amountDue - amountPaid))
      );

      this.isOverpayment$ = combineLatest([
        this.amountDue$,
        amountPaidControl.valueChanges.pipe(map(val => +val || 0))
      ]).pipe(
        map(([amountDue, amountPaid]) => amountPaid > amountDue && amountDue > 0)
      );

      this.suggestionMessage$ = combineLatest([
        this.amountDue$,
        amountPaidControl.valueChanges.pipe(map(val => +val || 0)),
        this.outstandingAfterPayment$
      ]).pipe(
        map(([amountDue, amountPaid, outstanding]) => {
          if (!amountPaid || amountPaid <= 0) return null;
          
          if (amountPaid > amountDue && amountDue > 0) {
            const overpayment = amountPaid - amountDue;
            return `⚠️ Overpayment detected: $${overpayment.toFixed(2)} will be credited to the student's account.`;
          }
          
          if (amountPaid === amountDue && amountDue > 0) {
            return '✅ This payment will clear the full balance.';
          }
          
          if (outstanding > 0 && outstanding < amountDue) {
            return `ℹ️ After this payment, $${outstanding.toFixed(2)} will remain outstanding.`;
          }
          
          return null;
        })
      );
    }
  }

  ngOnInit(): void {
    // Clear any stale state so the dialog doesn't react to a previous save
    this.store.dispatch(receiptActions.clearCreatedReceipt());

    // Close dialog only after the backend confirms save success
    this.actions$
      .pipe(ofType(receiptActions.saveReceiptSuccess), takeUntil(this.destroy$))
      .subscribe(({ receipt }) => {
        this.isSaving = false;
        this.cdr.markForCheck();
        this.dialogRef.close(receipt);
      });

    this.actions$
      .pipe(ofType(receiptActions.saveReceiptFail), takeUntil(this.destroy$))
      .subscribe(() => {
        this.isSaving = false;
        this.cdr.markForCheck();
      });

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.store.dispatch(receiptActions.clearCreatedReceipt());
    this.destroy$.next();
    this.destroy$.complete();
  }

  get amountPaidControl() {
    return this.addReceiptForm.get('amountPaid');
  }

  get paymentMethodControl() {
    return this.addReceiptForm.get('paymentMethod');
  }

  get description() {
    return this.addReceiptForm.get('description');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.addReceiptForm.valid && this.student?.studentNumber) {
      const { amountPaid, paymentMethod, description } =
        this.addReceiptForm.value;

      this.store.dispatch(
        receiptActions.saveReceipt({
          studentNumber: this.student.studentNumber,
          amountPaid: +amountPaid,
          paymentMethod: paymentMethod,
          description: description,
        })
      );
      this.isSaving = true;
      this.cdr.markForCheck();
    } else {
      this.addReceiptForm.markAllAsTouched();
    }
  }

  getSelectedStudent(student: StudentsModel) {
    this.student = student;
    if (this.student.studentNumber) {
      this.store.dispatch(
        receiptActions.fetchStudentOutstandingBalance({
          studentNumber: this.student.studentNumber,
        })
      );
      this.amountDue$ = this.store.select(selectAmountDue);
      
      // Re-setup suggestions when student changes
      this.setupSuggestionObservables();
      this.cdr.markForCheck();
    }
  }

  // Helper method to get suggested amount (full balance or partial)
  getSuggestedAmount(): number {
    let suggested = 0;
    this.amountDue$.pipe(takeUntil(this.destroy$)).subscribe(amount => {
      suggested = amount;
    });
    return suggested;
  }

  fillFullBalance(): void {
    this.amountDue$
      .pipe(takeUntil(this.destroy$))
      .subscribe(amount => {
        if (amount > 0) {
          this.addReceiptForm.patchValue({ amountPaid: amount.toFixed(2) });
          this.cdr.markForCheck();
        }
      });
  }
}
