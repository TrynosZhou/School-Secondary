import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ExemptionModel } from '../../../models/exemption.model';
import { ExemptionType } from '../../../enums/exemption-type.enum';
import { ThemeService, Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-exemption-item',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  templateUrl: './exemption-item.component.html',
  styleUrls: ['./exemption-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExemptionItemComponent implements OnInit, OnDestroy {
  @Input() exemption!: ExemptionModel;
  @Input() isSelected = false;
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  
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

  getTypeLabel(type: ExemptionType): string {
    return type.replace('_', ' ').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }

  getTypeColor(type: ExemptionType): string {
    switch (type) {
      case ExemptionType.FIXED_AMOUNT:
        return 'primary';
      case ExemptionType.PERCENTAGE:
        return 'accent';
      case ExemptionType.STAFF_SIBLING:
        return 'warn';
      default:
        return '';
    }
  }

  getTypeIcon(type: ExemptionType): string {
    switch (type) {
      case ExemptionType.FIXED_AMOUNT:
        return 'attach_money';
      case ExemptionType.PERCENTAGE:
        return 'percent';
      case ExemptionType.STAFF_SIBLING:
        return 'people';
      default:
        return 'money_off';
    }
  }

  formatAmount(): string {
    // Handle fixedAmount - convert to number if it's a string
    const fixedAmount = this.exemption.fixedAmount;
    if (fixedAmount != null) {
      const fixedAmountNum = typeof fixedAmount === 'number' ? fixedAmount : parseFloat(String(fixedAmount));
      if (!isNaN(fixedAmountNum) && fixedAmountNum > 0) {
        return `$${fixedAmountNum.toFixed(2)}`;
      }
    }
    
    // Handle percentageAmount - convert to number if it's a string
    const percentageAmount = this.exemption.percentageAmount;
    if (percentageAmount != null) {
      const percentageAmountNum = typeof percentageAmount === 'number' ? percentageAmount : parseFloat(String(percentageAmount));
      if (!isNaN(percentageAmountNum) && percentageAmountNum > 0) {
        return `${percentageAmountNum}%`;
      }
    }
    
    return 'N/A';
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit();
  }
}

