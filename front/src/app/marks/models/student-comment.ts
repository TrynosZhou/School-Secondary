import { StudentsModel } from 'src/app/registration/models/students.model';
import { TeachersModel } from 'src/app/registration/models/teachers.model';
import { ExamType } from './examtype.enum';
import { Residence } from 'src/app/enrolment/models/residence.enum';

export interface StudentComment {
  id?: number;
  comment: string;
  name: string;
  num: number;
  year: number;
  examType?: ExamType;
  student: StudentsModel;
  teacher?: TeachersModel;
  residence: Residence;
}
