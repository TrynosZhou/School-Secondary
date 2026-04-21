import { ExamType } from 'src/app/marks/models/examtype.enum';
import { ReportModel } from './report.model';

export interface ReportsModel {
  id?: number;
  termId?: number;
  num: number;
  year: number;
  name: string;
  studentNumber: string;
  report: ReportModel;
  examType?: ExamType;
}
