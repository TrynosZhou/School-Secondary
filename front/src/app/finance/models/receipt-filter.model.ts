import { PaymentMethods } from '../enums/payment-methods.enum'; // Assuming you have this enum

export interface ReceiptFilter {
  startDate?: Date | null;
  endDate?: Date | null;
  studentNumber?: string | null; // Or number, depending on your student ID type
  minAmount?: number | null;
  maxAmount?: number | null;
  paymentMethods?: PaymentMethods[];
  approved?: boolean | null; // Null means "any", true means "approved", false means "not approved"
  servedBy?: string | null; // User who recorded the payment
}
