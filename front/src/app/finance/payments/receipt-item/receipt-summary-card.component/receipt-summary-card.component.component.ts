import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ReceiptModel } from 'src/app/finance/models/payment.model';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-receipt-summary-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './receipt-summary-card.component.component.html',
  styleUrls: ['./receipt-summary-card.component.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptSummaryCardComponent implements OnInit, OnDestroy {
  @Input() receipt!: ReceiptModel;
  @Output() viewDetails = new EventEmitter<ReceiptModel>();
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
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
}
