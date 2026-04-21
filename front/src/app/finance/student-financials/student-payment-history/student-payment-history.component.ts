import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Observable, Subscription } from 'rxjs';
import { filter, take, tap, switchMap, takeUntil } from 'rxjs/operators';
import { PaymentHistoryItem } from '../../models/payment-history.model';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { User } from 'src/app/auth/models/user.model';
import { receiptActions, invoiceActions } from '../../store/finance.actions';
import {
  LedgerEntry,
  selectIsLoading,
  selectStudentLedgerFromStudentData,
} from '../../store/finance.selector';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { EmptyStateComponent } from 'src/app/shared/empty-state/empty-state.component';

@Component({
  selector: 'app-student-payment-history',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    EmptyStateComponent,
  ],
  templateUrl: './student-payment-history.component.html',
  styleUrls: ['./student-payment-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentPaymentHistoryComponent implements OnInit, OnDestroy {
  // Data Observables
  user$ = this.store.select(selectUser);
  paymentHistory$: Observable<LedgerEntry[]> = this.store.select(
    selectStudentLedgerFromStudentData,
  );
  loading$ = this.store.select(selectIsLoading);
  currentTheme: Theme = 'light';
  private userSubscription: Subscription | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
    
    this.loadPaymentHistory();
  }

  loadPaymentHistory(): void {
    this.userSubscription = this.store
      .select(selectUser)
      .pipe(
        filter((user): user is User => !!user && !!user.id),
        take(1),
        tap((user) => {
          // Ensure invoices and receipts are loaded for ledger calculation (single source of truth)
          this.store.dispatch(
            invoiceActions.fetchAllInvoices()
          );
          this.store.dispatch(
            receiptActions.fetchAllReceipts()
          );
        })
      )
      .subscribe({
        error: (error) => console.error('Failed to load payment history:', error)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Helper to get icon based on transaction type
  getTransactionIcon(type: PaymentHistoryItem['type']): string {
    switch (type) {
      case 'Payment':
        return 'receipt'; // Or 'payments'
      case 'Invoice':
        return 'description'; // Or 'assignment'
      case 'Allocation':
        return 'check_circle_outline'; // Or 'link'
      default:
        return 'info';
    }
  }

  // Helper to get color/class based on transaction direction
  getTransactionDirectionClass(
    direction: PaymentHistoryItem['direction']
  ): string {
    return direction === 'in' ? 'amount-in' : 'amount-out';
  }

  // TrackBy functions for performance
  trackByTransactionId(index: number, item: LedgerEntry): string {
    return item.id || `${item.type}-${item.date}-${index}`;
  }

  // Helper methods for transaction status
  isTransactionRecent(item: PaymentHistoryItem): boolean {
    const transactionDate = new Date(item.date);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return transactionDate > sevenDaysAgo;
  }

  getTransactionStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'status-completed';
      case 'pending':
        return 'status-pending';
      case 'failed':
      case 'rejected':
        return 'status-failed';
      default:
        return 'status-default';
    }
  }

  getTransactionTypeColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'payment':
        return '#4caf50';
      case 'invoice':
        return '#2196f3';
      case 'allocation':
        return '#ff9800';
      default:
        return '#666';
    }
  }
}
