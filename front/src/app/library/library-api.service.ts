import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LibraryTitle {
  id: string;
  title: string;
  author?: string | null;
  edition?: string | null;
  isbn?: string | null;
  publisher?: string | null;
  subject?: string | null;
  notes?: string | null;
}

export interface LibraryCopy {
  id: string;
  bookNumber: string;
  titleId: string;
  departmentId: string;
  roomId?: string | null;
  status: 'available' | 'borrowed' | 'lost' | 'damaged' | 'retired';
  assignedTeacherId?: string | null;
  title?: LibraryTitle;
  room?: { id: string; name: string; code?: string | null };
}

export interface LibraryLoan {
  id: string;
  copyId: string;
  studentNumber: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt?: string | null;
  notes?: string | null;
  copy?: LibraryCopy;
  student?: { studentNumber: string; name?: string; surname?: string };
}

export interface DepartmentTeacherLite {
  id: string;
  name: string;
  surname: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class LibraryApiService {
  private readonly baseUrl = `${environment.apiUrl}/library`;

  constructor(private readonly http: HttpClient) {}

  getTitles(q?: string): Observable<LibraryTitle[]> {
    let params = new HttpParams();
    if (q?.trim()) params = params.set('q', q.trim());
    return this.http.get<LibraryTitle[]>(`${this.baseUrl}/titles`, { params });
  }

  createTitle(payload: {
    title: string;
    author?: string | null;
    edition?: string | null;
    isbn?: string | null;
    publisher?: string | null;
    subject?: string | null;
    notes?: string | null;
  }): Observable<LibraryTitle> {
    return this.http.post<LibraryTitle>(`${this.baseUrl}/titles`, payload);
  }

  getCopies(paramsIn?: {
    q?: string;
    titleId?: string;
    roomId?: string;
    status?: string;
  }): Observable<LibraryCopy[]> {
    let params = new HttpParams();
    if (paramsIn?.q?.trim()) params = params.set('q', paramsIn.q.trim());
    if (paramsIn?.titleId?.trim()) params = params.set('titleId', paramsIn.titleId.trim());
    if (paramsIn?.roomId?.trim()) params = params.set('roomId', paramsIn.roomId.trim());
    if (paramsIn?.status?.trim()) params = params.set('status', paramsIn.status.trim());
    return this.http.get<LibraryCopy[]>(`${this.baseUrl}/copies`, { params });
  }

  receiveCopies(payload: {
    titleId: string;
    roomId?: string | null;
    copiesCount: number;
    assignedTeacherId?: string | null;
  }): Observable<{ created: number; bookNumbers: string[] }> {
    return this.http.post<{ created: number; bookNumbers: string[] }>(
      `${this.baseUrl}/copies/receive`,
      payload,
    );
  }

  assignCopy(payload: {
    copyId: string;
    assignedTeacherId?: string | null;
  }): Observable<LibraryCopy> {
    return this.http.post<LibraryCopy>(`${this.baseUrl}/copies/assign`, payload);
  }

  getDepartmentTeachers(): Observable<DepartmentTeacherLite[]> {
    return this.http.get<DepartmentTeacherLite[]>(`${this.baseUrl}/teachers`);
  }

  issueLoan(payload: {
    copyId: string;
    studentNumber: string;
    dueAt: string;
    notes?: string | null;
  }): Observable<LibraryLoan> {
    return this.http.post<LibraryLoan>(`${this.baseUrl}/loans/issue`, payload);
  }

  returnLoan(payload: { loanId: string; notes?: string | null }): Observable<LibraryLoan> {
    return this.http.post<LibraryLoan>(`${this.baseUrl}/loans/return`, payload);
  }

  getLoans(paramsIn?: {
    q?: string;
    studentNumber?: string;
    copyId?: string;
    status?: 'open' | 'returned';
  }): Observable<LibraryLoan[]> {
    let params = new HttpParams();
    if (paramsIn?.q?.trim()) params = params.set('q', paramsIn.q.trim());
    if (paramsIn?.studentNumber?.trim()) {
      params = params.set('studentNumber', paramsIn.studentNumber.trim());
    }
    if (paramsIn?.copyId?.trim()) params = params.set('copyId', paramsIn.copyId.trim());
    if (paramsIn?.status) params = params.set('status', paramsIn.status);
    return this.http.get<LibraryLoan[]>(`${this.baseUrl}/loans`, { params });
  }
}

