/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserManagementModel, UserDetailsModel, UserListPaginatedModel, CreateUserModel, UpdateUserModel, ChangePasswordModel, UserActivityPaginatedModel, DepartmentModel } from '../models/user-management.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private baseUrl = environment.apiUrl + '/user-management';

  constructor(private httpClient: HttpClient) {}

  createUser(user: CreateUserModel): Observable<UserDetailsModel> {
    return this.httpClient.post<UserDetailsModel>(`${this.baseUrl}`, user);
  }

  getAllUsers(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string
  ): Observable<any[]> {
    // Use the new backend endpoint
    return this.httpClient.get<any[]>(`${environment.apiUrl}/auth/accounts/all`);
  }

  getUserById(id: string, role: string): Observable<UserDetailsModel> {
    // Use the existing auth endpoint
    return this.httpClient.get<UserDetailsModel>(`${environment.apiUrl}/auth/${id}/${role}`);
  }

  updateUser(id: string, user: UpdateUserModel): Observable<{ message: string }> {
    // Update account (username, role, status where supported by backend)
    return this.httpClient.patch<{ message: string }>(`${environment.apiUrl}/auth/${id}`, user);
  }

  updateProfile(id: string, profileData: any): Observable<{ message: string }> {
    // Update profile (name, surname, email, cell, address)
    return this.httpClient.patch<{ message: string }>(`${environment.apiUrl}/auth/${id}/profile`, profileData);
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.httpClient.delete<{ message: string }>(`${environment.apiUrl}/auth/accounts/${id}`);
  }

  restoreUser(id: string): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(`${environment.apiUrl}/auth/accounts/${id}/restore`, {});
  }

  changePassword(id: string, passwordData: ChangePasswordModel): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(`${this.baseUrl}/${id}/change-password`, passwordData);
  }

  resetPassword(id: string): Observable<{ message: string; generatedPassword: string }> {
    return this.httpClient.post<{ message: string; generatedPassword: string }>(`${environment.apiUrl}/auth/${id}/reset-password`, {});
  }

  setCustomPassword(id: string, password: string): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(`${environment.apiUrl}/auth/${id}/set-password`, { password });
  }

  getUserActivity(id: string, page: number = 1, limit: number = 20): Observable<UserActivityPaginatedModel> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.httpClient.get<UserActivityPaginatedModel>(`${environment.apiUrl}/auth/accounts/${id}/activity`, { params });
  }

  getSystemActivity(page: number = 1, limit: number = 20, action?: string, userId?: string, startDate?: string, endDate?: string): Observable<UserActivityPaginatedModel> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (action) {
      params = params.set('action', action);
    }
    if (userId) {
      params = params.set('userId', userId);
    }
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }

    // Use the correct backend endpoint at /activity/system
    return this.httpClient.get<UserActivityPaginatedModel>(`${environment.apiUrl}/activity/system`, { params });
  }

  getDepartments(): Observable<DepartmentModel[]> {
    return this.httpClient.get<DepartmentModel[]>(`${environment.apiUrl}/departments`);
  }

  createDepartment(payload: { name: string; description?: string }): Observable<DepartmentModel> {
    return this.httpClient.post<DepartmentModel>(`${environment.apiUrl}/departments`, payload);
  }

  updateDepartment(id: string, payload: { name?: string; description?: string }): Observable<DepartmentModel> {
    return this.httpClient.patch<DepartmentModel>(`${environment.apiUrl}/departments/${id}`, payload);
  }

  deleteDepartment(id: string): Observable<{ success: boolean }> {
    return this.httpClient.delete<{ success: boolean }>(`${environment.apiUrl}/departments/${id}`);
  }
}


