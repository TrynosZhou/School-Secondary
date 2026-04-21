// src/app/services/finance-search.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { FinanceDataModel } from '../models/finance-data.model'; // Ensure this is the correct, updated model
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FinanceSearchService {
  private apiUrl = `${environment.apiUrl}/finance/search`; // Your backend search endpoint

  constructor(private http: HttpClient) {}

  searchFinancialEntities(query: string): Observable<FinanceDataModel[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }
    // IMPORTANT: In a real application, this HTTP GET request would
    // call your backend. The backend would handle the complex logic
    // of searching across your InvoiceModel and ReceiptModel data,
    // transforming it into FinanceDataModel, and returning the results.
    return this.http.get<FinanceDataModel[]>(
      `${this.apiUrl}?q=${query.trim()}`
    );

    // --- MOCK DATA FOR FRONTEND TESTING (REMOVE IN PRODUCTION) ---
    /*
    const MOCK_FINANCE_DATA: FinanceDataModel[] = [
      // Example Invoice
      {
        id: 'INV_DB_001',
        transactionDate: '2025-05-20',
        amount: 1500,
        type: 'Invoice',
        description: 'Term 2 Tuition Invoice for John Doe',
        studentId: 'S001',
        studentName: 'John Doe',
        invoiceNumber: 'INV-2025-001',
        invoiceDate: '2025-05-20',
        invoiceDueDate: '2025-06-20',
        invoiceTotalBill: 1500,
        invoiceBalance: 1500,
        enrolId: 'ENR_001',
        enrolAcademicYear: '2025/2026',
        enrolTerm: 'Term 2',
        enrolGradeLevel: 'Grade 10',
        status: 'Outstanding',
      },
      // Example Payment (Receipt) for the above invoice
      {
        id: 'RCPT_DB_001',
        transactionDate: '2025-06-03',
        amount: 750, // Partial payment
        type: 'Payment',
        description: 'Partial payment for Term 2 Tuition by John Doe',
        studentId: 'S001',
        studentName: 'John Doe',
        receiptNumber: 'RCPT-2025-001',
        paymentMethod: PaymentMethods.ecocash,
        receiptAmountPaid: 750,
        receiptAmountDueBeforePayment: 1500,
        receiptAmountOutstandingAfterPayment: 750,
        receiptApproved: true,
        receiptServedBy: 'Admin Staff A',
        enrolId: 'ENR_001',
        enrolAcademicYear: '2025/2026',
        enrolTerm: 'Term 2',
        enrolGradeLevel: 'Grade 10',
        status: 'Approved',
      },
      // Example Overdue Invoice for Jane Smith
      {
        id: 'INV_DB_002',
        transactionDate: '2025-04-15',
        amount: 1200,
        type: 'Invoice',
        description: 'Term 1 Balance for Jane Smith',
        studentId: 'S002',
        studentName: 'Jane Smith',
        invoiceNumber: 'INV-2025-002',
        invoiceDate: '2025-04-15',
        invoiceDueDate: '2025-05-15', // Due in the past
        invoiceTotalBill: 1200,
        invoiceBalance: 1200,
        enrolId: 'ENR_002',
        enrolAcademicYear: '2024/2025',
        enrolTerm: 'Term 1',
        enrolGradeLevel: 'Grade 7',
        status: 'Overdue',
      },
      // Example cash payment
      {
        id: 'RCPT_DB_002',
        transactionDate: '2025-06-01',
        amount: 200,
        type: 'Payment',
        description: 'Cash payment for school supplies',
        studentId: 'S003',
        studentName: 'Peter Jones',
        receiptNumber: 'RCPT-2025-002',
        paymentMethod: PaymentMethods.cash,
        receiptAmountPaid: 200,
        receiptApproved: true,
        receiptServedBy: 'Admin Staff B',
        enrolId: 'ENR_003',
        enrolAcademicYear: '2025/2026',
        enrolTerm: 'Term 2',
        enrolGradeLevel: 'Grade 5',
        status: 'Approved',
      },
    ];

    const lowerCaseQuery = query.toLowerCase();
    const results = MOCK_FINANCE_DATA.filter(entity =>
        (entity.studentName?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.invoiceNumber?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.receiptNumber?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.description?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.studentId?.toLowerCase().includes(lowerCaseQuery))
    );
    return of(results);
    */
    // --- END MOCK DATA ---
  }
}
