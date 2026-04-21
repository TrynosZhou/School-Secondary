import { StudentsModel } from 'src/app/registration/models/students.model';

export interface RegisterModel {
  id?: number;
  name: string;
  num: number;
  year: number;
  present?: boolean;
  date?: Date;
  student: StudentsModel;
}
