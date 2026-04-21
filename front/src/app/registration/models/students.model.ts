import { ROLES } from './roles.enum';

export interface StudentsModel {
  name: string;
  surname: string;
  dob: Date;
  gender: string;
  idnumber: string;
  dateOfJoining: Date;
  cell: string;
  email: string;
  address: string;
  prevSchool: string;
  studentNumber: string;
  role: ROLES;
}
