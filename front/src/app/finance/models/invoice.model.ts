import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { BillModel } from './bill.model';
import { BalancesModel } from './balances.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { InvoiceStatus } from '../enums/invoice-status.enum';
import { ReceiptInvoiceAllocationsModel } from './receipt-invoice-allocations.model';
import { CreditInvoiceAllocationModel } from './credit-invoice-allocation.model';
import { ExemptionModel } from './exemption.model';

export interface InvoiceModel {
  id: number;
  totalBill: number; // total of all bills (the total amount the student is being billed for this invoice)
  balanceBfwd: BalancesModel; //balance Bfwd if available
  student: StudentsModel;
  bills: BillModel[];
  balance: number; //'amount remaining to be paid' for THIS invoice
  enrol: EnrolsModel;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceDueDate: Date;
  allocations: ReceiptInvoiceAllocationsModel[];
  creditAllocations?: CreditInvoiceAllocationModel[]; // Credit allocations (overpayments applied to invoices)
  // NEW: Fields for tracking payments and status specific to THIS invoice
  amountPaidOnInvoice: number; // Tracks how much has been paid directly towards THIS invoice
  status: InvoiceStatus; // The current status of THIS invoice
  exemptedAmount?: number;

  // NEW: Exemption property
  exemption?: ExemptionModel; // An invoice might have an associated exemption, make it optional

  // Fields for voiding - invoices should NOT be deleted, only voided
  isVoided?: boolean;
  voidedAt?: Date;
  voidedBy?: string; // E.g., email or ID of the user who voided it

  // Legacy flag for historical invoices that may have data inconsistencies
  isLegacy?: boolean;
}
