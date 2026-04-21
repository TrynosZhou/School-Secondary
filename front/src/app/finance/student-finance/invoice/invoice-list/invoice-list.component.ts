import { Component, EventEmitter, Output, Input, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { selectTermInvoices } from 'src/app/finance/store/finance.selector';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService, Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  @Output() invoiceSelected = new EventEmitter<InvoiceModel>();
  @Input() selectedInvoice: InvoiceModel | null = null;
  
  invoices$ = this.store.select(selectTermInvoices);
  currentTheme: Theme = 'light';
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
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

  selectInvoice(invoice: InvoiceModel) {
    this.invoiceSelected.emit(invoice);
  }

  isSelected(invoice: InvoiceModel): boolean {
    return this.selectedInvoice?.invoiceNumber === invoice.invoiceNumber;
  }
}
