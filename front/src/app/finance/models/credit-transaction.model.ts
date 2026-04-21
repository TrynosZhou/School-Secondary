export enum CreditTransactionType {
  CREDIT = 'CREDIT',
  DEDUCTION = 'DEDUCTION',
  APPLICATION = 'APPLICATION',
  REVERSAL = 'REVERSAL',
}

export interface CreditTransactionModel {
  id: number;
  studentCredit: {
    id: number;
    studentNumber: string;
    amount: number;
  };
  amount: number; // Positive for credit/reversal, negative for application
  transactionType: CreditTransactionType;
  source: string;
  relatedReceiptId?: number;
  relatedInvoiceId?: number;
  transactionDate: Date;
  performedBy: string;
}

export interface CreditTransactionSummaryModel {
  totalCreditsCreated: number;
  totalCreditsApplied: number;
  totalCreditsReversed: number;
  netCreditChange: number;
  transactionCount: number;
  currentBalance: number;
}

export interface CreditActivityReportModel {
  totalCreditsCreated: number;
  totalCreditsApplied: number;
  totalCreditsReversed: number;
  uniqueStudents: number;
  transactionCount: number;
  averageCreditAmount: number;
  topStudents: Array<{
    studentNumber: string;
    totalCredits: number;
    totalApplied: number;
    currentBalance: number;
  }>;
}

export interface CreditTransactionQueryParams {
  startDate?: string;
  endDate?: string;
  transactionType?: CreditTransactionType;
  performedBy?: string;
}


