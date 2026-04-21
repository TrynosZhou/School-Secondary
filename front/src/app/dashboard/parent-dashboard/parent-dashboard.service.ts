import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ParentDashboardSummaryDto } from './models/parent-dashboard-summary.model';

@Injectable({ providedIn: 'root' })
export class ParentDashboardService {
  private readonly url = `${environment.apiUrl}/parents/children/summary`;

  constructor(private http: HttpClient) {}

  getSummary(): Observable<ParentDashboardSummaryDto> {
    return this.http.get<ParentDashboardSummaryDto>(this.url);
  }
}
