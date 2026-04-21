import { ReportsModel } from './reports.model';

export interface HeadCommentModel {
  comment: string;
  report: ReportsModel;
}

// New model for saving the class / form teacher's comment
export interface TeacherCommentModel {
  comment: string;
  report: ReportsModel;
}

export interface GenerateRoleCommentModel {
  role: 'formTeacher' | 'headTeacher';
  report: ReportsModel;
}

export interface GenerateRoleCommentResponse {
  success: boolean;
  comment: string;
  source: 'openai' | 'fallback';
  error?: string;
}

