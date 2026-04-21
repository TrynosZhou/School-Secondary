import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AttendanceRecord {
  id?: number;
  studentNumber: string;
  surname: string;
  name: string;
  gender: string;
  present: boolean;
  date: string;
  className: string;
  termNum: number;
  year: number;
  student: any;
}

export interface MarkAttendanceRequest {
  studentNumber: string;
  className: string;
  termNum: number;
  year: number;
  present: boolean;
  date: string;
}

export interface AttendanceReport {
  [date: string]: AttendanceRecord[];
}

export interface AttendanceSummary {
  className: string;
  termNum: number;
  year: number;
  totalRecords: number;
  presentCount: number;
  absentCount: number;
  attendanceRate: number;
  studentStats: StudentAttendanceStats[];
}

export interface StudentAttendanceStats {
  student: any;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  attendanceRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getClassAttendance(
    className: string,
    termNum: number,
    year: number,
    date?: string
  ): Observable<AttendanceRecord[]> {
    let url = `${this.apiUrl}/class/${className}/${termNum}/${year}`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.http.get<AttendanceRecord[]>(url);
  }

  markAttendance(request: MarkAttendanceRequest): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(`${this.apiUrl}/mark`, request);
  }

  getAttendanceReports(
    className: string,
    termNum: number,
    year: number,
    startDate?: string,
    endDate?: string
  ): Observable<AttendanceReport> {
    let url = `${this.apiUrl}/reports/${className}/${termNum}/${year}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return this.http.get<AttendanceReport>(url);
  }

  getStudentAttendance(
    studentNumber: string,
    termNum: number,
    year: number,
    startDate?: string,
    endDate?: string
  ): Observable<AttendanceRecord[]> {
    let url = `${this.apiUrl}/student/${studentNumber}/${termNum}/${year}`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    return this.http.get<AttendanceRecord[]>(url);
  }

  getAttendanceSummary(
    className: string,
    termNum: number,
    year: number
  ): Observable<AttendanceSummary> {
    return this.http.get<AttendanceSummary>(`${this.apiUrl}/summary/${className}/${termNum}/${year}`);
  }

}