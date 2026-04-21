import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface EnrollmentAnalytics {
  totalStudents: number;
  activeEnrollments: number;
  enrollmentsByTerm: Array<{ term: string; count: number }>;
  enrollmentsByClass: Array<{ className: string; count: number }>;
  newStudentsThisYear: number;
  studentsByGender: Array<{ gender: string; count: number }>;
}

export interface FinancialAnalytics {
  totalRevenue: number;
  totalOutstanding: number;
  totalInvoiced: number;
  revenueByMonth: Array<{ month: string; amount: number }>;
  paymentsByMethod: Array<{ method: string; amount: number; count: number }>;
  outstandingByClass: Array<{ className: string; amount: number }>;
  collectionRate: number;
}

export interface AcademicAnalytics {
  totalReports: number;
  averagePerformance: number;
  passRate: number;
  topPerformingClasses: Array<{ className: string; average: number }>;
  subjectPerformance: Array<{ subject: string; average: number }>;
  reportsByTerm: Array<{ term: string; count: number }>;
}

export interface UserActivityAnalytics {
  totalUsers: number;
  usersByRole: Array<{ role: string; count: number }>;
  activeUsers: number;
  recentActivity: Array<{ action: string; count: number; date: string }>;
}

export interface SystemAnalytics {
  totalAuditLogs: number;
  auditLogsByAction: Array<{ action: string; count: number }>;
  auditLogsByEntity: Array<{ entityType: string; count: number }>;
  systemHealth: {
    databaseConnected: boolean;
    totalRecords: number;
  };
}

export interface AnalyticsSummary {
  enrollment: EnrollmentAnalytics;
  financial: FinancialAnalytics;
  academic: AcademicAnalytics;
  userActivity: UserActivityAnalytics;
  system: SystemAnalytics;
  generatedAt: Date;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/system/analytics`;

  constructor(private http: HttpClient) {}

  getAnalyticsSummary(
    startDate?: string,
    endDate?: string,
    termNum?: number,
    termYear?: number,
  ): Observable<AnalyticsSummary> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (termNum) {
      params = params.set('termNum', termNum.toString());
    }
    if (termYear) {
      params = params.set('termYear', termYear.toString());
    }
    return this.http.get<AnalyticsSummary>(this.apiUrl, { params });
  }

  getEnrollmentAnalytics(
    termNum?: number,
    termYear?: number,
  ): Observable<EnrollmentAnalytics> {
    let params = new HttpParams();
    if (termNum) {
      params = params.set('termNum', termNum.toString());
    }
    if (termYear) {
      params = params.set('termYear', termYear.toString());
    }
    return this.http.get<EnrollmentAnalytics>(`${this.apiUrl}/enrollment`, { params });
  }

  getFinancialAnalytics(
    startDate?: string,
    endDate?: string,
    termNum?: number,
    termYear?: number,
  ): Observable<FinancialAnalytics> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (termNum) {
      params = params.set('termNum', termNum.toString());
    }
    if (termYear) {
      params = params.set('termYear', termYear.toString());
    }
    return this.http.get<FinancialAnalytics>(`${this.apiUrl}/financial`, {
      params,
    });
  }

  getAcademicAnalytics(
    termNum?: number,
    termYear?: number,
  ): Observable<AcademicAnalytics> {
    let params = new HttpParams();
    if (termNum) {
      params = params.set('termNum', termNum.toString());
    }
    if (termYear) {
      params = params.set('termYear', termYear.toString());
    }
    return this.http.get<AcademicAnalytics>(`${this.apiUrl}/academic`, { params });
  }

  getUserActivityAnalytics(): Observable<UserActivityAnalytics> {
    return this.http.get<UserActivityAnalytics>(`${this.apiUrl}/users`);
  }

  getSystemAnalytics(): Observable<SystemAnalytics> {
    return this.http.get<SystemAnalytics>(`${this.apiUrl}/system`);
  }
}

