import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import {
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { InvoiceModel } from 'src/app/finance/models/invoice.model';
import { selectAllInvoices } from 'src/app/finance/store/finance.selector';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService, Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-search-invoice',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,
    MatIconModule,
  ],
  templateUrl: './search-invoice.component.html',
  styleUrls: ['./search-invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInvoiceComponent implements OnInit, OnDestroy {
  @Output() invoiceSelected = new EventEmitter<InvoiceModel>();

  searchControl = new FormControl('');
  searchResults$: Observable<InvoiceModel[]> = of([]);
  invoices$: Observable<InvoiceModel[]> = this.store.pipe(
    select(selectAllInvoices)
  );
  initialInvoices: InvoiceModel[] = [];
  currentTheme: Theme = 'light';
  
  private ngUnsubscribe = new Subject<void>();

  constructor(
    private store: Store,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    this.invoices$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((invoices) => {
      this.initialInvoices = invoices;
      // Perform initial filtering if needed with an empty search term
      this.searchResults$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        map((searchTerm) =>
          this.filterInvoices(this.initialInvoices, searchTerm)
        )
      );
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  filterInvoices(
    invoices: InvoiceModel[],
    searchTerm: string | null
  ): InvoiceModel[] {
    if (!searchTerm?.trim()) {
      return invoices || [];
    }

    return (invoices || []).filter(
      (invoice) =>
        invoice.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.student.surname
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        invoice.student.studentNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.student.email ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.student.cell ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (invoice.invoiceNumber ?? '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }

  selectInvoice(invoice: InvoiceModel) {
    this.invoiceSelected.emit(invoice);
    this.searchControl.setValue('');
    // this.searchResults$ = of([]);
  }

  displayFn(invoice: InvoiceModel): string {
    return invoice && invoice.student.name
      ? `${invoice.student.studentNumber} ${invoice.student.name} ${invoice.student.surname} (${invoice.invoiceNumber})`
      : '';
  }
}
