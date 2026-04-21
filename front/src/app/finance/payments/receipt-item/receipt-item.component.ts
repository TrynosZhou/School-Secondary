import {
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
  OnInit,
  OnChanges,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptModel } from '../../models/payment.model';
import { Store } from '@ngrx/store';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { receiptActions } from '../../store/finance.actions';
import { ReceiptInvoiceAllocationsModel } from '../../models/receipt-invoice-allocations.model';
import { Observable, take, Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { ROLES } from 'src/app/registration/models/roles.enum';
import { selectAuthUserRole } from 'src/app/auth/store/auth.selectors';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialo/confirmation-dialo.component';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { RoleAccessService } from 'src/app/services/role-access.service';

@Component({
  selector: 'app-receipt-item',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './receipt-item.component.html',
  styleUrls: ['./receipt-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptItemComponent implements OnInit, OnChanges, OnDestroy {
  @Input() receipt!: ReceiptModel;
  @Input() downloadable = false;

  balance = '0.00';
  userRole$!: Observable<ROLES | undefined>; // To get the current user's role
  canVoidReceipt$!: Observable<boolean>; // Observable for void receipt permission
  currentTheme: Theme = 'light';
  private destroy$ = new Subject<void>();

  @ViewChild('receiptContainerRef') receiptContainerRef!: ElementRef;

  constructor(
    private store: Store,
    private dialog: MatDialog,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private roleAccess: RoleAccessService
  ) {}

  ngOnInit(): void {
    // Get the user's role from the store on init
    this.userRole$ = this.store.select(selectAuthUserRole);
    
    // Set up canVoidReceipt$ observable using permission check
    this.canVoidReceipt$ = this.roleAccess.canVoidReceipt$();

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  printReceipt(): void {
    window.print();
  }

  download(): void {
    if (this.receipt && this.receipt.receiptNumber) {
      // Use receiptNumber as per backend
      this.store.dispatch(
        receiptActions.downloadReceiptPdf({
          receiptNumber: this.receipt.receiptNumber,
        })
      );
    } else {
      console.warn(
        'Cannot download receipt: Receipt object or receiptNumber is missing.'
      );
    }
  }

  // --- NEW: VOID RECEIPT METHOD ---
  voidReceipt(): void {
    // Check if the receipt is already voided
    if (this.receipt.isVoided) {
      console.warn('Receipt is already voided. Cannot void again.');
      // Optionally, show a snackbar or message to the user
      return;
    }

    // Open confirmation dialog
    const dialogRef: MatDialogRef<ConfirmationDialogComponent> =
      this.dialog.open(ConfirmationDialogComponent, {
        width: '300px',
        data: {
          title: 'Confirm Void',
          message:
            'Are you sure you want to void this receipt? This action cannot be undone.',
          confirmText: 'Void',
          cancelText: 'Cancel',
        },
      });

    dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result) => {
        if (result) {
          // User confirmed, dispatch the void action
          if (this.receipt && this.receipt.id) {
            this.store.dispatch(
              receiptActions.voidReceipt({ receiptId: this.receipt.id })
            );
          } else {
            console.error('Cannot void receipt: Receipt ID is missing.');
            // Optionally, show a user-friendly error message
          }
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receipt']) {
      const currentReceipt = changes['receipt'].currentValue as ReceiptModel;

      if (
        currentReceipt &&
        currentReceipt.allocations &&
        currentReceipt.allocations.length > 0
      ) {
        const sum = currentReceipt.allocations.reduce(
          (total: number, allocation: ReceiptInvoiceAllocationsModel) => {
            const balance = allocation?.invoice?.balance;
            return total + (balance ? +balance : 0);
          },
          0
        );
        this.balance = sum.toFixed(2);
        this.cdr.markForCheck();
      } else {
        this.balance = '0.00';
        this.cdr.markForCheck();
      }
    }
  }
}
