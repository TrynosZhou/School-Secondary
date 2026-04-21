import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface InvoiceCharge {
  id: string;
  createdAt: string;
  studentNumber: string;
  enrolId: number;
  invoiceId?: number | null;
  amount: number;
  description: string;
  sourceType?: string | null;
  sourceId?: string | null;
  status: 'pending_invoicing' | 'invoiced' | 'voided';
  isVoided: boolean;
}

@Injectable({ providedIn: 'root' })
export class InvoiceChargesApiService {
  private readonly baseUrl = `${environment.apiUrl}/payment`;

  constructor(private readonly http: HttpClient) {}

  // Re-uses existing invoice endpoint response which now includes pendingCharges.
  getPendingChargesForInvoice(studentNumber: string, termNum: number, year: number): Observable<{ pendingCharges?: InvoiceCharge[]; warning?: { message: string } }> {
    return this.http.get<{ pendingCharges?: InvoiceCharge[]; warning?: { message: string } }>(
      `${this.baseUrl}/invoice/${studentNumber}/${termNum}/${year}`,
    );
  }
}

