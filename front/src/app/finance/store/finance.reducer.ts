import { FeesModel } from '../models/fees.model';
import { createReducer, on } from '@ngrx/store';
import {
  balancesActions,
  billingActions,
  billStudentActions,
  exemptionActions,
  feesActions,
  financeDashboardSummaryActions,
  invoiceActions,
  isNewComerActions,
  receiptActions,
} from './finance.actions';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';
import { ExemptionModel } from '../models/exemption.model';
import { FinanceDashboardSummary } from '../models/finance-dashboard-summary.model';
import { ExemptionType } from '../enums/exemption-type.enum';
import { FeesNames } from '../enums/fees-names.enum';
import { BulkClassInvoiceResponse } from '../models/bulk-class-invoice.model';

export interface State {
  fees: FeesModel[];
  studentsToBill: EnrolsModel[];
  isLoading: boolean;
  loadingInvoice: boolean;
  errorMessage: string;
  selectedStudentInvoice: InvoiceModel | null;
  invoiceWarning: { message: string; voidedInvoiceNumber?: string; voidedAt?: Date; voidedBy?: string } | null;
  fetchInvoiceError: string;
  generateEmptyInvoiceErr: string;
  balance: BalancesModel | null;
  isNewComer: boolean;
  invoiceStats: InvoiceStatsModel[];
  termInvoices: InvoiceModel[];
  allInvoices: InvoiceModel[];
  allReceipts: ReceiptModel[];
  studentOutstandingBalance: number;
  createdReceipt: ReceiptModel;
  isLoadingStudentBalance: boolean;

  studentInvoices: InvoiceModel[];
  loadingStudentInvoices: boolean;
  loadStudentReceiptsErr: string;

  studentReceipts: ReceiptModel[];
  loadingStudentReceipts: boolean;
  loadStudentInvoicesErr: string;

  /** Effective student number for finance overview (set by dashboard; used by invoice/receipt when parent). */
  effectiveStudentNumberForFinance: string | null;

  /** Cache by student number to avoid refetch when parent switches back to a child tab. */
  studentInvoicesByNumber: Record<string, InvoiceModel[]>;
  studentReceiptsByNumber: Record<string, ReceiptModel[]>;

  exemption: ExemptionModel | null;
  exemptionLoading: boolean;
  exemptionError: string | null;
  allExemptions: ExemptionModel[];
  loadingAllExemptions: boolean;
  loadingExemptionById: boolean;
  updatingExemption: boolean;
  deletingExemption: boolean;

  financeDashboardSummary: FinanceDashboardSummary | null;
  loadingFinanceDashboardSummary: boolean;
  financeDashboardSummaryError: string | null;
  bulkInvoiceResult: BulkClassInvoiceResponse | null;
  bulkInvoiceLoading: boolean;
}

export const initialState: State = {
  fees: [],
  studentsToBill: [],
  isLoading: false,
  loadingInvoice: false,
  errorMessage: '',
  selectedStudentInvoice: {} as InvoiceModel,
  invoiceWarning: null,
  fetchInvoiceError: '',
  generateEmptyInvoiceErr: '',
  balance: null,
  isNewComer: false,
  invoiceStats: [],
  termInvoices: [],
  allInvoices: [],
  allReceipts: [],
  studentOutstandingBalance: 0,
  createdReceipt: {} as ReceiptModel,
  isLoadingStudentBalance: false,

  studentInvoices: [],
  loadingStudentInvoices: false,
  loadStudentInvoicesErr: '',
  studentReceipts: [],
  loadingStudentReceipts: false,
  loadStudentReceiptsErr: '',
  effectiveStudentNumberForFinance: null,
  studentInvoicesByNumber: {},
  studentReceiptsByNumber: {},

  exemption: null,
  exemptionLoading: false,
  exemptionError: null,
  allExemptions: [],
  loadingAllExemptions: false,
  loadingExemptionById: false,
  updatingExemption: false,
  deletingExemption: false,

  financeDashboardSummary: null,
  loadingFinanceDashboardSummary: false,
  financeDashboardSummaryError: null,
  bulkInvoiceResult: null,
  bulkInvoiceLoading: false,
};

export const financeReducer = createReducer(
  initialState,
  on(feesActions.fetchFees, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.fetchFeesSuccess, (state, { fees }) => ({
    ...state,
    fees: [...fees],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.fetchFeesFail, (state, { error }) => ({
    ...state,
    fees: [],
    isLoading: false,
    errorMessage: error.message,
  })),

  on(feesActions.addFee, (state, { fee }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.addFeeSuccess, (state, { fee }) => ({
    ...state,
    fees: [...state.fees, fee],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.addFeeFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(feesActions.editFee, (state, { fee }) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(feesActions.editFeeSuccess, (state, { fee }) => ({
    ...state,
    // fees: [...state.fees.map((f) => (f.id == fee.id ? (f = fee) : (f = f)))],
    fees: [...state.fees.map((f) => (f.id === fee.id ? { ...fee } : f))],
    isLoading: false,
    errorMessage: '',
  })),
  on(feesActions.editFeeFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(billingActions.fetchStudentsToBill, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    studentsToBill: [],
  })),
  on(
    billingActions.fetchStudentsToBillSuccess,
    (state, { studentsToBill }) => ({
      ...state,
      isLoading: false,
      errorMessage: '',
      studentsToBill,
    })
  ),
  on(billingActions.fetchStudentsToBillFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    studentsToBill: [],
  })),
  on(invoiceActions.fetchInvoice, (state) => ({
    ...state,
    loadingInvoice: true,
    fetchInvoiceError: '',
    invoiceWarning: null,
    selectedStudentInvoice: {} as InvoiceModel,
  })),
  on(invoiceActions.fetchInvoiceSuccess, (state, { invoice, warning }) => ({
    ...state,
    loadingInvoice: false,
    fetchInvoiceError: '',
    selectedStudentInvoice: invoice,
    invoiceWarning: warning || null,
  })),
  on(invoiceActions.fetchInvoiceFail, (state, { error }) => ({
    ...state,
    loadingInvoice: false,
    fetchInvoiceError: error.message,
    invoiceWarning: null,
    selectedStudentInvoice: {} as InvoiceModel,
  })),
  on(balancesActions.saveBalance, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    balance: null,
  })),
  on(balancesActions.saveBalanceSuccess, (state, { balance }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    balance,
  })),
  on(balancesActions.saveBalanceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    balance: null,
  })),
  on(isNewComerActions.checkIsNewComer, (state) => ({
    ...state,
    isNewComer: false,
    isLoading: true,
    errorMessage: '',
  })),
  on(isNewComerActions.checkIsNewComerSuccess, (state, { isNewComer }) => ({
    ...state,
    isLoading: false,
    isNewComer,
    errorMessage: '',
  })),
  on(isNewComerActions.checkIsNewComerFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    isNewComer: false,
    errorMessage: error.message,
  })),
  on(billStudentActions.billStudent, (state, { bills }) => {
    // Simply replace the bills in the selected invoice
    // This works for both new invoices (empty bills) and existing invoices (replace existing bills)
    if (!state.selectedStudentInvoice) {
      return state; // No invoice selected, nothing to update
    }

    // Calculate the new total bill from the new bills
    // Validate that all bills have fees with amounts
    const newTotalBill = bills.reduce((sum, bill) => {
      if (!bill.fees || bill.fees.amount === undefined) {
        console.warn('Bill missing fees or amount in reducer', {
          billId: bill.id,
          feeId: bill.fees?.id,
        });
        return sum;
      }
      return sum + Number(bill.fees.amount);
    }, 0);

    return {
      ...state,
      selectedStudentInvoice: {
        ...state.selectedStudentInvoice,
        bills: [...bills], // Replace with the new bills
        totalBill: newTotalBill, // Update total bill
        balance: newTotalBill - (state.selectedStudentInvoice.amountPaidOnInvoice || 0), // Recalculate balance
      },
    };
  }),

  // billStudentSuccess and billStudentFail actions removed - bills are now updated locally only

  on(invoiceActions.downloadInvoice, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.downloadInvoiceSuccess, (state) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
  })),
  on(invoiceActions.downloadInvoiceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(invoiceActions.saveInvoice, (state) => ({
    ...state,

    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.saveInvoiceSuccess, (state, { invoice }) => {
    // Check if the invoice already exists in the array
    const existingInvoice = state.allInvoices.find(
      (inv) => inv.invoiceNumber === invoice.invoiceNumber
    );

    let updatedAllInvoices;

    if (existingInvoice) {
      // If the invoice exists, map over the array to replace the old one
      updatedAllInvoices = state.allInvoices.map((inv) =>
        inv.invoiceNumber === invoice.invoiceNumber ? invoice : inv
      );
    } else {
      // If the invoice is new, add it to the end of the array
      updatedAllInvoices = [...state.allInvoices, invoice];
    }

    return {
      ...state,
      selectedStudentInvoice: invoice,
      allInvoices: updatedAllInvoices,
      isLoading: false,
      errorMessage: '',
    };
  }),
  on(invoiceActions.saveInvoiceFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error?.error?.message ?? error?.message ?? 'Failed to save invoice.',
  })),
  on(invoiceActions.bulkInvoiceClass, (state) => ({
    ...state,
    bulkInvoiceLoading: true,
    bulkInvoiceResult: null,
    errorMessage: '',
  })),
  on(invoiceActions.bulkInvoiceClassSuccess, (state, { result }) => ({
    ...state,
    bulkInvoiceLoading: false,
    bulkInvoiceResult: result,
    errorMessage: '',
  })),
  on(invoiceActions.bulkInvoiceClassFail, (state, { error }) => ({
    ...state,
    bulkInvoiceLoading: false,
    errorMessage:
      error?.error?.message ?? error?.message ?? 'Failed to run bulk invoicing.',
  })),
  on(invoiceActions.fetchInvoiceStats, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
    invoiceStats: [],
  })),
  on(invoiceActions.fetchInvoiceStatsSuccess, (state, { invoiceStats }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    invoiceStats,
  })),
  on(invoiceActions.fetchInvoiceStatsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
    invoiceStats: [],
  })),
  on(invoiceActions.fetchTermInvoices, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.fetchTermInvoicesSuccess, (state, { invoices }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    termInvoices: [...invoices],
  })),
  on(invoiceActions.fetchTermInvoicesFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(invoiceActions.fetchAllInvoices, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.fetchAllInvoicesSuccess, (state, { allInvoices }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    allInvoices: allInvoices,
  })),
  on(invoiceActions.fetchAllInvoicesFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.fetchAllReceipts, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.fetchAllReceiptsSuccess, (state, { allReceipts }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    allReceipts: allReceipts,
  })),
  on(receiptActions.fetchAllReceiptsFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.saveReceipt, (state) => ({
    ...state,
    isLoading: true,
    // Reset so UI can't react to stale "createdReceipt" from a prior save
    createdReceipt: {} as ReceiptModel,
    errorMessage: '',
  })),
  on(receiptActions.saveReceiptSuccess, (state, { receipt }) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
    createdReceipt: receipt,
    // Filter out the old receipt (if it exists) and add the new one
    allReceipts: [
      ...state.allReceipts.filter(
        (r) => r.receiptNumber !== receipt.receiptNumber
      ),
      receipt,
    ],
  })),
  on(receiptActions.saveReceiptFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.downloadReceiptPdf, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.downloadReceiptPdfSuccess, (state) => ({
    ...state,
    isLoading: false,
    errorMessage: '',
  })),
  on(receiptActions.downloadReceiptPdfFail, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  on(receiptActions.fetchStudentOutstandingBalance, (state) => ({
    ...state,

    isLoadingStudentBalance: true,
    errorMessage: '',
  })),
  on(
    receiptActions.fetchStudentOutstandingBalanceSuccess,
    (state, { amountDue }) => ({
      ...state,

      isLoadingStudentBalance: false,
      errorMessage: '',
      studentOutstandingBalance: amountDue,
    })
  ),
  on(receiptActions.fetchStudentOutstandingBalanceFail, (state, { error }) => ({
    ...state,

    isLoadingStudentBalance: false,
    errorMessage: error.message,
  })),
  on(receiptActions.clearStudentFinancials, (state) => ({
    ...state,
    studentOutstandingBalance: 0, // Reset balance
    createdReceipt: {} as ReceiptModel, // Reset created receipt
    // You might also want to reset isLoading and errorMessage if they are tied specifically to the dialog/financial flow
    isLoading: false,
    errorMessage: '',
  })),
  on(receiptActions.clearCreatedReceipt, (state) => ({
    ...state,
    createdReceipt: {} as ReceiptModel,
    errorMessage: '',
    isLoading: false,
  })),
  on(receiptActions.fetchStudentReceipts, (state) => ({
    ...state,
    loadingStudentReceipts: true,
    loadStudentReceiptsErr: '',
  })),
  on(
    receiptActions.fetchStudentReceiptsSuccess,
    (state, { studentNumber, studentReceipts }) => ({
      ...state,
      studentReceipts,
      loadingStudentReceipts: false,
      studentReceiptsByNumber: {
        ...state.studentReceiptsByNumber,
        [studentNumber]: studentReceipts,
      },
    })
  ),
  on(receiptActions.fetchStudentReceiptsFail, (state, { error }) => ({
    ...state,
    loadingStudentReceipts: false,
    loadStudentReceiptsErr: error.message,
  })),
  on(invoiceActions.fetchStudentInvoices, (state) => ({
    ...state,
    loadingStudentInvoices: true,
    loadStudentInvoicesErr: '',
  })),
  on(
    invoiceActions.fetchStudentInvoicesSuccess,
    (state, { studentNumber, studentInvoices }) => ({
      ...state,
      studentInvoices,
      loadingStudentInvoices: false,
      studentInvoicesByNumber: {
        ...state.studentInvoicesByNumber,
        [studentNumber]: studentInvoices,
      },
    })
  ),
  on(invoiceActions.fetchStudentInvoicesFail, (state, { error }) => ({
    ...state,
    loadingStudentInvoices: false,
    loadStudentInvoicesErr: error.message,
  })),
  on(invoiceActions.setEffectiveStudentForFinance, (state, { studentNumber }) => ({
    ...state,
    effectiveStudentNumberForFinance: studentNumber,
  })),
  on(invoiceActions.updateInvoiceEnrolment, (state, { enrol }) => {
    const enrolId = enrol.id;
    const enrolNum = enrol.num;
    const enrolYear = enrol.year;
    if (enrolId == null) return state;

    // Only update invoices for this enrolment's term (current term of the edited enrolment).
    // Do not change invoices from previous or other terms.
    const isSameTermEnrolment = (inv: InvoiceModel): boolean =>
      inv.enrol?.id === enrolId &&
      inv.enrol?.num === enrolNum &&
      inv.enrol?.year === enrolYear;

    const updateInvoiceEnrol = (inv: InvoiceModel): InvoiceModel =>
      isSameTermEnrolment(inv) ? { ...inv, enrol: { ...enrol } } : inv;

    const updatedAllInvoices = state.allInvoices.map(updateInvoiceEnrol);
    const updatedTermInvoices = state.termInvoices.map(updateInvoiceEnrol);
    const updatedStudentInvoices = state.studentInvoices.map(updateInvoiceEnrol);
    const selectedUpdated = state.selectedStudentInvoice && isSameTermEnrolment(state.selectedStudentInvoice)
      ? { ...state.selectedStudentInvoice, enrol: { ...enrol } }
      : state.selectedStudentInvoice;

    return {
      ...state,
      allInvoices: updatedAllInvoices,
      termInvoices: updatedTermInvoices,
      studentInvoices: updatedStudentInvoices,
      selectedStudentInvoice: selectedUpdated,
    };
  }),
  // Handle Create Exemption action (start loading)
  on(exemptionActions.createExemption, (state) => ({
    ...state,
    exemptionLoading: true,
    exemptionError: null, // Clear any previous errors
  })),

  // Handle Create Exemption Success action (store exemption, stop loading)
  on(exemptionActions.createExemptionSuccess, (state, { exemption }) => ({
    ...state,
    exemption: exemption, // Store the newly created exemption
    allExemptions: [...state.allExemptions, exemption], // Add to allExemptions
    exemptionLoading: false,
    exemptionError: null,
  })),

  // Handle Create Exemption Failure action (store error, stop loading)
  on(exemptionActions.createExemptionFailure, (state, { error }) => ({
    ...state,
    exemptionLoading: false,
    exemptionError: error,
    exemption: null, // Clear exemption on error
  })),
  
  // Fetch All Exemptions
  on(exemptionActions.fetchAllExemptions, (state) => ({
    ...state,
    loadingAllExemptions: true,
    exemptionError: null,
  })),
  on(exemptionActions.fetchAllExemptionsSuccess, (state, { exemptions }) => ({
    ...state,
    allExemptions: exemptions,
    loadingAllExemptions: false,
    exemptionError: null,
  })),
  on(exemptionActions.fetchAllExemptionsFailure, (state, { error }) => ({
    ...state,
    loadingAllExemptions: false,
    exemptionError: error,
  })),
  
  // Fetch Exemption By ID
  on(exemptionActions.fetchExemptionById, (state) => ({
    ...state,
    loadingExemptionById: true,
    exemptionError: null,
  })),
  on(exemptionActions.fetchExemptionByIdSuccess, (state, { exemption }) => ({
    ...state,
    exemption: exemption,
    loadingExemptionById: false,
    exemptionError: null,
  })),
  on(exemptionActions.fetchExemptionByIdFailure, (state, { error }) => ({
    ...state,
    loadingExemptionById: false,
    exemptionError: error,
    exemption: null,
  })),
  
  // Update Exemption
  on(exemptionActions.updateExemption, (state) => ({
    ...state,
    updatingExemption: true,
    exemptionError: null,
  })),
  on(exemptionActions.updateExemptionSuccess, (state, { exemption }) => ({
    ...state,
    // Update in allExemptions array if it exists
    allExemptions: state.allExemptions.map((e) => 
      e.id === exemption.id ? exemption : e
    ),
    // Update current exemption if it's the one being updated
    exemption: state.exemption?.id === exemption.id ? exemption : state.exemption,
    updatingExemption: false,
    exemptionError: null,
  })),
  on(exemptionActions.updateExemptionFailure, (state, { error }) => ({
    ...state,
    updatingExemption: false,
    exemptionError: error,
  })),
  
  // Delete Exemption
  on(exemptionActions.deleteExemption, (state) => ({
    ...state,
    deletingExemption: true,
    exemptionError: null,
  })),
  on(exemptionActions.deleteExemptionSuccess, (state, { id }) => ({
    ...state,
    // Remove from allExemptions array
    allExemptions: state.allExemptions.filter((e) => e.id !== id),
    // Clear current exemption if it's the one being deleted
    exemption: state.exemption?.id === id ? null : state.exemption,
    deletingExemption: false,
    exemptionError: null,
  })),
  on(exemptionActions.deleteExemptionFailure, (state, { error }) => ({
    ...state,
    deletingExemption: false,
    exemptionError: error,
  })),
  on(receiptActions.voidReceipt, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(receiptActions.voidReceiptSuccess, (state, { receipt }) => ({
    ...state,
    isLoading: false,
    // Find the receipt in the list and replace it with the updated (voided) version
    allReceipts: state.allReceipts.map((r) =>
      r.id === receipt.id ? receipt : r
    ),
  })),
  on(receiptActions.voidReceiptFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),
  // Void Invoice Reducers
  on(invoiceActions.voidInvoice, (state) => ({
    ...state,
    isLoading: true,
    errorMessage: '',
  })),
  on(invoiceActions.voidInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    isLoading: false,
    // Update invoice in all relevant arrays
    allInvoices: state.allInvoices.map((inv) =>
      inv.id === invoice.id ? invoice : inv
    ),
    termInvoices: state.termInvoices.map((inv) =>
      inv.id === invoice.id ? invoice : inv
    ),
    studentInvoices: state.studentInvoices.map((inv) =>
      inv.id === invoice.id ? invoice : inv
    ),
    selectedStudentInvoice:
      state.selectedStudentInvoice?.id === invoice.id
        ? invoice
        : state.selectedStudentInvoice,
  })),
  on(invoiceActions.voidInvoiceFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    errorMessage: error.message,
  })),

  on(financeDashboardSummaryActions.fetchFinanceDashboardSummary, (state) => ({
    ...state,
    loadingFinanceDashboardSummary: true,
    financeDashboardSummaryError: null,
  })),
  on(
    financeDashboardSummaryActions.fetchFinanceDashboardSummarySuccess,
    (state, { summary }) => ({
      ...state,
      financeDashboardSummary: summary,
      loadingFinanceDashboardSummary: false,
      financeDashboardSummaryError: null,
    })
  ),
  on(
    financeDashboardSummaryActions.fetchFinanceDashboardSummaryFailure,
    (state, { error }) => ({
      ...state,
      loadingFinanceDashboardSummary: false,
      financeDashboardSummaryError: error?.message ?? 'Failed to load summary',
    })
  )
);
