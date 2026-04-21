import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { ClassesModel } from 'src/app/enrolment/models/classes.model';
import { fetchClasses } from 'src/app/enrolment/store/enrolment.actions';
import { selectClasses, selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { BulkClassInvoiceResponse } from '../../models/bulk-class-invoice.model';
import { invoiceActions } from '../../store/finance.actions';
import {
  selectBulkInvoiceLoading,
  selectBulkInvoiceResult,
} from '../../store/finance.selector';

@Component({
  selector: 'app-bulk-class-invoicing',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './bulk-class-invoicing.component.html',
  styleUrls: ['./bulk-class-invoicing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BulkClassInvoicingComponent implements OnInit, OnDestroy {
  terms$: Observable<TermsModel[]>;
  classes$: Observable<ClassesModel[]>;
  bulkInvoiceResult$: Observable<BulkClassInvoiceResponse | null>;
  bulkInvoiceLoading$: Observable<boolean>;
  selectedTerm: TermsModel | null = null;
  selectedClassName = '';
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private cdr: ChangeDetectorRef) {
    this.terms$ = this.store.select(selectTerms);
    this.classes$ = this.store.select(selectClasses);
    this.bulkInvoiceResult$ = this.store.select(selectBulkInvoiceResult);
    this.bulkInvoiceLoading$ = this.store.select(selectBulkInvoiceLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(fetchClasses());
    this.bulkInvoiceResult$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatTerm(term: TermsModel): string {
    const label = term.label?.trim();
    const type = term.type ? ` (${term.type})` : '';
    return label && label.length > 0
      ? `${label}${type}`
      : `Term ${term.num} ${term.year}${type}`;
  }

  canRunBulkInvoicing(): boolean {
    return !!this.selectedTerm && this.selectedClassName.trim().length > 0;
  }

  runBulkInvoicing(): void {
    const className = this.selectedClassName.trim();
    if (!this.selectedTerm || !className) {
      return;
    }

    this.store.dispatch(
      invoiceActions.bulkInvoiceClass({
        className,
        num: this.selectedTerm.num,
        year: this.selectedTerm.year,
        termId: this.selectedTerm.id,
      })
    );
  }
}

