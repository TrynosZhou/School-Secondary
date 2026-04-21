import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ThemeService, Theme } from '../../services/theme.service';
import { SharedService } from '../../shared.service';
import { FeesNames } from '../../finance/enums/fees-names.enum';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  currentTheme: Theme = 'light';
  private destroy$ = new Subject<void>();
  totalAmount = 0;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title?: string;
      message?: string;
      confirmText?: string;
      cancelText?: string;
      bills?: Array<{ fees?: { name?: string; amount?: number | string } }>;
      extraInfo?: any;
    },
    private themeService: ThemeService,
    public sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe((theme) => {
      this.currentTheme = theme;
    });

    const bills = (this.data && Array.isArray(this.data.bills)) ? this.data.bills : [];
    this.totalAmount = bills.reduce(
      (sum: number, it: any) => sum + (Number(it?.fees?.amount) || 0),
      0
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  getFeeDisplayName(feeName: string | undefined): string {
    if (!feeName) {
      return 'Unknown Fee';
    }
    // Try to match the fee name to the FeesNames enum
    const feeNameKey = feeName as keyof typeof FeesNames;
    if (FeesNames[feeNameKey]) {
      return this.sharedService.feesNamesToString(FeesNames[feeNameKey]);
    }
    // Fallback: if it's already a string value from enum, try to convert it
    const enumValue = Object.values(FeesNames).find(value => value === feeName);
    if (enumValue) {
      return this.sharedService.feesNamesToString(enumValue);
    }
    // If no match found, return the original name with better formatting
    return feeName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


