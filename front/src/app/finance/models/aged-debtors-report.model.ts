// src/app/finance/models/aged-debtors-report.model.ts

export interface AgedDebtorsReportFilters {
  asOfDate: Date; // The date to calculate ageing from (defaults to today)
  termId: string | null; // Format: "num-year", e.g., "1-2024" (for TermsModel mapping)
  enrolmentName?: string | null; // Optional: for drilling down into a specific class (maps to ClassesModel.name and EnrolsModel.name)
  studentNumber?: string | null; // Optional: for drilling down into a specific student (StudentsModel.studentNumber)
}

export interface AgedInvoiceSummary {
  invoiceId: number;
  invoiceNumber: string;
  studentName: string; // Derived from StudentsModel.name and StudentsModel.surname
  studentNumber: string; // Unique identifier for the student
  className: string; // Directly from EnrolsModel.name (which maps to ClassesModel.name)
  termName: string; // Derived from EnrolsModel.num and EnrolsModel.year
  invoiceDate: Date;
  dueDate: Date;
  originalAmount: number;
  currentBalance: number;
  daysOverdue: number; // Negative for not yet due, positive for overdue
  statusBucket:
    | 'Current'
    | '1-30 Days'
    | '31-60 Days'
    | '61-90 Days'
    | '90+ Days';
}

export interface AgedDebtorsReportData {
  asOfDate: Date;
  totalOutstanding: number;
  current: number;
  due1_30Days: number;
  due31_60Days: number;
  due61_90Days: number;
  due90PlusDays: number;
  detailedInvoices: AgedInvoiceSummary[];
}
