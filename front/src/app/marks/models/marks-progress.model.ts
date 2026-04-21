import { SubjectsModel } from './subjects.model';

export interface MarksProgressModel {
  subject: SubjectsModel;

  className: string;
  totalStudents: number;
  marksEntered: number;
  progress: number; //percentage
}
