/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface GradeThresholds {
  aStar: number;
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
}

export interface GradingSystem {
  id?: string;
  level: string;
  gradeThresholds: GradeThresholds;
  failGrade: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class GradingSystemService {
  private apiUrl = `${environment.apiUrl}/system/grading`;

  constructor(private http: HttpClient) {}

  getAllGradingSystems(): Observable<GradingSystem[]> {
    return this.http.get<GradingSystem[]>(this.apiUrl);
  }

  getGradingSystem(level: string): Observable<GradingSystem> {
    return this.http.get<GradingSystem>(`${this.apiUrl}/${level}`);
  }

  saveGradingSystem(
    level: string,
    gradeThresholds: GradeThresholds,
    failGrade: string
  ): Observable<GradingSystem> {
    return this.http.post<GradingSystem>(this.apiUrl, {
      level,
      gradeThresholds,
      failGrade,
    });
  }

  updateGradingSystem(
    level: string,
    gradeThresholds: GradeThresholds,
    failGrade: string
  ): Observable<GradingSystem> {
    return this.http.put<GradingSystem>(`${this.apiUrl}/${level}`, {
      gradeThresholds,
      failGrade,
    });
  }
}

