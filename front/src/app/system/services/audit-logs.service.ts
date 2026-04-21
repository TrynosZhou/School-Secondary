import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  performedBy: string;
  timestamp: Date;
  ipAddress?: string;
  changes?: Record<string, any>;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

export enum AuditAction {
  INVOICE_CREATED = 'INVOICE_CREATED',
  INVOICE_UPDATED = 'INVOICE_UPDATED',
  INVOICE_VOIDED = 'INVOICE_VOIDED',
  RECEIPT_CREATED = 'RECEIPT_CREATED',
  RECEIPT_VOIDED = 'RECEIPT_VOIDED',
  CREDIT_CREATED = 'CREDIT_CREATED',
  CREDIT_APPLIED = 'CREDIT_APPLIED',
}

export enum AuditEntityType {
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  CREDIT = 'CREDIT',
}

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: number;
  performedBy?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogsService {
  private apiUrl = `${environment.apiUrl}/system/audit`;

  constructor(private http: HttpClient) {}

  getAuditLogs(filters?: AuditLogFilters): Observable<AuditLogsResponse> {
    let params = new HttpParams();

    if (filters?.action) {
      params = params.set('action', filters.action);
    }

    if (filters?.entityType) {
      params = params.set('entityType', filters.entityType);
    }

    if (filters?.entityId) {
      params = params.set('entityId', filters.entityId.toString());
    }

    if (filters?.performedBy) {
      params = params.set('performedBy', filters.performedBy);
    }

    if (filters?.startDate) {
      params = params.set('startDate', filters.startDate);
    }

    if (filters?.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    if (filters?.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    if (filters?.offset) {
      params = params.set('offset', filters.offset.toString());
    }

    return this.http.get<AuditLogsResponse>(this.apiUrl, { params });
  }
}

