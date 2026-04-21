import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { FinanceDataModel } from 'src/app/finance/models/finance-data.model';
import { selectAllCombinedFinanceData } from 'src/app/finance/store/finance.selector';

@Component({
  selector: 'app-search-finance-entity',
  templateUrl: './search-finance-entity.component.html',
  styleUrls: ['./search-finance-entity.component.css'],
})
export class SearchFinanceEntityComponent implements OnInit, OnDestroy {
  searchControl = new FormControl();
  options: FinanceDataModel[] = [];
  filteredOptions$!: Observable<FinanceDataModel[]>;

  @Output() entitySelected = new EventEmitter<FinanceDataModel>();
  private ngUnsubscribe = new Subject<void>();

  constructor(private store: Store) {}

  ngOnInit(): void {
    // Get all financial data from the store
    const allData$ = this.store.pipe(select(selectAllCombinedFinanceData));

    // Listen to changes in the search input
    this.filteredOptions$ = this.searchControl.valueChanges.pipe(
      takeUntil(this.ngUnsubscribe),
      debounceTime(300), // Wait 300ms after the last keystroke
      distinctUntilChanged(), // Only emit if the value has changed
      map((value: string | FinanceDataModel) => {
        const filterValue =
          typeof value === 'string' ? value.toLowerCase() : '';
        return filterValue
          ? this.filter(filterValue, allData$)
          : this.getTop5Recent(allData$);
      })
    );
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Method to filter data based on search input
  private filter(
    filterValue: string,
    allData$: Observable<FinanceDataModel[]>
  ): FinanceDataModel[] {
    const results: FinanceDataModel[] = [];
    allData$.subscribe((data) => {
      const safe = data ?? [];
      safe.forEach((item) => {
        // Check multiple fields for a match
        const searchString = `${item.id} ${item.description} ${item.studentName}`;
        if (searchString.toLowerCase().includes(filterValue)) {
          results.push(item);
        }
      });
    });
    return results.slice(0, 5); // Limit results for performance
  }

  // Method to get the most recent 5 items as default suggestions
  private getTop5Recent(
    allData$: Observable<FinanceDataModel[]>
  ): FinanceDataModel[] {
    const results: FinanceDataModel[] = [];
    allData$.subscribe((data) => {
      const safe = data ?? [];
      results.push(...safe.slice(0, 5));
    });
    return results;
  }

  // Method to display the selected entity in the input field
  displayFn(entity: FinanceDataModel): string {
    return entity && entity.description ? entity.description : '';
  }

  // Emit the selected entity when the user chooses one
  onOptionSelected(event: any): void {
    this.entitySelected.emit(event.option.value);
  }
}
