export type TermType = 'regular' | 'vacation';

export interface TermsModel {
  id?: number;
  num: number;
  year: number;
  startDate: Date;
  endDate: Date;
  type?: TermType;
  label?: string | null;
}
