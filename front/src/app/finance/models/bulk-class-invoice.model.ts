export interface BulkClassInvoiceRequest {
  dryRun?: boolean;
  termId?: number;
}

export interface BulkClassInvoiceStudentResult {
  studentNumber: string;
  studentName?: string;
  success: boolean;
  invoiceNumber?: string;
  termType?: 'regular' | 'vacation';
  residence?: string;
  error?: string;
}

export interface BulkClassInvoiceResponse {
  className: string;
  termNum: number;
  year: number;
  termType: 'regular' | 'vacation';
  totalStudents: number;
  successCount: number;
  failureCount: number;
  results: BulkClassInvoiceStudentResult[];
}
