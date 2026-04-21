import { HttpClient, HttpResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, timeout, catchError, throwError } from 'rxjs';
import { InvoiceModel } from '../models/invoice.model';
import { InvoiceResponseModel } from '../models/invoice-response.model';
import { environment } from 'src/environments/environment';
import { InvoiceStatsModel } from '../models/invoice-stats.model';
import { ReceiptModel } from '../models/payment.model';
import { PaymentMethods } from '../enums/payment-methods.enum';
import {
  CreditTransactionModel,
  CreditTransactionSummaryModel,
  CreditActivityReportModel,
  CreditTransactionQueryParams,
} from '../models/credit-transaction.model';
import {
  FinanceDashboardSummary,
  FinanceDashboardSummaryFilters,
} from '../models/finance-dashboard-summary.model';
import {
  BulkClassInvoiceRequest,
  BulkClassInvoiceResponse,
} from '../models/bulk-class-invoice.model';

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  baseURL = `${environment.apiUrl}/payment/`;

  constructor(private httpClient: HttpClient) {}
  getInvoice(
    studentNumber: string,
    num: number,
    year: number
  ): Observable<InvoiceResponseModel> {
    return this.httpClient
      .get<InvoiceResponseModel>(
        `${this.baseURL}invoice/${studentNumber}/${num}/${year}`
      )
      .pipe(
        timeout(30000), // 30 second timeout
        map((response) => {
          // Ensure balanceBfwd and its amount exist and convert if it's a string
          if (
            response.invoice.balanceBfwd &&
            typeof response.invoice.balanceBfwd.amount === 'string'
          ) {
            response.invoice.balanceBfwd.amount = parseFloat(
              response.invoice.balanceBfwd.amount
            );
          }
          // Apply similar conversions for other numeric fields if needed
          // ...
          return response;
        }),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }

  getInvoiceStats(num: number, year: number): Observable<InvoiceStatsModel[]> {
    return this.httpClient.get<InvoiceStatsModel[]>(
      `${this.baseURL}invoice/stats/${num}/${year}`
    );
  }

  getTermInvoices(num: number, year: number): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/${num}/${year}`
    );
  }

  getAllInvoices(): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(`${this.baseURL}invoice/`);
  }

  /**
   * Paginated invoices for dashboard/list views.
   */
  getDashboardInvoices(
    page = 1,
    limit = 100,
  ): Observable<{ items: InvoiceModel[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<{ items: InvoiceModel[]; total: number }>(
      `${this.baseURL}dashboard/invoices`,
      { params },
    );
  }

  saveInvoice(invoice: InvoiceModel): Observable<InvoiceModel> {
    try {
      const payload = this.normalizeInvoice(invoice);

      return this.httpClient.post<InvoiceModel>(
        `${this.baseURL}invoice`,
        payload
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  bulkInvoiceClass(
    className: string,
    num: number,
    year: number,
    request: BulkClassInvoiceRequest = {}
  ): Observable<BulkClassInvoiceResponse> {
    const encodedClassName = encodeURIComponent(className);
    return this.httpClient.post<BulkClassInvoiceResponse>(
      `${this.baseURL}invoice/bulk/class/${encodedClassName}/${num}/${year}`,
      request
    );
  }
  downloadInvoice(invoiceNumber: string): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(
      `${this.baseURL}invoicepdf/${invoiceNumber}`, // Use baseURL + specific endpoint
      {
        responseType: 'blob',
        observe: 'response', // <--- Crucial change: observe the full response
      }
    );
  }

  getStudentOutstandingBalance(
    studentNumber: string
  ): Observable<{ amountDue: number }> {
    return this.httpClient.get<{ amountDue: number }>(
      `${this.baseURL}studentBalance/${studentNumber}`
    );
  }

  /**
   * Finance dashboard summary for cards and chart (optional filters).
   */
  getFinanceDashboardSummary(
    filters?: FinanceDashboardSummaryFilters
  ): Observable<FinanceDashboardSummary> {
    let params = new HttpParams();
    if (filters) {
      if (filters.startDate) params = params.set('startDate', filters.startDate);
      if (filters.endDate) params = params.set('endDate', filters.endDate);
      if (filters.enrolTerm) params = params.set('enrolTerm', filters.enrolTerm);
      if (filters.transactionType) params = params.set('transactionType', filters.transactionType);
    }
    return this.httpClient.get<FinanceDashboardSummary>(
      `${this.baseURL}dashboard/summary`,
      { params }
    );
  }

  getAllReceipts(): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(`${this.baseURL}receipt/`);
  }

  /**
   * Paginated receipts for dashboard/list views.
   */
  getDashboardReceipts(
    page = 1,
    limit = 100,
  ): Observable<{ items: ReceiptModel[]; total: number }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<{ items: ReceiptModel[]; total: number }>(
      `${this.baseURL}dashboard/receipts`,
      { params },
    );
  }

  saveReceipt(
    studentNumber: string,
    amountPaid: number,
    paymentMethod: PaymentMethods,
    description?: string
  ): Observable<ReceiptModel> {
    return this.httpClient.post<ReceiptModel>(`${this.baseURL}receipt/`, {
      studentNumber,
      amountPaid,
      paymentMethod,
      description,
    });
  }

  downloadReceipt(receiptNumber: string): Observable<HttpResponse<Blob>> {
    return this.httpClient.get(
      `${this.baseURL}receiptpdf/${receiptNumber}`, // Use baseURL + specific endpoint
      {
        responseType: 'blob',
        observe: 'response', // <--- Crucial change: observe the full response
      }
    );
  }

  getStudentInvoices(studentNumber: string): Observable<InvoiceModel[]> {
    return this.httpClient.get<InvoiceModel[]>(
      `${this.baseURL}invoice/${studentNumber}`
    );
  }

  getStudentReceipts(studentNumber: string): Observable<ReceiptModel[]> {
    return this.httpClient.get<ReceiptModel[]>(
      `${this.baseURL}receipt/student/${studentNumber}`
    );
  }

  voidReceipt(receiptId: number): Observable<ReceiptModel> {
    return this.httpClient.patch<ReceiptModel>(
      `${this.baseURL}receipt/void/${receiptId}`,
      {}
    );
  }

  voidInvoice(invoiceId: number): Observable<InvoiceModel> {
    return this.httpClient.patch<InvoiceModel>(
      `${this.baseURL}invoice/void/${invoiceId}`,
      {}
    );
  }

  // Credit Transaction History
  getCreditTransactions(
    studentNumber: string,
    query?: CreditTransactionQueryParams,
  ): Observable<CreditTransactionModel[]> {
    let params = new HttpParams();
    if (query?.startDate) {
      params = params.set('startDate', query.startDate);
    }
    if (query?.endDate) {
      params = params.set('endDate', query.endDate);
    }
    if (query?.transactionType) {
      params = params.set('transactionType', query.transactionType);
    }
    if (query?.performedBy) {
      params = params.set('performedBy', query.performedBy);
    }

    return this.httpClient.get<CreditTransactionModel[]>(
      `${this.baseURL}credit-transactions/${studentNumber}`,
      { params },
    );
  }

  getCreditTransactionSummary(
    studentNumber: string,
    startDate?: string,
    endDate?: string,
  ): Observable<CreditTransactionSummaryModel> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.httpClient.get<CreditTransactionSummaryModel>(
      `${this.baseURL}credit-transactions/${studentNumber}/summary`,
      { params },
    );
  }

  getCreditActivityReport(
    startDate?: string,
    endDate?: string,
  ): Observable<CreditActivityReportModel> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.httpClient.get<CreditActivityReportModel>(
      `${this.baseURL}credit-activity-report`,
      { params },
    );
  }

  private normalizeInvoice(invoice: InvoiceModel): InvoiceModel {
    if (!invoice.student?.studentNumber) {
      throw new Error(
        'Invoice is missing student information. Please select a student and try again.'
      );
    }

    if (!invoice.enrol?.id) {
      throw new Error(
        'Invoice is missing enrolment information. Please select a class/term and try again.'
      );
    }

    if (!invoice.bills || invoice.bills.length === 0) {
      throw new Error(
        'Invoice must have at least one bill. Please add fees before saving.'
      );
    }

    const normalizedBills =
      invoice.bills?.map((bill, index) => {
        if (!bill.fees || bill.fees.amount === undefined || bill.fees.amount === null) {
          throw new Error(
            `Bill #${index + 1} is missing fee details. Please ensure every fee has an amount.`
          );
        }

        const student = bill.student || invoice.student;
        if (!student?.studentNumber) {
          throw new Error(`Bill #${index + 1} is missing student information.`);
        }

        const enrol = bill.enrol || invoice.enrol;
        if (!enrol?.id) {
          throw new Error(`Bill #${index + 1} is missing enrolment information.`);
        }

        return {
          ...bill,
          student,
          enrol,
          fees: bill.fees,
        };
      }) || [];

    return {
      ...invoice,
      student: invoice.student,
      enrol: invoice.enrol,
      bills: normalizedBills,
    };
  }
}
