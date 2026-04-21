// src/app/models/finance-filter.model.ts
import { PaymentMethods } from '../enums/payment-methods.enum';

export interface FinanceFilter {
  startDate?: string; // Filters by transactionDate
  endDate?: string; // Filters by transactionDate

  transactionType?: 'Invoice' | 'Payment' | string; // Filters by 'Invoice' or 'Payment'
  studentId?: string; // Filters by studentId
  studentName?: string; // For text search on studentName

  invoiceNumber?: string; // Filters by invoiceNumber
  receiptNumber?: string; // Filters by receiptNumber

  paymentMethod?: PaymentMethods; // Filters payments by method

  status?:
    | 'Paid'
    | 'Partially Paid'
    | 'Outstanding'
    | 'Overdue'
    | 'Cancelled'
    | 'Approved'
    | 'Pending'
    | string; // Filters by the unified status

  enrolAcademicYear?: string; // Filters by academic year
  enrolTerm?: string; // Filters by term
  enrolGradeLevel?: string; // Filters by grade level

  minAmount?: number; // Filters by 'amount' field
  maxAmount?: number; // Filters by 'amount' field

  // Add more as needed, e.g., servedBy
  servedBy?: string;
}
