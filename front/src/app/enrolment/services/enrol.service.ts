import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnrolsModel } from '../models/enrols.model';
import { EnrolStats } from '../models/enrol-stats.model';
import { environment } from 'src/environments/environment';
import { StudentsSummary } from '../models/students-summary.model';

export interface MigrateClassResponse {
  result: boolean;
  message?: string;
  migratedCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class EnrolService {
  baseURL = `${environment.apiUrl}/enrolment/enrol/`;

  constructor(private httpClient: HttpClient) {}

  getTermEnrolments(
    num: number,
    year: number,
    termId?: number
  ): Observable<EnrolsModel[]> {
    const suffix = termId ? `?termId=${termId}` : '';
    return this.httpClient.get<EnrolsModel[]>(`${this.baseURL}${num}/${year}${suffix}`);
  }

  getEnrolmentByClass(
    name: string,
    num: number,
    year: number,
    termId?: number
  ): Observable<EnrolsModel[]> {
    const suffix = termId ? `?termId=${termId}` : '';
    return this.httpClient.get<EnrolsModel[]>(
      `${this.baseURL}${name}/${num}/${year}${suffix}`
    );
  }

  getCurrentEnrolment(studentNumber: string): Observable<EnrolsModel> {
    return this.httpClient.get<EnrolsModel>(`${this.baseURL}${studentNumber}`);
  }

  /**
   * PATCH enrolment (e.g. class name, residence).
   * Backend contract: when this endpoint updates the enrolment, it MUST also update
   * any invoice rows that reference this enrolment (same enrol_id / term) so that
   * stored class name and residence on invoices stay in sync. Only invoices for
   * this enrolment's term (enrol.num, enrol.year) should be updated.
   */
  updateCurrentEnrolment(enrol: EnrolsModel): Observable<EnrolsModel> {
    return this.httpClient.patch<EnrolsModel>(`${this.baseURL}`, enrol);
  }

  enrolStudents(enrols: EnrolsModel[]): Observable<EnrolsModel[]> {
    return this.httpClient.post<EnrolsModel[]>(this.baseURL, enrols);
  }

  getEnrolsStats(): Observable<EnrolStats> {
    return this.httpClient.get<EnrolStats>(this.baseURL);
  }

  getTotalEnrolment(
    num: number,
    year: number,
    termId?: number
  ): Observable<StudentsSummary> {
    const requestUrl = `${this.baseURL}summary/${num}/${year}${termId ? `?termId=${termId}` : ''}`;
    // <-- ADD THIS LINE

    return this.httpClient.get<StudentsSummary>(requestUrl);
  }

  unenrolStudent(enrol: EnrolsModel): Observable<EnrolsModel> {
    return this.httpClient.delete<EnrolsModel>(this.baseURL + enrol.id);
  }

  migrateClass(
    fromName: string,
    fromNum: number,
    fromYear: number,
    fromTermId: number | undefined,
    toName: string,
    toNum: number,
    toYear: number,
    toTermId: number | undefined
  ): Observable<MigrateClassResponse> {
    const query = new URLSearchParams();
    if (fromTermId != null) query.set('fromTermId', String(fromTermId));
    if (toTermId != null) query.set('toTermId', String(toTermId));
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return this.httpClient.get<MigrateClassResponse>(
      `${this.baseURL}migrate/${fromName}/${fromNum}/${fromYear}/${toName}/${toNum}/${toYear}${suffix}`
    );
  }

  isNewComer(studentNumber: string): Observable<boolean> {
    return this.httpClient.get<boolean>(
      `${this.baseURL}newcomers/${studentNumber}`
    );
  }
}
