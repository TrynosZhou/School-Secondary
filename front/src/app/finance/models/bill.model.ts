import { StudentsModel } from 'src/app/registration/models/students.model';
import { FeesModel } from './fees.model';
import { EnrolsModel } from 'src/app/enrolment/models/enrols.model';

export interface BillModel {
  id?: number;
  student: StudentsModel;
  fees: FeesModel;
  enrol: EnrolsModel;
  date?: Date;
}
