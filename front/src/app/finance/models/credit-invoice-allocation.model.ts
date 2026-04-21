export interface CreditInvoiceAllocationModel {
  id: number;
  invoice: {
    id: number;
    invoiceNumber: string;
  } | null; // Can be null if invoice was deleted
  amountApplied: number;
  allocationDate: Date;
}

