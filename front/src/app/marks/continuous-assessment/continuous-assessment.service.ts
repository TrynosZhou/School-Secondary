import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ContinuousAssessmentEntry {
  id: string;
  studentId: string;
  classId: number;
  subjectId?: number;
  topicOrSkill: string;
  assessmentDate: string;
  assessmentType: string;
  score: number;
  maxScore?: number;
  student?: { studentNumber: string; name: string; surname: string };
  teacher?: { id: string; name: string; surname: string };
  subject?: { id: number; name: string };
}

export interface ContinuousAssessmentAnalytics {
  averageScore: number;
  totalEntries: number;
  subjectAverages: { subject: string; average: number }[];
  recentAssessments: ContinuousAssessmentEntry[];
}

export interface CreateContinuousAssessmentDto {
  studentId: string;
  classId: number;
  subjectId?: number;
  topicOrSkill: string;
  assessmentDate: string;
  score: number;
  maxScore?: number;
  assessmentType?: string;
}

export interface ClassRosterEntry {
  studentId: string;
  studentNumber: string;
  studentName: string;
  score?: number;
  maxScore?: number | null;
  assessmentDate?: string;
  assessmentType?: string;
  topicOrSkill?: string;
  entryId?: string;
}

@Injectable({ providedIn: 'root' })
export class ContinuousAssessmentService {
  private apiUrl = `${environment.apiUrl}/continuous-assessment`;

  constructor(private http: HttpClient) {}

  createEntry(dto: CreateContinuousAssessmentDto): Observable<ContinuousAssessmentEntry> {
    return this.http.post<ContinuousAssessmentEntry>(`${this.apiUrl}`, dto);
  }

  getClassEntries(
    classId: number,
    filters?: { startDate?: string; endDate?: string; subjectId?: number; assessmentType?: string },
  ): Observable<ContinuousAssessmentEntry[]> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.subjectId) params = params.set('subjectId', filters.subjectId);
    if (filters?.assessmentType) params = params.set('assessmentType', filters.assessmentType);
    return this.http.get<ContinuousAssessmentEntry[]>(`${this.apiUrl}/class/${classId}`, { params });
  }

  getStudentEntries(
    studentId: string,
    filters?: { startDate?: string; endDate?: string; subjectId?: number; assessmentType?: string },
  ): Observable<ContinuousAssessmentEntry[]> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.subjectId) params = params.set('subjectId', filters.subjectId);
    if (filters?.assessmentType) params = params.set('assessmentType', filters.assessmentType);
    return this.http.get<ContinuousAssessmentEntry[]>(`${this.apiUrl}/student/${studentId}`, { params });
  }

  getStudentAnalytics(studentId: string): Observable<ContinuousAssessmentAnalytics> {
    return this.http.get<ContinuousAssessmentAnalytics>(`${this.apiUrl}/student/${studentId}/analytics`);
  }

  getClassRoster(
    classId: number,
    params: { assessmentDate: string; topic: string; subjectCode?: string; assessmentType?: string },
  ): Observable<ClassRosterEntry[]> {
    let httpParams = new HttpParams().set('assessmentDate', params.assessmentDate).set('topic', params.topic);
    if (params.subjectCode) httpParams = httpParams.set('subjectCode', params.subjectCode);
    if (params.assessmentType) httpParams = httpParams.set('assessmentType', params.assessmentType);
    return this.http.get<ClassRosterEntry[]>(`${this.apiUrl}/class/${classId}/roster`, {
      params: httpParams,
    });
  }
}

