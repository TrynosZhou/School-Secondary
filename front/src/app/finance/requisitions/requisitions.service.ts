import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RequisitionItem {
  id?: string;
  description: string;
  quantity: number;
  intendedUse?: string;
  receivedQuantity?: number;
}

export interface Requisition {
  id: string;
  title: string;
  description?: string;
  status: string;
  createdAt: string;
  receivedAt?: string | null;
  department?: { id: string; name: string };
  createdBy?: { id: string; name: string; surname: string };
  items: RequisitionItem[];
}

export interface CreateRequisitionPayload {
  title: string;
  description?: string;
  items: RequisitionItem[];
}

@Injectable({
  providedIn: 'root',
})
export class RequisitionsService {
  private baseUrl = `${environment.apiUrl}/requisitions`;

  constructor(private httpClient: HttpClient) {}

  getMyRequisitions(): Observable<Requisition[]> {
    return this.httpClient.get<Requisition[]>(`${this.baseUrl}/mine`);
  }

  getPendingReceiving(): Observable<Requisition[]> {
    return this.httpClient.get<Requisition[]>(`${this.baseUrl}/pending-receiving`);
  }

  getAllRequisitions(): Observable<Requisition[]> {
    return this.httpClient.get<Requisition[]>(this.baseUrl);
  }

  getRequisitionById(id: string): Observable<Requisition> {
    return this.httpClient.get<Requisition>(`${this.baseUrl}/${id}`);
  }

  createRequisition(payload: CreateRequisitionPayload): Observable<Requisition> {
    return this.httpClient.post<Requisition>(this.baseUrl, payload);
  }

  signAsDeputy(id: string): Observable<Requisition> {
    return this.httpClient.post<Requisition>(
      `${this.baseUrl}/${id}/sign/deputy`,
      {},
    );
  }

  signAsHead(id: string): Observable<Requisition> {
    return this.httpClient.post<Requisition>(
      `${this.baseUrl}/${id}/sign/head`,
      {},
    );
  }

  authorise(id: string): Observable<Requisition> {
    return this.httpClient.post<Requisition>(
      `${this.baseUrl}/${id}/authorise`,
      {},
    );
  }

  reject(id: string, reason: string): Observable<Requisition> {
    return this.httpClient.post<Requisition>(`${this.baseUrl}/${id}/reject`, {
      reason,
    });
  }
}

