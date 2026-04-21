import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface TeacherSummary {
  id: string;
  name: string;
  surname: string;
  email: string;
  departmentId?: string | null;
}

export interface SubjectSummary {
  code: string;
  name: string;
}

export interface DepartmentSubjectMapping {
  id: string;
  subjectCode: string;
  subject?: SubjectSummary;
}

export interface DepartmentDetails {
  id: string;
  name: string;
  description?: string | null;
  hodId?: string | null;
  hod?: TeacherSummary | null;
  teachers?: TeacherSummary[];
  subjectMappings?: DepartmentSubjectMapping[];
}

@Injectable({ providedIn: 'root' })
export class DepartmentsApiService {
  constructor(private readonly http: HttpClient) {}

  getDepartments(): Observable<DepartmentDetails[]> {
    return this.http.get<DepartmentDetails[]>(`${environment.apiUrl}/departments`);
  }

  getDepartment(id: string): Observable<DepartmentDetails> {
    return this.http.get<DepartmentDetails>(`${environment.apiUrl}/departments/${id}`);
  }

  setHod(departmentId: string, teacherId: string | null): Observable<DepartmentDetails> {
    return this.http.patch<DepartmentDetails>(`${environment.apiUrl}/departments/${departmentId}/hod`, { teacherId });
  }

  addTeacher(departmentId: string, teacherId: string): Observable<DepartmentDetails> {
    return this.http.post<DepartmentDetails>(`${environment.apiUrl}/departments/${departmentId}/teachers`, { teacherId });
  }

  removeTeacher(departmentId: string, teacherId: string): Observable<DepartmentDetails> {
    return this.http.delete<DepartmentDetails>(`${environment.apiUrl}/departments/${departmentId}/teachers/${teacherId}`);
  }

  addSubject(departmentId: string, subjectCode: string): Observable<DepartmentDetails> {
    return this.http.post<DepartmentDetails>(`${environment.apiUrl}/departments/${departmentId}/subjects`, { subjectCode });
  }

  removeSubject(departmentId: string, subjectCode: string): Observable<DepartmentDetails> {
    return this.http.delete<DepartmentDetails>(`${environment.apiUrl}/departments/${departmentId}/subjects/${subjectCode}`);
  }

  getTeachers(): Observable<TeacherSummary[]> {
    return this.http.get<TeacherSummary[]>(`${environment.apiUrl}/teachers`);
  }

  getSubjects(): Observable<SubjectSummary[]> {
    return this.http.get<SubjectSummary[]>(`${environment.apiUrl}/marks/subjects`);
  }
}

