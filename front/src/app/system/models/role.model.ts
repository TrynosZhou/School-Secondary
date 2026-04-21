/* eslint-disable prettier/prettier */
export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource?: string;
  action?: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  isSystemRole: boolean;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRole {
  name: string;
  description?: string;
  active?: boolean;
  permissionIds?: string[];
}

export interface UpdateRole {
  name?: string;
  description?: string;
  active?: boolean;
  permissionIds?: string[];
}

export interface AssignRole {
  accountId: string;
  roleId: string;
}


