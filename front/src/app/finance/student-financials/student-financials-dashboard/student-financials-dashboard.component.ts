// src/app/finance/components/student-financials-dashboard/student-financials-dashboard.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { Observable, Subscription, Subject, combineLatest } from 'rxjs';
import { filter, tap, takeUntil, take, switchMap, map } from 'rxjs/operators';
import {
  selectStudentInvoices,
  selectStudentReceipts,
  selectLoadingStudentInvoices,
  selectLoadingStudentReceipts,
} from '../../store/finance.selector';
import {
  invoiceActions,
  receiptActions,
} from '../../store/finance.actions';
import { studentDashboardActions } from 'src/app/dashboard/store/dashboard.actions';
import { selectStudentDashboardSummary } from 'src/app/dashboard/store/dashboard.selectors';
import { User } from 'src/app/auth/models/user.model';
import {
  selectUser,
  selectLinkedChildrenAnyRole,
  selectIsParent,
} from 'src/app/auth/store/auth.selectors';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ThemeService, Theme } from 'src/app/services/theme.service';
import { EffectiveStudentService } from 'src/app/services/effective-student.service';
import { BehaviorSubject } from 'rxjs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { NoLinkedStudentsComponent } from 'src/app/shared/no-linked-students/no-linked-students.component';

@Component({
  selector: 'app-student-financials-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    NoLinkedStudentsComponent,
  ],
  templateUrl: './student-financials-dashboard.component.html',
  styleUrls: ['./student-financials-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentFinancialsDashboardComponent implements OnInit, OnDestroy {
  // Data Observables
  user$: Observable<User | null>;
  outstandingBalance$: Observable<number>;
  /** True when user role is parent (so they always see parent view). */
  isParent$: Observable<boolean>;
  linkedChildren$: Observable<{ studentNumber: string; name?: string; surname?: string }[]>;

  /** When user is parent: selected tab index (0-based). */
  selectedChildIndex$ = new BehaviorSubject<number>(0);
  /** When user is parent, the selected child's student number; otherwise unused. */
  selectedChildStudentNumber$: Observable<string | null>;

  // Computed properties
  currentUser$: Observable<User | null>;
  /** Effective student number: for student = user.id, for parent = selected linked child. */
  studentNumber$: Observable<string | null>;
  studentName$: Observable<string | null>;
  /** True when invoices or receipts are loading (e.g. after switching child tab). */
  loadingForChild$: Observable<boolean>;

  // Theme
  currentTheme: Theme = 'light';

  // Lifecycle Management
  private ngUnsubscribe = new Subject<void>();
  private routeSubscription: Subscription | undefined;

  // Navigation
  navLinks = [
    { 
      label: 'Invoices', 
      path: 'invoices', 
      icon: 'receipt_long',
      description: 'View all your invoices and billing details'
    },
    { 
      label: 'Receipts', 
      path: 'receipts', 
      icon: 'payment',
      description: 'View payment receipts and confirmations'
    },
    { 
      label: 'Payment History', 
      path: 'payment-history', 
      icon: 'history',
      description: 'Track your payment history and transactions'
    },
  ];

  constructor(
    private router: Router,
    private store: Store,
    private route: ActivatedRoute,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private effectiveStudentService: EffectiveStudentService,
  ) {
    this.user$ = this.store.select(selectUser);
    this.isParent$ = this.store.select(selectIsParent);
    this.linkedChildren$ = this.store.select(selectLinkedChildrenAnyRole);

    // Selected child for parent: from tab index
    this.selectedChildStudentNumber$ = combineLatest([
      this.linkedChildren$,
      this.selectedChildIndex$,
    ]).pipe(
      map(([children, idx]) => (children && children[idx]) ? children[idx].studentNumber : null)
    );

    // Outstanding balance from backend summary (single source of truth)
    this.outstandingBalance$ = this.store.select(selectStudentDashboardSummary).pipe(
      map((summary) => summary?.financialSummary?.amountOwed ?? 0)
    );

    this.currentUser$ = this.user$;
    this.studentNumber$ = this.effectiveStudentService.getEffectiveStudentNumber$(
      this.selectedChildStudentNumber$,
    );

    this.loadingForChild$ = combineLatest([
      this.store.select(selectLoadingStudentInvoices),
      this.store.select(selectLoadingStudentReceipts),
    ]).pipe(
      map(([inv, rec]) => inv || rec),
    );

    // Get student name from student-scoped invoices or receipts (already loaded for this student)
    this.studentName$ = combineLatest([
      this.store.select(selectStudentInvoices),
      this.store.select(selectStudentReceipts),
    ]).pipe(
      map(([invoices, receipts]) => {
        const inv = (invoices || [])[0];
        if (inv?.student) {
          return `${inv.student.name} ${inv.student.surname}`.trim();
        }
        const rec = (receipts || [])[0];
        if (rec?.student) {
          return `${rec.student.name} ${rec.student.surname}`.trim();
        }
        return null;
      })
    );
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((theme) => {
        this.currentTheme = theme;
        this.cdr.markForCheck();
      });
    
    this.loadUserData();
    this.setupNavigation();
  }

  loadUserData(): void {
    // Sync effective student number to store so invoice/receipt child routes use it (parent = selected child, student = own id).
    this.studentNumber$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((studentNumber) => {
        this.store.dispatch(
          invoiceActions.setEffectiveStudentForFinance({ studentNumber })
        );
      });

    // When effective student number is set, load invoices/receipts/dashboard for that student.
    this.studentNumber$
      .pipe(
        filter((sn): sn is string => !!sn),
        tap((studentNumber) => {
          this.store.dispatch(
            invoiceActions.fetchStudentInvoices({ studentNumber })
          );
          this.store.dispatch(
            receiptActions.fetchStudentReceipts({ studentNumber })
          );
          this.store.dispatch(
            studentDashboardActions.fetchStudentDashboardSummary({ studentNumber })
          );
        }),
        takeUntil(this.ngUnsubscribe)
      )
      .subscribe({
        error: (error) => console.error('Failed to load user data:', error)
      });
  }

  onParentTabChange(ev: MatTabChangeEvent): void {
    this.selectedChildIndex$.next(ev.index);
  }

  private setupNavigation(): void {
    // Navigate to default tab if no child route is active
    if (this.router.url === '/student-financials' || this.router.url === '/student-financials/') {
      this.router.navigate(['invoices'], { relativeTo: this.route });
    }
  }


  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  // Helper to determine the active tab based on the current URL
  isLinkActive(linkPath: string): boolean {
    // This logic might need refinement based on your exact routing setup
    return this.router.url.includes(linkPath);
  }
}
