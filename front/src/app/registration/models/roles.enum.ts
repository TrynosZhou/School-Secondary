export enum ROLES {
  teacher = 'teacher',
  student = 'student',
  parent = 'parent',
  admin = 'admin',
  reception = 'reception',
  hod = 'hod',
  seniorTeacher = 'seniorTeacher',
  deputy = 'deputy',
  head = 'head',
  auditor = 'auditor',
  director = 'director',
  dev = 'dev',
}

/** Roles shown in signup dropdowns (excludes internal/system roles). */
export const ROLES_FOR_SELECTION: ROLES[] = [
  ROLES.teacher,
  ROLES.student,
  ROLES.parent,
];
