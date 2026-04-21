import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ReportReleaseSettings, 
  CreateReportReleaseDto, 
  UpdateReportReleaseDto, 
  BulkUpdateReportReleaseDto,
  ReportReleaseStatus,
  GeneratedExamSession 
} from '../models/report-release-settings.model';

@Injectable({
  providedIn: 'root'
})
export class ReportReleaseService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get all report release settings
  getReportReleases(): Observable<ReportReleaseSettings[]> {
    return this.http.get<ReportReleaseSettings[]>(`${this.apiUrl}/system/report-releases`);
  }

  // Get a specific report release setting by ID
  getReportRelease(id: string): Observable<ReportReleaseSettings> {
    return this.http.get<ReportReleaseSettings>(`${this.apiUrl}/system/report-releases/${id}`);
  }

  // Create a new report release setting
  createReportRelease(createDto: CreateReportReleaseDto): Observable<ReportReleaseSettings> {
    return this.http.post<ReportReleaseSettings>(`${this.apiUrl}/system/report-releases`, createDto);
  }

  // Update a report release setting
  updateReportRelease(id: string, updateDto: UpdateReportReleaseDto): Observable<ReportReleaseSettings> {
    return this.http.patch<ReportReleaseSettings>(`${this.apiUrl}/system/report-releases/${id}`, updateDto);
  }

  // Bulk update multiple report release settings
  bulkUpdateReportReleases(bulkUpdateDto: BulkUpdateReportReleaseDto): Observable<ReportReleaseSettings[]> {
    return this.http.patch<ReportReleaseSettings[]>(`${this.apiUrl}/system/report-releases/bulk-update`, bulkUpdateDto);
  }

  // Delete a report release setting
  deleteReportRelease(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/system/report-releases/${id}`);
  }

  // Get all released exam sessions
  getAvailableExamSessions(): Observable<ReportReleaseSettings[]> {
    return this.http.get<ReportReleaseSettings[]>(`${this.apiUrl}/system/report-releases/available`);
  }

  // Check if a specific exam session is released
  checkReleaseStatus(termNumber: number, termYear: number, examType: string): Observable<ReportReleaseStatus> {
    const params = new HttpParams()
      .set('termNumber', termNumber.toString())
      .set('termYear', termYear.toString())
      .set('examType', examType);
    
    return this.http.get<ReportReleaseStatus>(`${this.apiUrl}/system/report-releases/check`, { params });
  }

  // Get scheduled releases for the next 24 hours
  getScheduledReleases(): Observable<ReportReleaseSettings[]> {
    return this.http.get<ReportReleaseSettings[]>(`${this.apiUrl}/system/report-releases/scheduled`);
  }

  // Generate exam sessions from existing terms in database
  generateFromTerms(): Observable<ReportReleaseSettings[]> {
    return this.http.post<ReportReleaseSettings[]>(`${this.apiUrl}/system/report-releases/generate-from-terms`, {});
  }

  // Legacy method - generate exam sessions for current and next year
  generateExamSessions(year?: number): Observable<GeneratedExamSession[]> {
    const params = year ? new HttpParams().set('year', year.toString()) : {};
    return this.http.get<GeneratedExamSession[]>(`${this.apiUrl}/system/report-releases/generate-sessions`, { params });
  }

  // Process scheduled releases (for cron jobs)
  processScheduledReleases(): Observable<ReportReleaseSettings[]> {
    return this.http.patch<ReportReleaseSettings[]>(`${this.apiUrl}/system/report-releases/process-scheduled`, {});
  }
}
