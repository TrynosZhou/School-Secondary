export interface ReportReleaseSettings {
  id: string;
  termNumber: number;
  termYear: number;
  examType: 'Mid Term' | 'End Of Term';
  isReleased: boolean;
  releaseDate: Date | null;
  scheduledReleaseDate: Date | null;
  releasedBy: string | null;
  releasedByUser?: {
    id: string;
    username: string;
    role: string;
  } | null;
  releaseNotes: string | null;
  sendNotification: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReportReleaseDto {
  termNumber: number;
  termYear: number;
  examType: 'Mid Term' | 'End Of Term';
  isReleased?: boolean;
  scheduledReleaseDate?: string;
  releaseNotes?: string;
  sendNotification?: boolean;
}

export interface UpdateReportReleaseDto {
  isReleased?: boolean;
  scheduledReleaseDate?: string;
  releaseNotes?: string;
  sendNotification?: boolean;
}

export interface BulkUpdateReportReleaseDto {
  updates: BulkUpdateItemDto[];
}

export interface BulkUpdateItemDto {
  id: string;
  isReleased: boolean;
  releaseNotes?: string;
  sendNotification?: boolean;
}

export interface ReportReleaseStatus {
  isReleased: boolean;
}

export interface GeneratedExamSession {
  termNumber: number;
  termYear: number;
  examType: 'Mid Term' | 'End Of Term';
  isReleased?: boolean;
  sendNotification?: boolean;
}
