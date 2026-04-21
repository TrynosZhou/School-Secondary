import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TermsModel } from '../models/terms.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TermsService {
  baseURL = `${environment.apiUrl}/enrolment/terms`;

  constructor(private httpClient: HttpClient) {}

  getAllTerms(): Observable<TermsModel[]> {
    return this.httpClient.get<TermsModel[]>(this.baseURL);
  }

  addTerm(term: TermsModel): Observable<TermsModel> {
    return this.httpClient.post<TermsModel>(this.baseURL, term);
  }

  editTerm(term: TermsModel): Observable<TermsModel> {
    return this.httpClient.patch<TermsModel>(this.baseURL, term);
  }

  getCurrentTerm(): Observable<TermsModel> {
    return this.httpClient.get<TermsModel>(`${this.baseURL}/current`);
  }
}
