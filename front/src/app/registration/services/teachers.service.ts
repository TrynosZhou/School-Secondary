import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TeachersModel } from '../models/teachers.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TeachersService {
  constructor(private httpClient: HttpClient) {}

  private baseUrl = environment.apiUrl + '/teachers/';

  getAllTeachers(): Observable<TeachersModel[]> {
    return this.httpClient.get<TeachersModel[]>(this.baseUrl);
  }

  addTeacher(teacher: TeachersModel): Observable<TeachersModel> {
    // console.log(teacher);
    return this.httpClient.post<TeachersModel>(this.baseUrl, teacher);
  }

  deleteTeacher(id: string): Observable<{ id: string }> {
    return this.httpClient.delete<{ id: string }>(this.baseUrl + id);
  }

  editTeacher(id: string, teacher: TeachersModel): Observable<TeachersModel> {
    return this.httpClient.patch<TeachersModel>(this.baseUrl + id, teacher);
  }
}
