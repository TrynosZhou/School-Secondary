export interface UserManagementModel {
  id: string;
  username: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  name: string;
  email?: string;
  phone?: string;
  createdAt: Date;
  lastLogin?: Date;
  createdBy: string;
  profileId: string;
}

export interface UserDetailsModel extends UserManagementModel {
  surname?: string;
  title?: string;
  cell?: string;
  address?: string;
  gender?: string;
  dob?: Date;
  dateOfJoining?: Date;
  dateOfLeaving?: Date;
  qualifications?: string[];
  active?: boolean;
  idnumber?: string;
  prevSchool?: string;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface UserListPaginatedModel {
  users: UserManagementModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserModel {
  username: string;
  password: string;
  role: string;
  name: string;
  email?: string;
  phone?: string;
  profileId: string;
}

export interface UpdateUserModel {
  username?: string;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface ChangePasswordModel {
  currentPassword: string;
  newPassword: string;
}

export interface UserActivityModel {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: string;
}

export interface UserActivityPaginatedModel {
  activities: UserActivityModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DepartmentModel {
  id: string;
  name: string;
  description?: string;
}



