import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceItemComponent } from './invoice-item/invoice-item.component';
import { SearchInvoiceComponent } from './search-invoice/search-invoice.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { invoiceActions } from '../../store/finance.actions';
import { InvoiceModel } from '../../models/invoice.model';
import { selectTermInvoices } from '../../store/finance.selector';
import { SharedService } from 'src/app/shared.service';
import { selectUser } from 'src/app/auth/store/auth.selectors';
import { fetchTerms } from 'src/app/enrolment/store/enrolment.actions';
import { TermsModel } from 'src/app/enrolment/models/terms.model';
import { selectTerms } from 'src/app/enrolment/store/enrolment.selectors';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { RoleAccessService } from 'src/app/services/role-access.service';
import { ROLES } from 'src/app/registration/models/roles.enum';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InvoiceItemComponent,
    SearchInvoiceComponent,
    InvoiceListComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceComponent implements OnInit, OnDestroy {
  role = '';
  term: TermsModel | null = null;
  terms$ = this.store.select(selectTerms);
  invoices$ = this.store.select(selectTermInvoices);
  invoice: InvoiceModel | null = null;
  currentTheme: Theme = 'light';
  canAccessBilling$ = this.roleAccess.getCurrentRole$().pipe(
    map(role => this.roleAccess.hasAnyRole(role, ROLES.reception, ROLES.director, ROLES.auditor))
  );
  
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    public sharedService: SharedService,
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private roleAccess: RoleAccessService
  ) {
    this.store.dispatch(fetchTerms());
  }

  ngOnInit(): void {
    // Subscribe to user role
    this.store.select(selectUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.role = user.role;
          this.cdr.markForCheck();
        }
      });

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

  onTermChange(term: TermsModel) {
    this.term = term;
    // this.store.dispatch(
    //   invoiceActions.fetchInvoiceStats({ num: term.num, year: term.year })
    // );
    this.store.dispatch(
      invoiceActions.fetchTermInvoices({ num: term.num, year: term.year })
    );
  }

  onInvoiceSelected(invoice: InvoiceModel) {
    this.invoice = invoice;
    this.cdr.markForCheck();
  }

  namesToString(name: string) {
    switch (name) {
      case 'amount':
        return 'Amount';

      case 'tuition':
        return 'Tuition';
      case 'boarders':
        return 'Boarders';
      case 'dayScholars':
        return 'Day';
      case 'food':
        return 'Food';
      case 'transport':
        return 'Transport';
      case 'science':
        return 'Scie Levy';
      case 'desk':
        return 'Desk Fee';
      case 'development':
        return 'Dev Levy';
      case 'application':
        return 'Application';
      default:
        return name;
    }
  }
}
