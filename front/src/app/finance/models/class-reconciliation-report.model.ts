export interface ClassReconciliationSummary {
  invoicesProcessed: number;
  invoicesCorrected: number;
  receiptsProcessed: number;
  voidedInvoicesUnlinked: number;
  creditApplied: boolean;
  creditAmount?: number;
  creditAppliedToInvoice?: string;
  invoicesWithBalance: number;
  totalCreditBalance: number;
}

export interface ClassReconciliationResultItem {
  studentNumber: string;
  studentName?: string;
  success: boolean;
  error?: string;
  reconciliationSummary?: ClassReconciliationSummary;
}

export interface ClassReconciliationReport {
  className: string;
  termNum: number;
  year: number;
  totalStudents: number;
  succeeded: number;
  failed: number;
  results: ClassReconciliationResultItem[];
}
