import { InvoiceModel } from './invoice.model';

export interface InvoiceWarning {
  message: string;
  voidedInvoiceNumber?: string;
  voidedAt?: Date;
  voidedBy?: string;
}

export interface InvoiceResponseModel {
  invoice: InvoiceModel;
  warning?: InvoiceWarning;
}



