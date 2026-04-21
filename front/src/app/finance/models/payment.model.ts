import { StudentsModel } from 'src/app/registration/models/students.model';
import { PaymentMethods } from '../enums/payment-methods.enum';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { ReceiptInvoiceAllocationsModel } from './receipt-invoice-allocations.model';

export interface ReceiptModel {
  id: number;
  receiptNumber: string;
  receiptBookNumber?: string;
  student: StudentsModel;
  amountPaid: number;
  description: string;
  paymentDate: Date;
  paymentMethod: PaymentMethods;
  approved: boolean;
  servedBy: string;
  enrol: EnrolsModel;
  allocations: ReceiptInvoiceAllocationsModel[];
  // --- NEW PROPERTIES FOR VOIDING ---
  isVoided: boolean; // Indicates if the receipt has been voided
  voidedBy?: string; // Email of the user who voided the receipt
  voidedAt?: Date; // Timestamp when the receipt was voided
}
