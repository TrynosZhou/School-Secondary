import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';
import {
  debounceTime,
  map,
  Observable,
  of,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectAllReceipts } from '../../store/finance.selector';
import { ReceiptModel } from '../../models/payment.model';
import { ThemeService, Theme } from 'src/app/services/theme.service';

@Component({
  selector: 'app-search-receipt',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatOptionModule,
  ],
  templateUrl: './search-receipt.component.html',
  styleUrls: ['./search-receipt.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchReceiptComponent implements OnInit, OnDestroy {
  @Output() receiptSelected = new EventEmitter<ReceiptModel>();

  searchControl = new FormControl('');
  searchResults$: Observable<ReceiptModel[]> = of([]); // Observable to hold filtered results

  // Observable of all receipts from NgRx store
  receipts$: Observable<ReceiptModel[]> = this.store.pipe(
    select(selectAllReceipts) // Select all receipts from your NgRx store
  );

  private initialReceipts: ReceiptModel[] = []; // Store the initial array for filtering
  private ngUnsubscribe = new Subject<void>(); // Used for unsubscribing observables
  currentTheme: Theme = 'light';

  constructor(
    private store: Store,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Subscribe to all receipts from the store once
    this.receipts$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((receipts) => {
      this.initialReceipts = receipts; // Store the full list
      // 2. Set up the search control's valueChanges listener
      this.searchResults$ = this.searchControl.valueChanges.pipe(
        startWith(''), // Emit an empty string initially to show all receipts (or default)
        debounceTime(300), // Wait for 300ms after user stops typing
        map(
          (searchTerm) => this.filterReceipts(this.initialReceipts, searchTerm) // Filter the stored list
        )
      );
      this.cdr.markForCheck();
    });

    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });

    // Optionally dispatch an action to load receipts if they are not already in the store
    // this.store.dispatch(loadReceipts()); // Uncomment if you need to trigger loading
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /**
   * Filters the list of receipts based on the search term.
   * @param receipts The full array of receipts to filter.
   * @param searchTerm The string to search for (case-insensitive).
   * @returns An array of filtered receipts.
   */
  filterReceipts(
    receipts: ReceiptModel[],
    searchTerm: string | null
  ): ReceiptModel[] {
    if (!searchTerm?.trim()) {
      return receipts || []; // If no search term, return all receipts
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return (receipts || []).filter(
      (receipt) =>
        receipt.student.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        receipt.student.surname.toLowerCase().includes(lowerCaseSearchTerm) ||
        receipt.student.studentNumber
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        (receipt.description ?? '')
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        (receipt.receiptNumber ?? '')
          .toLowerCase()
          .includes(lowerCaseSearchTerm) ||
        (receipt.paymentMethod ?? '')
          .toLowerCase()
          .includes(lowerCaseSearchTerm) // Search by payment method too
      // Add more fields to search here if needed, e.g., receipt.paymentDate (might need formatting)
    );
  }

  /**
   * Emits the selected receipt and clears the search input.
   * @param receipt The ReceiptModel selected from the autocomplete.
   */
  selectReceipt(receipt: ReceiptModel): void {
    this.receiptSelected.emit(receipt);
    this.searchControl.setValue(''); // Clear input after selection
    // You might also want to clear searchResults$ if you don't want the dropdown to re-appear on focus
    // this.searchResults$ = of([]);
  }

  /**
   * Provides the display value for the autocomplete input field.
   * @param receipt The ReceiptModel object.
   * @returns A formatted string for display.
   */
  displayFn(receipt: ReceiptModel): string {
    return receipt && receipt.student
      ? `${receipt.student.studentNumber} ${receipt.student.name} ${receipt.student.surname} (Receipt #${receipt.receiptNumber})`
      : '';
  }
}
