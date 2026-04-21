import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { filter, Observable, Subscription, take, tap, takeUntil, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { InvoiceModel } from '../../models/invoice.model';
import { invoiceActions } from '../../store/finance.actions';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { selectIsParent } from 'src/app/auth/store/auth.selectors';
import { selectStudentInvoices, selectLoadingStudentInvoices, selectLoadStudentInvoicesErr, selectEffectiveStudentForFinance } from '../../store/finance.selector';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { EmptyStateComponent } from 'src/app/shared/empty-state/empty-state.component';

@Component({
  selector: 'app-student-invoices',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    EmptyStateComponent,
  ],
  templateUrl: './student-invoices.component.html',
  styleUrls: ['./student-invoices.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentInvoicesComponent implements OnInit, OnDestroy {
  // Data Observables
  user$ = this.store.select(selectUser);
  invoices$ = this.store.select(selectStudentInvoices);
  loading$ = this.store.select(selectLoadingStudentInvoices);
  error$ = this.store.select(selectLoadStudentInvoicesErr);
  currentTheme: Theme = 'light';
  private userSubscription: Subscription | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<any>,
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
    
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.userSubscription = combineLatest([
      this.store.select(selectUser),
      this.store.select(selectIsParent),
      this.store.select(selectEffectiveStudentForFinance),
    ]).pipe(
      filter(([user, isParent, effectiveStudent]) => {
        if (!user?.id) return false;
        if (isParent) return !!effectiveStudent;
        return true;
      }),
      take(1),
      map(([user, isParent, effectiveStudent]) => (user!.id && !isParent) ? user!.id : effectiveStudent!),
      tap((studentNumber) => {
        this.store.dispatch(
          invoiceActions.fetchStudentInvoices({ studentNumber })
        );
      })
    ).subscribe({
      error: (error) => console.error('Error loading invoices:', error)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // TrackBy functions for performance
  trackByInvoiceId(index: number, invoice: InvoiceModel): string {
    return invoice.invoiceNumber;
  }

  trackByBillId(index: number, bill: any): string {
    return bill.fees.id;
  }

  trackByAllocationId(index: number, allocation: any): string {
    return allocation.receiptId;
  }

  // Helper methods for invoice status
  isInvoiceOverdue(invoice: InvoiceModel): boolean {
    const today = new Date();
    const dueDate = new Date(invoice.invoiceDueDate);
    return dueDate < today && invoice.balance > 0;
  }

  isInvoicePaid(invoice: InvoiceModel): boolean {
    return invoice.balance <= 0;
  }

  // Helper to get invoice status class for styling
  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'status-paid';
      case 'Partially Paid':
        return 'status-partially-paid';
      case 'Overdue':
        return 'status-overdue';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  /**
   * Dispatches an action to download a specific invoice PDF.
   * @param invoiceNumber The unique identifier for the invoice to download.
   */
  downloadInvoice(invoiceNumber: string): void {
    if (invoiceNumber) {
      this.store.dispatch(
        invoiceActions.downloadInvoice({ invoiceNumber: invoiceNumber })
      );
    } else {
      console.warn('Cannot download invoice: Invoice number is missing.');
      // Optionally, show a user-friendly message
    }
  }

}
