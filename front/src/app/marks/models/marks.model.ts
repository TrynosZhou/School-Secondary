import { StudentsModel } from 'src/app/registration/models/students.model';
import { SubjectsModel } from './subjects.model';
import { ExamType } from './examtype.enum';

export interface MarksModel {
  id?: number;
  termId?: number;
  num: number;
  name: string;
  year: number;
  mark: number | null;
  comment: string;
  subject: SubjectsModel;
  student: StudentsModel;
  examType?: ExamType;
}
