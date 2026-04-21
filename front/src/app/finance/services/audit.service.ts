import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ReceiptModel } from '../models/payment.model';
import { InvoiceModel } from '../models/invoice.model';

/**
 * Service for accessing audit data including voided records
 * This service provides access to all financial records including voided ones
 * for audit, reporting, and compliance purposes.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  baseURL = `${environment.apiUrl}/payment/`;

  constructor(private httpClient: HttpClient) {}

  // Receipt Audit Endpoints
  /**
   * Get all receipts including voided ones (for audit)
   */
  getAllReceiptsForAudit(): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(
      `${this.baseURL}receipt/audit/all`,
    );
  }

  /**
   * Get all receipts for a student including voided ones (for audit)
   * @param studentNumber - The student number
   */
  getStudentReceiptsForAudit(
    studentNumber: string,
  ): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(
      `${this.baseURL}receipt/audit/student/${studentNumber}`,
    );
  }

  // Invoice Audit Endpoints
  /**
   * Get all invoices including voided ones (for audit)
   */
  getAllInvoicesForAudit(): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/audit/all`,
    );
  }

  /**
   * Get all invoices for a student including voided ones (for audit)
   * @param studentNumber - The student number
   */
  getStudentInvoicesForAudit(
    studentNumber: string,
  ): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/audit/student/${studentNumber}`,
    );
  }

  /**
   * Get all invoices for a term including voided ones (for audit)
   * @param num - Term number
   * @param year - Term year
   */
  getTermInvoicesForAudit(
    num: number,
    year: number,
  ): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/audit/term/${num}/${year}`,
    );
  }

  /**
   * Get a receipt by receipt number, optionally including voided
   * @param receiptNumber - The receipt number
   * @param includeVoided - Whether to include voided receipts
   */
  getReceiptByReceiptNumber(
    receiptNumber: string,
    includeVoided: boolean = false,
  ): Observable<ReceiptModel> {
    const params = includeVoided ? { includeVoided: 'true' } : {};
    return this.httpClient.get<ReceiptModel>(
      `${this.baseURL}receipt/${receiptNumber}`,
      { params },
    );
  }

  /**
   * Get an invoice by student, term, and year, optionally including voided
   * @param studentNumber - The student number
   * @param num - Term number
   * @param year - Term year
   * @param includeVoided - Whether to include voided invoices
   */
  getInvoice(
    studentNumber: string,
    num: number,
    year: number,
    includeVoided: boolean = false,
  ): Observable<InvoiceModel> {
    const params = includeVoided ? { includeVoided: 'true' } : {};
    return this.httpClient.get<InvoiceModel>(
      `${this.baseURL}invoice/${studentNumber}/${num}/${year}`,
      { params },
    );
  }
}


