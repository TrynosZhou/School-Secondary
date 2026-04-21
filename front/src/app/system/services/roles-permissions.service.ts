/* eslint-disable prettier/prettier */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Role, Permission, CreateRole, UpdateRole, AssignRole } from '../models/role.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RolesPermissionsService {
  private apiUrl = `${environment.apiUrl}/system/roles-permissions`;

  constructor(private http: HttpClient) {}

  // Role methods
  createRole(role: CreateRole): Observable<Role> {
    return this.http.post<Role>(`${this.apiUrl}/roles`, role);
  }

  getRoles(includeInactive = false): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles?includeInactive=${includeInactive}`);
  }

  getRoleById(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.apiUrl}/roles/${id}`);
  }

  updateRole(id: string, role: UpdateRole): Observable<Role> {
    return this.http.put<Role>(`${this.apiUrl}/roles/${id}`, role);
  }

  deleteRole(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }

  // Permission methods
  createPermission(permission: Partial<Permission>): Observable<Permission> {
    return this.http.post<Permission>(`${this.apiUrl}/permissions`, permission);
  }

  getPermissions(includeInactive = false): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/permissions?includeInactive=${includeInactive}`);
  }

  getPermissionById(id: string): Observable<Permission> {
    return this.http.get<Permission>(`${this.apiUrl}/permissions/${id}`);
  }

  updatePermission(id: string, permission: Partial<Permission>): Observable<Permission> {
    return this.http.put<Permission>(`${this.apiUrl}/permissions/${id}`, permission);
  }

  deletePermission(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/permissions/${id}`);
  }

  // Assign role to account
  assignRoleToAccount(assignRole: AssignRole): Observable<any> {
    return this.http.post(`${this.apiUrl}/assign-role`, assignRole);
  }

  // Get user permissions
  getUserPermissions(accountId: string): Observable<{ permissions: string[] }> {
    return this.http.get<{ permissions: string[] }>(`${this.apiUrl}/user/${accountId}/permissions`);
  }

  // Check if user has permission
  hasPermission(accountId: string, permissionName: string): Observable<{ hasPermission: boolean }> {
    return this.http.get<{ hasPermission: boolean }>(
      `${this.apiUrl}/user/${accountId}/has-permission/${permissionName}`,
    );
  }
}


