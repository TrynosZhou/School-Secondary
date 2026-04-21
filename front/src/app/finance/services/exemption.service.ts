import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExemptionModel } from '../../finance/models/exemption.model';
import { ExemptionType } from '../enums/exemption-type.enum';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root', // Makes the service a singleton and available throughout the app
})
export class ExemptionService {
  baseURL = `${environment.apiUrl}/exemptions/`;

  constructor(private http: HttpClient) {}

  /**
   * Sends a POST request to create a new exemption on the backend.
   * @param exemption The exemption data to create.
   * @returns An Observable of the created ExemptionModel.
   */
  createExemption(exemption: ExemptionModel): Observable<ExemptionModel> {
    // Note: The backend typically handles ID generation, createdAt, updatedAt.
    // Send only the necessary fields for creation.
    const payload = {
      studentNumber: exemption.student.studentNumber,
      type: exemption.type,
      fixedAmount: exemption.fixedAmount,
      percentageAmount: exemption.percentageAmount,
      description: exemption.description,
      isActive: exemption.isActive,
    };
    return this.http.post<ExemptionModel>(this.baseURL, payload);
  }

  /**
   * Get all exemptions with optional filters
   * @param studentNumber Optional student number filter
   * @param type Optional exemption type filter
   * @param isActive Optional active status filter
   * @returns An Observable of ExemptionModel array
   */
  getAllExemptions(
    studentNumber?: string,
    type?: ExemptionType,
    isActive?: boolean,
  ): Observable<ExemptionModel[]> {
    let params = new HttpParams();

    if (studentNumber) {
      params = params.set('studentNumber', studentNumber);
    }

    if (type) {
      params = params.set('type', type);
    }

    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<ExemptionModel[]>(this.baseURL, { params });
  }

  /**
   * Get exemption by ID
   * @param id The exemption ID
   * @returns An Observable of ExemptionModel
   */
  getExemptionById(id: number): Observable<ExemptionModel> {
    return this.http.get<ExemptionModel>(`${this.baseURL}${id}`);
  }

  /**
   * Get exemption by student number
   * @param studentNumber The student number
   * @returns An Observable of ExemptionModel or null
   */
  getExemptionByStudentNumber(
    studentNumber: string,
  ): Observable<ExemptionModel | null> {
    return this.http.get<ExemptionModel | null>(
      `${this.baseURL}student/${studentNumber}`,
    );
  }

  /**
   * Update an existing exemption
   * @param id The exemption ID
   * @param exemption The exemption data to update (only include fields to update)
   * @returns An Observable of the updated ExemptionModel
   */
  updateExemption(
    id: number,
    exemption: Partial<ExemptionModel>,
  ): Observable<ExemptionModel> {
    // Create payload with only the fields to update
    const payload: any = {};

    if (exemption.type !== undefined) {
      payload.type = exemption.type;
    }

    if (exemption.fixedAmount !== undefined) {
      payload.fixedAmount = exemption.fixedAmount;
    }

    if (exemption.percentageAmount !== undefined) {
      payload.percentageAmount = exemption.percentageAmount;
    }

    if (exemption.description !== undefined) {
      payload.description = exemption.description;
    }

    if (exemption.isActive !== undefined) {
      payload.isActive = exemption.isActive;
    }

    return this.http.put<ExemptionModel>(`${this.baseURL}${id}`, payload);
  }

  /**
   * Delete an exemption by ID
   * @param id The exemption ID
   * @returns An Observable that completes when deletion is successful
   */
  deleteExemption(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseURL}${id}`);
  }
}
