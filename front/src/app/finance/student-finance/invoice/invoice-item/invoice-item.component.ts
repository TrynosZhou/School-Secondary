import { Component, Input, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { invoiceActions } from 'src/app/finance/store/finance.actions';
import { SharedService } from 'src/app/shared.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';
import { selectAuthUserRole } from 'src/app/auth/store/auth.selectors';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialo/confirmation-dialo.component';
import { MatDialogRef } from '@angular/material/dialog';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';
@Component({
  selector: 'app-invoice-item',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: './invoice-item.component.html',
  styleUrls: ['./invoice-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceItemComponent implements OnInit, OnChanges, OnDestroy {
  currentTheme: Theme = 'light';
  isDownloading = false;
  private destroy$ = new Subject<void>();
  userRole$: Observable<string | null>;
  canVoidInvoice$!: Observable<boolean>; // Observable for void invoice permission

  @Input() invoice!: InvoiceModel | null;
  @Input() downloadable!: boolean;

  constructor(
    public sharedService: SharedService,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private themeService: ThemeService,
    private dialog: MatDialog,
    private roleAccess: RoleAccessService
  ) {
    this.userRole$ = this.store.select(selectAuthUserRole).pipe(
      map(role => role ?? null)
    );
    
    // Set up canVoidInvoice$ observable using permission check
    this.canVoidInvoice$ = this.roleAccess.canVoidInvoice$();
  }

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
      this.cdr.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['invoice'] || changes['downloadable']) {
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  save(): void {
    if (!this.invoice) {
      return;
    }
    this.store.dispatch(invoiceActions.saveInvoice({ invoice: this.invoice }));
  }

  download(): void {
    if (!this.invoice?.invoiceNumber) {
      console.warn('Cannot download invoice: Invoice number is missing.');
      return;
    }
    this.isDownloading = true;
    this.store.dispatch(
      invoiceActions.downloadInvoice({
        invoiceNumber: this.invoice.invoiceNumber,
      })
    );
    // Reset loading state after a delay (actual download handled by effect)
    setTimeout(() => {
      this.isDownloading = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  getStatusClass(status: string): string {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'paid':
        return 'status-paid';
      case 'pending':
      case 'partially paid':
        return 'status-pending';
      case 'overdue':
        return 'status-overdue';
      default:
        return 'status-default';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '../../../assets/placeholder-logo.png';
    }
  }

  voidInvoice(): void {
    // Check if the invoice is already voided
    if (this.invoice?.isVoided) {
      console.warn('Invoice is already voided. Cannot void again.');
      return;
    }

    // Open confirmation dialog
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
      width: '300px',
      data: {
        title: 'Confirm Void',
        message:
          'Are you sure you want to void this invoice? This action cannot be undone.',
        confirmText: 'Void',
        cancelText: 'Cancel',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result && this.invoice?.id) {
          // User confirmed, dispatch the void action
          this.store.dispatch(
            invoiceActions.voidInvoice({ invoiceId: this.invoice.id })
          );
        }
      });
  }
}
