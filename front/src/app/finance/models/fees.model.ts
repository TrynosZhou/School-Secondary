import { Residence } from 'src/app/enrolment/models/residence.enum';
import { FeesNames } from '../enums/fees-names.enum';

export interface FeesModel {
  id?: number;
  amount: number;
  description: string;
  name: FeesNames;
}
