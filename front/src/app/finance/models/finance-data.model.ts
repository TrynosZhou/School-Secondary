// src/app/models/finance-data.model.ts

import { PaymentMethods } from '../enums/payment-methods.enum'; // Assuming this is your PaymentMethods enum

export interface FinanceDataModel {
  // --- Core / Common Fields (from our previous definition) ---
  id: string; // Unique ID for THIS specific dashboard entry (could be invoice.invoiceNumber or receipt.receiptNumber, or a synthetic ID)
  transactionDate: Date; // ISO string 'YYYY-MM-DD' - this will be invoiceDate or paymentDate
  amount: number; // The main amount to display: invoice.totalBill or receipt.amountPaid
  type: 'Invoice' | 'Payment'; // Explicitly 'Invoice' or 'Payment' for dashboard clarity
  description: string; // A human-readable summary of the transaction
  date: Date; // The actual date of the transaction

  // --- Student-Related Fields (from StudentsModel via Invoice/Receipt) ---
  studentId: string; // student.studentNumber
  studentName: string; // Derived from student.name + student.surname

  // --- Invoice-Specific Details ---
  invoiceNumber?: string; // invoiceModel.invoiceNumber (present if type is 'Invoice')
  invoiceDate?: Date; // invoiceModel.invoiceDate (ISO string)
  invoiceDueDate?: Date; // invoiceModel.invoiceDueDate (ISO string)
  invoiceTotalBill?: number; // invoiceModel.totalBill (if type is 'Invoice')
  invoiceBalance?: number; // invoiceModel.balance (if type is 'Invoice')
  invoiceIsVoided?: boolean; // invoiceModel.isVoided (if type is 'Invoice')

  // --- Receipt-Specific Details ---
  receiptNumber?: string; // receiptModel.receiptNumber (present if type is 'Payment')
  paymentMethod?: PaymentMethods; // receiptModel.paymentMethod (if type is 'Payment')
  receiptAmountPaid?: number; // receiptModel.amountPaid (if type is 'Payment')
  // receiptAmountDueBeforePayment?: number; // receiptModel.amountDue (if type is 'Payment')
  // receiptAmountOutstandingAfterPayment?: number; // receiptModel.amountOutstanding (if type is 'Payment')
  receiptApproved?: boolean; // receiptModel.approved (if type is 'Payment')
  receiptServedBy?: string; // receiptModel.servedBy (if type is 'Payment')

  // --- Enrolment Context (important for billing periods) ---
  enrolId?: number; // enrol.id (if available and relevant for dashboard grouping)
  enrolAcademicYear?: number; // Derived from enrol.academicYear (e.g., 2025/2026)
  enrolTerm?: string; // Derived from enrol.num and enrol.year (e.g., Term 1, Term 2)
  enrolClass?: string; // Derived from enrol.name (e.g., 2 Blue)

  // --- Status Field (derived for dashboard) ---
  status:
    | 'Paid'
    | 'Partially Paid'
    | 'Outstanding'
    | 'Overdue'
    | 'Cancelled'
    | 'Approved'
    | 'Pending'
    | string; // Unified status for dashboard view

  // --- Optional: Link to original Bill/Fees if relevant for drill-down ---
  // billId?: string; // If you want to link directly to a specific bill for an invoice line item
  // feeName?: FeesNames; // If you want to categorize by specific fees (e.g., Tuition, Sports)
}
