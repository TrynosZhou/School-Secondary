import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { StudentsModel } from '../models/students.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  constructor(private httpClient: HttpClient) {}

  private baseUrl = environment.apiUrl + '/students/';

  getAllStudents(): Observable<StudentsModel[]> {
    return this.httpClient.get<StudentsModel[]>(this.baseUrl);
  }

  /**
   * Paginated, server-side student search for large datasets and typeahead.
   */
  searchStudents(
    query: string,
    page = 1,
    limit = 50
  ): Observable<{ items: StudentsModel[]; total: number }> {
    let params = new HttpParams()
      .set('q', query ?? '')
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<{ items: StudentsModel[]; total: number }>(
      `${this.baseUrl}search`,
      { params }
    );
  }

  addStudent(student: StudentsModel): Observable<StudentsModel> {
    // console.log(teacher);
    return this.httpClient.post<StudentsModel>(this.baseUrl, student);
  }

  deleteStudent(studentNumber: string): Observable<{ studentNumber: string }> {
    console.log('Deleting student : ', studentNumber);
    return this.httpClient.delete<{ studentNumber: string }>(
      this.baseUrl + studentNumber
    );
  }

  editStudent(
    studentNumber: string,
    student: StudentsModel
  ): Observable<StudentsModel> {
    return this.httpClient.patch<StudentsModel>(
      this.baseUrl + studentNumber,
      student
    );
  }
}
