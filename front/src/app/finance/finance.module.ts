import { NgModule } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FeesComponent } from './fees/fees.component';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { financeReducer } from './store/finance.reducer';
import { FinanceEffects } from './store/finance.effects';
// AddEditFeesComponent is dynamically loaded in FeesComponent
// PaymentsComponent is now standalone and lazy loaded
// StudentFinanceComponent is now standalone and lazy loaded
import { StudentsToBillComponent } from './student-finance/students-to-bill/students-to-bill.component';
import { StudentEnrolmentDetailsComponent } from './student-finance/student-enrolment-details/student-enrolment-details.component';
import { CurrentEnrolmentComponent } from './student-finance/current-enrolment/current-enrolment.component';
import { InvoiceComponent } from './student-finance/invoice/invoice.component';
// BillingComponent is dynamically loaded
import { StudentBalancesComponent } from './student-balances/student-balances.component';
import { SharedModule } from '../shared/shared.module';
import { AddEditBalancesComponent } from './student-balances/add-edit-balances/add-edit-balances.component';
import { EnrolmentModule } from '../enrolment/enrolment.module';
import { InvoiceItemComponent } from './student-finance/invoice/invoice-item/invoice-item.component';
import { SearchInvoiceComponent } from './student-finance/invoice/search-invoice/search-invoice.component';
import { InvoiceListComponent } from './student-finance/invoice/invoice-list/invoice-list.component';
// ReceiptItemComponent is now standalone
// SearchReceiptComponent is now standalone
// FilterReceiptsDialogComponent is now standalone
// ReceiptSummaryCardComponent is now standalone
// AddReceiptDialogComponent is now standalone
import { StudentFinancialsDashboardComponent } from './student-financials/student-financials-dashboard/student-financials-dashboard.component';
import { StudentInvoicesComponent } from './student-financials/student-invoices/student-invoices.component';
import { StudentReceiptsComponent } from './student-financials/student-receipts/student-receipts.component';
import { StudentPaymentHistoryComponent } from './student-financials/student-payment-history/student-payment-history.component';
// StudentLedgerReportComponent is now standalone and lazy loaded
import { FeesCollectionReportComponent } from './reports/fees-collection-report/fees-collection-report.component';
import { NgChartsModule } from 'ng2-charts';
// OutstandingFeesReportComponent is now standalone and lazy loaded
import { AgedDebtorsReportComponent } from './reports/aged-debtors-report/aged-debtors-report.component';
import { RevenueRecognitionReportComponent } from './reports/revenue-recognition-report/revenue-recognition-report.component';
import { EnrollmentBillingReconciliationReportComponent } from './reports/enrollment-billing-reconciliation-report/enrollment-billing-reconciliation-report.component';
import { CreateExemptionComponent } from './create-exemption/create-exemption.component';
import { ExemptionReportsComponent } from './reports/exemption-reports/exemption-reports/exemption-reports.component';
import { ExemptionReportFiltersComponent } from './reports/exemption-reports/exemption-report-filters/exemption-report-filters.component';
import { TotalExemptionAmountCardComponent } from './reports/exemption-reports/total-exemption-amount-card/total-exemption-amount-card.component';
import { ExemptionSummaryByTypeTableComponent } from './reports/exemption-reports/exemption-summary-by-type-table.component/exemption-summary-by-type-table.component.component';
import { ExemptionDetailedListTableComponent } from './reports/exemption-reports/exemption-detailed-list-table/exemption-detailed-list-table.component';
import { GetUniqueTermNumbersPipe } from '../shared/pipes/get-unique-term-numbers.pipe';
import { ExemptionSummaryByStudentTableComponent } from './reports/exemption-reports/exemption-summary-by-student-table/exemption-summary-by-student-table.component';
import { ExemptionSummaryByEnrolmentTableComponent } from './reports/exemption-reports/exemption-summary-by-enrolment-table/exemption-summary-by-enrolment-table.component';

@NgModule({
  declarations: [
    // PaymentsComponent is now standalone and lazy loaded
    // StudentFinanceComponent is now standalone, not declared here
    StudentsToBillComponent,
    StudentEnrolmentDetailsComponent,
    CurrentEnrolmentComponent,
    // InvoiceComponent is now standalone
    // BillingComponent is dynamically loaded, not declared here
    // StudentBalancesComponent is now standalone and lazy loaded
    // AddEditBalancesComponent is now standalone
    // InvoiceItemComponent is now standalone
    // SearchInvoiceComponent is now standalone
    // InvoiceListComponent is now standalone
    // ReceiptItemComponent is now standalone
    // SearchReceiptComponent is now standalone
    // FilterReceiptsDialogComponent is now standalone
    // ReceiptSummaryCardComponent is now standalone
    // AddReceiptDialogComponent is now standalone
    // StudentFinancialsDashboardComponent is now standalone and lazy loaded
    // StudentInvoicesComponent is now standalone and lazy loaded
    // StudentReceiptsComponent is now standalone and lazy loaded
    // StudentPaymentHistoryComponent is now standalone and lazy loaded
    // StudentLedgerReportComponent is now standalone and lazy loaded
    // OutstandingFeesReportComponent is now standalone and lazy loaded
    FeesCollectionReportComponent,
    // AgedDebtorsReportComponent is now standalone and lazy-loaded
    RevenueRecognitionReportComponent,
    // EnrollmentBillingReconciliationReportComponent is now standalone and lazy-loaded
    CreateExemptionComponent,
    ExemptionReportsComponent,
    ExemptionReportFiltersComponent,
    TotalExemptionAmountCardComponent,
    ExemptionSummaryByTypeTableComponent,
    ExemptionSummaryByStudentTableComponent,
    ExemptionSummaryByEnrolmentTableComponent,
    ExemptionDetailedListTableComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    EnrolmentModule,
    StoreModule.forFeature('finance', financeReducer),
    EffectsModule.forFeature([FinanceEffects]),
    NgChartsModule,
    DecimalPipe,
    // Standalone components
    FeesComponent,
    // AddEditFeesComponent is dynamically loaded, not imported here
  ],
  exports: [CurrentEnrolmentComponent, StudentEnrolmentDetailsComponent],
})
export class FinanceModule {}
