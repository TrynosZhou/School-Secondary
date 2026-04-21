import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClassesModel } from '../models/classes.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ClassesService {
  constructor(private httpClient: HttpClient) {}

  private baseUrl = `${environment.apiUrl}/enrolment/class`;

  getAllClasses(): Observable<ClassesModel[]> {
    return this.httpClient.get<ClassesModel[]>(this.baseUrl);
  }

  addClass(clas: ClassesModel): Observable<ClassesModel> {
    return this.httpClient.post<ClassesModel>(this.baseUrl, clas);
  }

  deleteClass(name: string): Observable<{ name: string }> {
    return this.httpClient.delete<{ name: string }>(this.baseUrl + name);
  }

  editClass(clas: ClassesModel): Observable<ClassesModel> {
    const { id, name, form } = clas;
    // console.log(id, name, form);
    return this.httpClient.patch<ClassesModel>(this.baseUrl + clas.id, {
      name,
      form,
    });
  }
}
