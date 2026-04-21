import { Injectable } from '@angular/core';
import {
  Observable,
  map,
  combineLatest,
  of,
  switchMap,
  catchError,
  BehaviorSubject,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { selectUser } from '../auth/store/auth.selectors';
import { ROLES } from '../registration/models/roles.enum';
import { RolesPermissionsService } from '../system/services/roles-permissions.service';
import { PERMISSIONS } from './permissions.constants';

@Injectable({
  providedIn: 'root'
})
export class RoleAccessService {
  private readonly devViewRole$ = new BehaviorSubject<ROLES | null>(null);

  constructor(
    private store: Store,
    private rolesPermissionsService: RolesPermissionsService
  ) {}

  /**
   * Get current user's role as Observable
   */
  getCurrentRole$(): Observable<string | null> {
    return combineLatest([this.store.select(selectUser), this.devViewRole$]).pipe(
      map(([user, devViewRole]) => devViewRole || user?.role || null)
    );
  }

  setDevViewRole(role: ROLES): void {
    this.devViewRole$.next(role);
  }

  clearDevViewRole(): void {
    this.devViewRole$.next(null);
  }

  /**
   * Check if user has any of the specified roles
   * Dev role has access to everything, so always true when role is dev
   */
  hasAnyRole$(...roles: string[]): Observable<boolean> {
    return this.getCurrentRole$().pipe(
      map(role => role !== null && (role === ROLES.dev || roles.includes(role)))
    );
  }

  /**
   * Check if user has all of the specified roles (useful for future multi-role support)
   */
  hasAllRoles$(...roles: string[]): Observable<boolean> {
    return this.getCurrentRole$().pipe(
      map(role => role !== null && roles.every(r => role === r))
    );
  }

  /**
   * Check if user does NOT have any of the specified roles
   */
  doesNotHaveRole$(...roles: string[]): Observable<boolean> {
    return this.getCurrentRole$().pipe(
      map(role => role !== null && !roles.includes(role))
    );
  }

  /**
   * Check if user has a specific role (synchronous version using current role)
   * Dev is treated as having every role for access control, except student (dev does not access student dashboard).
   */
  hasRole(role: string, currentRole: string | null): boolean {
    if (currentRole === null) return false;
    if (currentRole === role) return true;
    if (currentRole === ROLES.dev && role !== ROLES.student) return true;
    return false;
  }

  /**
   * Check if user has any of the specified roles (synchronous version)
   * Dev role has access to everything
   */
  hasAnyRole(currentRole: string | null, ...roles: string[]): boolean {
    return currentRole !== null && (currentRole === ROLES.dev || roles.includes(currentRole));
  }

  /**
   * Check if user does NOT have any of the specified roles (synchronous version)
   */
  doesNotHaveRole(currentRole: string | null, ...roles: string[]): boolean {
    return currentRole !== null && !roles.includes(currentRole);
  }

  /**
   * Check if user is admin
   */
  isAdmin$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.admin);
  }

  /**
   * Check if user is admin (synchronous)
   */
  isAdmin(currentRole: string | null): boolean {
    return this.hasRole(ROLES.admin, currentRole);
  }

  /**
   * Check if user can access registration features
   */
  canAccessRegistration$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.admin, ROLES.reception);
  }

  /**
   * Check if user can access enrolment features
   */
  canAccessEnrolment$(currentRole: string | null): Observable<boolean> {
    return this.doesNotHaveRole$(ROLES.student, ROLES.parent);
  }

  // Removed duplicate methods - using permission-based versions below

  /**
   * Check if user can access financial reports
   */
  canAccessFinancialReports$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.reception, ROLES.auditor, ROLES.director);
  }

  /**
   * Check if user can access system administration
   */
  canAccessSystemAdmin$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.admin);
  }

  // Removed duplicate methods - using permission-based versions below

  /**
   * Check if user can access billing/invoicing (reception, director, auditor)
   */
  canAccessBilling$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.reception, ROLES.director, ROLES.auditor);
  }

  /**
   * Check if user can access receipting (auditor, director)
   */
  canAccessReceipting$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.auditor, ROLES.director);
  }

  /**
   * Check if user can access class lists (admin, reception, teacher, hod, auditor, director)
   */
  canAccessClassLists$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(
      ROLES.admin,
      ROLES.reception,
      ROLES.teacher,
      ROLES.hod,
      ROLES.auditor,
      ROLES.director
    );
  }

  // Removed duplicate - using permission-based version if needed

  /**
   * Check if user can access results analysis (admin, teacher, hod, director)
   */
  canAccessResultsAnalysis$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.admin, ROLES.teacher, ROLES.hod, ROLES.director);
  }

  /**
   * Check if user can access student balances (reception)
   */
  canAccessStudentBalances$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.reception);
  }

  /**
   * Check if user can access exemptions (auditor, director)
   */
  canAccessExemptions$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.auditor, ROLES.director);
  }

  /**
   * Check if user can access revenue recognition (auditor, director)
   */
  canAccessRevenueRecognition$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.auditor, ROLES.director);
  }

  /**
   * Check if user can access fees collection (auditor, director)
   */
  canAccessFeesCollection$(currentRole: string | null): Observable<boolean> {
    return this.hasAnyRole$(ROLES.auditor, ROLES.director);
  }

  /**
   * Check permission-based access (integrates with roles-permissions system)
   * Falls back to role check if permission check fails or user doesn't have accountId
   */
  hasPermissionOrRole$(
    permissionName: string,
    fallbackRoles: string[]
  ): Observable<boolean> {
    return combineLatest([
      this.getCurrentRole$(),
      this.store.select(selectUser)
    ]).pipe(
      map(([role, user]) => {
        // If user has accountId, try permission check first
        if (user?.id) {
          // For now, fallback to role check
          // TODO: Implement permission check when accountId is available in user model
          return this.hasAnyRole(role, ...fallbackRoles);
        }
        // Fallback to role check
        return this.hasAnyRole(role, ...fallbackRoles);
      })
    );
  }

  /**
   * Check if user has a specific permission
   * Uses permissions from the store (set during login) and falls back to role-based access
   */
  hasPermission$(
    permissionName: string,
    fallbackRoles?: string[]
  ): Observable<boolean> {
    return combineLatest([
      this.getCurrentRole$(),
      this.store.select(selectUser)
    ]).pipe(
      map(([role, user]) => {
        if (role === ROLES.dev) {
          return true;
        }
        // First, check if user has permissions array and if it includes the required permission
        if (user?.permissions && Array.isArray(user.permissions)) {
          const hasPermission = user.permissions.includes(permissionName);
          if (hasPermission) {
            return true;
          }
        }
        
        // Fallback to role check if permission not found or permissions array not available
        if (fallbackRoles && fallbackRoles.length > 0) {
          return this.hasAnyRole(role, ...fallbackRoles);
        }
        return false;
      })
    );
  }

  /**
   * Check permission with role fallback - convenience method
   */
  canVoidReceipt$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.FINANCE.VOID_RECEIPT,
      [ROLES.auditor, ROLES.director]
    );
  }

  canVoidInvoice$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.FINANCE.VOID_INVOICE,
      // Reception should NOT be able to void invoices. Only auditor and director
      // are allowed as role fallbacks when explicit permissions are not loaded.
      [ROLES.auditor, ROLES.director]
    );
  }

  canDownloadReceipt$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.FINANCE.DOWNLOAD_RECEIPT,
      [ROLES.admin, ROLES.auditor, ROLES.director, ROLES.reception, ROLES.student]
    );
  }

  canDownloadInvoice$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.FINANCE.DOWNLOAD_INVOICE,
      [ROLES.admin, ROLES.auditor, ROLES.director, ROLES.reception, ROLES.student]
    );
  }

  canDownloadReport$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.REPORTS.DOWNLOAD,
      [ROLES.admin, ROLES.director, ROLES.auditor, ROLES.reception, ROLES.student]
    );
  }

  canGenerateReports$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.REPORTS.GENERATE,
      [ROLES.teacher, ROLES.admin, ROLES.hod]
    );
  }

  canSaveReports$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.REPORTS.SAVE,
      [ROLES.admin]
    );
  }

  canEditReportComment$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.REPORTS.EDIT_COMMENT,
      [ROLES.admin, ROLES.director, ROLES.hod, ROLES.teacher, ROLES.auditor, ROLES.reception]
    );
  }

  canEnterMarks$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.MARKS.ENTER,
      [ROLES.teacher, ROLES.admin, ROLES.hod]
    );
  }

  canEditMarks$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.MARKS.EDIT,
      [ROLES.teacher, ROLES.admin, ROLES.hod]
    );
  }

  canManageFees$(): Observable<boolean> {
    return this.hasPermission$(
      PERMISSIONS.FINANCE.MANAGE_FEES,
      [ROLES.reception, ROLES.admin, ROLES.auditor]
    );
  }

  /**
   * Get user permissions from backend
   */
  getUserPermissions$(accountId: string): Observable<string[]> {
    return this.rolesPermissionsService.getUserPermissions(accountId).pipe(
      map(response => response.permissions || [])
    );
  }
}

