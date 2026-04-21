import { ReportsModel } from 'src/app/reports/models/reports.model';

export interface MarkSheetItemModel {
  report: ReportsModel;
  symbols: number[];
}
