import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export enum IntegrationType {
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  SMS_SERVICE = 'SMS_SERVICE',
  CLOUD_STORAGE = 'CLOUD_STORAGE',
  ACCOUNTING_SOFTWARE = 'ACCOUNTING_SOFTWARE',
  PARENT_COMMUNICATION = 'PARENT_COMMUNICATION',
  LEARNING_MANAGEMENT = 'LEARNING_MANAGEMENT',
  OTHER = 'OTHER',
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

export interface Integration {
  id?: string;
  type: IntegrationType;
  name: string;
  description?: string;
  status: IntegrationStatus;
  configuration?: {
    apiKey?: string;
    apiSecret?: string;
    baseUrl?: string;
    webhookUrl?: string;
    [key: string]: any;
  };
  isTestMode?: boolean;
  lastSyncAt?: Date;
  lastError?: string;
  lastErrorAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateIntegrationDto {
  type: IntegrationType;
  name: string;
  description?: string;
  configuration?: Record<string, any>;
  isTestMode?: boolean;
}

export interface UpdateIntegrationDto {
  name?: string;
  description?: string;
  status?: IntegrationStatus;
  configuration?: Record<string, any>;
  isTestMode?: boolean;
}

export interface IntegrationStatusSummary {
  total: number;
  active: number;
  inactive: number;
  error: number;
  byType: Record<string, number>;
}

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private apiUrl = `${environment.apiUrl}/system/integrations`;

  constructor(private http: HttpClient) {}

  getAllIntegrations(): Observable<Integration[]> {
    return this.http.get<Integration[]>(this.apiUrl);
  }

  getIntegrationStatusSummary(): Observable<IntegrationStatusSummary> {
    return this.http.get<IntegrationStatusSummary>(`${this.apiUrl}/summary`);
  }

  getIntegrationsByType(type: IntegrationType): Observable<Integration[]> {
    return this.http.get<Integration[]>(`${this.apiUrl}/type/${type}`);
  }

  getIntegrationById(id: string): Observable<Integration> {
    return this.http.get<Integration>(`${this.apiUrl}/${id}`);
  }

  createIntegration(createDto: CreateIntegrationDto): Observable<Integration> {
    return this.http.post<Integration>(this.apiUrl, createDto);
  }

  updateIntegration(id: string, updateDto: UpdateIntegrationDto): Observable<Integration> {
    return this.http.put<Integration>(`${this.apiUrl}/${id}`, updateDto);
  }

  deleteIntegration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  testIntegration(id: string): Observable<{ success: boolean; message: string; details?: any }> {
    return this.http.post<{ success: boolean; message: string; details?: any }>(
      `${this.apiUrl}/${id}/test`,
      {},
    );
  }
}

