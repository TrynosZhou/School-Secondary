import { ROLES } from '../registration/models/roles.enum';
import { PERMISSIONS } from '../services/permissions.constants';

export interface RoutePolicy {
  roles?: readonly ROLES[];
  permissions?: readonly string[];
}

export const ROUTE_POLICIES = {
  teachers: {
    roles: [ROLES.admin, ROLES.reception, ROLES.director],
  },
  students: {
    roles: [ROLES.admin, ROLES.reception, ROLES.director],
  },
  parents: {
    roles: [ROLES.admin, ROLES.reception, ROLES.director],
  },
  fees: {
    roles: [ROLES.admin, ROLES.reception, ROLES.auditor, ROLES.director],
    permissions: [PERMISSIONS.FINANCE.MANAGE_FEES],
  },
  balances: {
    roles: [ROLES.reception],
    permissions: [PERMISSIONS.FINANCE.VIEW],
  },
  invoice: {
    roles: [ROLES.reception, ROLES.auditor, ROLES.director],
    permissions: [PERMISSIONS.FINANCE.CREATE],
  },
  payments: {
    roles: [ROLES.auditor, ROLES.director],
    permissions: [PERMISSIONS.FINANCE.VIEW],
  },
  marksDiagnostics: {
    roles: [ROLES.admin, ROLES.dev],
    permissions: [PERMISSIONS.MARKS.VIEW],
  },
  userManagement: {
    roles: [ROLES.admin],
    permissions: [PERMISSIONS.USERS.MANAGE_ROLES],
  },
  systemRoles: {
    roles: [ROLES.admin],
    permissions: [PERMISSIONS.SYSTEM.MANAGE_ROLES],
  },
  systemSettings: {
    roles: [ROLES.admin],
    permissions: [PERMISSIONS.SYSTEM.EDIT_SETTINGS],
  },
  systemDepartments: {
    roles: [ROLES.admin],
    permissions: [PERMISSIONS.SYSTEM.MANAGE_ROLES],
  },
  systemAcademic: {
    roles: [ROLES.admin],
    permissions: [PERMISSIONS.SYSTEM.EDIT_SETTINGS],
  },
  systemAudit: {
    roles: [ROLES.admin, ROLES.director, ROLES.auditor],
    permissions: [PERMISSIONS.SYSTEM.VIEW_AUDIT],
  },
  systemAnalytics: {
    roles: [ROLES.admin, ROLES.director],
    permissions: [PERMISSIONS.SYSTEM.VIEW_AUDIT],
  },
  systemIntegrations: {
    roles: [ROLES.admin],
    permissions: [PERMISSIONS.SYSTEM.EDIT_SETTINGS],
  },
} as const satisfies Record<string, RoutePolicy>;
