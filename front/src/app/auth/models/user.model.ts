import { ROLES } from 'src/app/registration/models/roles.enum';

export interface User {
  username: string;
  role: ROLES;
  id: string;
  iat: number;
  exp: number;
  permissions?: string[]; // Permissions assigned to the user's role
  tenantSlug?: string;
  tenantId?: string;
}
