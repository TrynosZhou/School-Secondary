import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export type IncidentType =
  | 'lost_book'
  | 'damaged_book'
  | 'broken_furniture'
  | 'broken_window'
  | 'broken_lab_utensil'
  | 'other';

export type IncidentStatus =
  | 'submitted'
  | 'hod_confirmed'
  | 'deputy_signed'
  | 'head_signed'
  | 'accepted'
  | 'rejected';

export interface ChargeableIncident {
  id: string;
  createdAt: string;
  updatedAt: string;
  type: IncidentType;
  departmentId: string;
  roomId?: string | null;
  reportedByTeacherId: string;
  studentNumber?: string | null;
  description: string;
  replacementCost: number;
  status: IncidentStatus;
  rejectionReason?: string | null;
  hodConfirmedAt?: string | null;
  deputySignedAt?: string | null;
  headSignedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  department?: { id: string; name: string };
  room?: { id: string; name: string; code?: string | null };
  reportedBy?: { id: string; name: string; surname: string };
}

@Injectable({ providedIn: 'root' })
export class IncidentsApiService {
  private readonly baseUrl = `${environment.apiUrl}/incidents`;

  constructor(private readonly http: HttpClient) {}

  createIncident(payload: {
    type: IncidentType;
    description: string;
    replacementCost: number;
    studentNumber?: string | null;
    roomId?: string | null;
    textbookCopyId?: string | null;
    inventoryItemId?: string | null;
  }): Observable<ChargeableIncident> {
    return this.http.post<ChargeableIncident>(this.baseUrl, payload);
  }

  getMyIncidents(): Observable<ChargeableIncident[]> {
    return this.http.get<ChargeableIncident[]>(`${this.baseUrl}/mine`);
  }

  getPendingApproval(): Observable<ChargeableIncident[]> {
    return this.http.get<ChargeableIncident[]>(`${this.baseUrl}/pending-approval`);
  }

  confirmHod(id: string): Observable<ChargeableIncident> {
    return this.http.post<ChargeableIncident>(`${this.baseUrl}/${id}/confirm-hod`, {});
  }

  signDeputy(id: string): Observable<ChargeableIncident> {
    return this.http.post<ChargeableIncident>(`${this.baseUrl}/${id}/sign-deputy`, {});
  }

  signHead(id: string): Observable<ChargeableIncident> {
    return this.http.post<ChargeableIncident>(`${this.baseUrl}/${id}/sign-head`, {});
  }

  accept(id: string): Observable<ChargeableIncident> {
    return this.http.post<ChargeableIncident>(`${this.baseUrl}/${id}/accept`, {});
  }

  reject(id: string, reason: string): Observable<ChargeableIncident> {
    return this.http.post<ChargeableIncident>(`${this.baseUrl}/${id}/reject`, { reason });
  }
}

