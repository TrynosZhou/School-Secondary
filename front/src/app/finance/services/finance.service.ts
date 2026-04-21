import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FeesModel } from '../models/fees.model';
import { StudentsModel } from 'src/app/registration/models/students.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';
import { InvoiceModel } from '../models/invoice.model';
import { BalancesModel } from '../models/balances.model';
import { EnrolService } from 'src/app/enrolment/services/enrol.service';
import { BillModel } from '../models/bill.model';
import { FinanceDataModel } from 'src/app/finance/models/finance-data.model';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  baseURL = `${environment.apiUrl}/finance/`;

  constructor(private httpClient: HttpClient) {}

  getAllFees(): Observable<FeesModel[]> {
    return this.httpClient.get<FeesModel[]>(`${this.baseURL}fees/`);
  }

  createFee(fee: FeesModel): Observable<FeesModel> {
    return this.httpClient.post<FeesModel>(`${this.baseURL}fees/`, fee);
  }

  editFees(id: number, fee: FeesModel): Observable<FeesModel> {
    return this.httpClient.patch<FeesModel>(`${this.baseURL}fees/${id}`, fee);
  }

  deleteFees(id: number): Observable<number> {
    // console.log(id);
    return this.httpClient.delete<number>(`${this.baseURL}fees/${id}`);
  }

  createBills(bills: BillModel[]): Observable<BillModel[]> {
    // console.log('adding these bills', bills);
    return this.httpClient.post<BillModel[]>(`${this.baseURL}billing`, bills);
  }

  removeBill(bill: BillModel): Observable<BillModel> {
    // console.log('removing these bills ', bill);
    return this.httpClient.delete<BillModel>(
      `${this.baseURL}billing/${bill.id}`
    );
  }

  getStudentsNotYetBilledForTerm(
    num: number,
    year: number,
    termId?: number
  ): Observable<EnrolsModel[]> {
    return this.httpClient.get<EnrolsModel[]>(
      `${this.baseURL}billing/tobill/${num}/${year}${termId ? `?termId=${termId}` : ''}`
    );
  }

  createFeesBalance(balance: BalancesModel): Observable<BalancesModel> {
    return this.httpClient.post<BalancesModel>(
      `${this.baseURL}fees/balance/`,
      balance
    );
  }

  /**
   * Searches for financial entities based on a query string.
   * This method will make an API call to your backend.
   * @param query The search string (e.g., student name, invoice number, description).
   * @returns An Observable of an array of FinanceDataModel.
   */
  searchFinancialEntities(query: string): Observable<FinanceDataModel[]> {
    if (!query || query.trim() === '') {
      return of([]); // Return empty array if query is empty
    }
    // Make an HTTP GET request to your backend search endpoint
    // The backend should implement logic to search across various financial entities
    return this.httpClient.get<FinanceDataModel[]>(
      `${this.baseURL}?q=${query.trim()}`
    );

    // --- MOCK DATA FOR TESTING (REMOVE IN PRODUCTION) ---
    /*
    const MOCK_DATA: FinanceDataModel[] = [
      { id: 'TXN001', date: '2025-05-20', amount: 1500, type: 'Invoice', category: 'Tuition Fees', description: 'Term 2 Tuition', studentId: 'S001', studentName: 'John Doe', invoiceId: 'INV001', status: 'Pending' },
      { id: 'TXN002', date: '2025-05-22', amount: 500, type: 'Payment', category: 'Tuition Fees', description: 'Partial payment', studentId: 'S001', invoiceId: 'INV001', status: 'Paid', paymentMethod: 'Ecocash' },
      { id: 'TXN003', date: '2025-05-25', amount: 250, type: 'Expense', category: 'Supplies', description: 'Art supplies purchase', staffId: 'STF005', status: 'Paid' },
      { id: 'TXN004', date: '2025-05-28', amount: 3000, type: 'Revenue', category: 'Donations', description: 'Annual fund donation', status: 'Paid' },
      { id: 'TXN005', date: '2025-06-01', amount: 1200, type: 'Invoice', category: 'Uniform Sales', description: 'New uniform set', studentId: 'S002', studentName: 'Jane Smith', invoiceId: 'INV002', status: 'Overdue' },
    ];

    const lowerCaseQuery = query.toLowerCase();
    const results = MOCK_DATA.filter(entity =>
        (entity.studentName?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.invoiceId?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.description?.toLowerCase().includes(lowerCaseQuery)) ||
        (entity.id?.toLowerCase().includes(lowerCaseQuery))
    );
    return of(results);
    */
    // --- END MOCK DATA ---
  }
}
