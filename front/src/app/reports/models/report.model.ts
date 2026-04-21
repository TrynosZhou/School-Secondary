import { ExamType } from 'src/app/marks/models/examtype.enum';
import { SubjectInfoModel } from './subject-info.model';

export interface ReportModel {
  studentNumber: string;
  name: string;
  surname: string;
  classPosition: number;
  formPosition: number;
  className: string;
  termNumber: number;
  termYear: number;
  points?: number;
  percentageAverge: number;
  title: string;
  percentageMark: number;
  classTrComment: string;
  headComment: string;
  subjectsTable: SubjectInfoModel[];
  classSize: number;
  subjectsPassed: number;
  symbols: number[];
  examType?: ExamType;
}
