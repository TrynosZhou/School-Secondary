import { InvoiceModel } from './invoice.model';

export interface ReceiptInvoiceAllocationsModel {
  id: number;
  receiptId: number;
  invoiceId?: number; // Optional: invoice ID for lookups when invoice relation isn't loaded
  invoice: InvoiceModel;
  amountApplied: number;
  allocationDate: Date;
}
