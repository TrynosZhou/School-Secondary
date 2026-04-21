import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StudentsModel } from '../../registration/models/students.model';

@Injectable({
  providedIn: 'root'
})
export class StudentSearchService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Search students with debouncing
  searchStudents(query: string): Observable<StudentsModel[]> {
    if (!query || query.trim().length < 2) {
      // For blank/short queries, return full list instead of empty set so
      // newly created students remain visible in the table.
      return this.http.get<StudentsModel[]>(`${this.apiUrl}/students/`);
    }

    const params = new URLSearchParams();
    params.set('q', query.trim());

    return this.http.get<StudentsModel[]>(`${this.apiUrl}/students/search?${params.toString()}`);
  }
}
