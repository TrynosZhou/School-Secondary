export interface OutstandingStudentDetail {
  // studentId: string; // <-- REMOVE THIS LINE
  studentNumber: string; // <-- ADD THIS LINE - This is the unique identifier
  studentName: string;
  enrolName: string;
  residence: string;
  totalOutstanding: number;
}

export interface OutstandingEnrolmentSummary {
  enrolName: string;
  totalOutstanding: number;
}

export interface OutstandingResidenceSummary {
  residence: string;
  totalOutstanding: number;
}

export interface OutstandingFeesReportFilters {
  enrolmentName?: string | null; // Filter for student list drill-down
  residence?: string | null; // Filter for student list drill-down
  termId?: string | null; // Filter all data by specific term
  searchQuery?: string | null;
}

export interface OutstandingFeesReportData {
  totalOverallOutstanding: number;
  summaryByEnrolment: Map<string, number>; // Map for graph and summary table
  summaryByResidence: Map<string, number>; // Map for summary table
  studentDetails: OutstandingStudentDetail[]; // List of students with balances (possibly filtered)
}
