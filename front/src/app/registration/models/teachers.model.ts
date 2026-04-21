import { ROLES } from './roles.enum';

export interface TeachersModel {
  id: string;
  name: string;
  surname: string;
  dob: string;
  gender: string;
  title: string;
  dateOfJoining: string;
  qualifications: string[];
  active: boolean;
  cell: string;
  email: string;
  address: string;
  dateOfLeaving: string;
  role: ROLES;
}
