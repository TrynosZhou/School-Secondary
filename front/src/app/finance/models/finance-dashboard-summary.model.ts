/**
 * Optional filters for staff finance dashboard summary (query params).
 */
export interface FinanceDashboardSummaryFilters {
  startDate?: string;
  endDate?: string;
  enrolTerm?: string;
  transactionType?: 'Invoice' | 'Payment';
}

export interface MonthlyBreakdownItem {
  monthLabel: string;
  year: number;
  month: number;
  invoicesTotal: number;
  paymentsTotal: number;
}

/**
 * Staff finance dashboard summary (cards + chart).
 */
export interface FinanceDashboardSummary {
  totalInvoiced: number;
  totalPayments: number;
  outstandingBalance: number;
  invoiceCount: number;
  receiptCount: number;
  totalTransactions: number;
  averageInvoiceAmount: number;
  averagePaymentAmount: number;
  collectionRate: number;
  monthlyBreakdown: MonthlyBreakdownItem[];
}
