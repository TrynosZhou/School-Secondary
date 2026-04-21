// src/app/finance/models/enrollment-billing-reconciliation-report.model.ts

export interface EnrollmentBillingReportFilters {
  termId: string; // Format: "num-year", e.g., "1-2024"
  classId?: string | null; // Optional: Filter by class ID (ClassesModel.id)
}

export interface EnrollmentBillingReportDetail {
  studentNumber: string;
  studentName: string;
  className: string;
  enrolledStatus: 'Enrolled' | 'Not Enrolled'; // Will primarily be 'Enrolled' for detailed rows
  invoicedStatus: 'Invoiced' | 'Not Invoiced';
  invoiceNumber?: string; // Optional, if invoiced
  balance?: number; // Optional, if invoiced
  discrepancy: boolean; // True if Enrolled but Not Invoiced
  discrepancyMessage?: string; // e.g., "Enrolled but Not Invoiced"
}

export interface EnrollmentBillingReportSummary {
  termName: string;
  className?: string; // Optional, 'All Classes' if not filtered
  totalStudentsEnrolled: number;
  totalStudentsInvoiced: number;
  totalDiscrepancies: number; // Students Enrolled but Not Invoiced
}

export interface EnrollmentBillingReportData {
  asOfDate: Date; // Date the report was generated
  summary: EnrollmentBillingReportSummary;
  details: EnrollmentBillingReportDetail[];
}
