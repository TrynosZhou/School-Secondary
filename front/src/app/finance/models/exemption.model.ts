import { ExemptionType } from '../enums/exemption-type.enum'; // Adjust path if needed
import { StudentsModel } from 'src/app/registration/models/students.model'; // Assuming StudentsModel exists

export interface ExemptionModel {
  id?: number;
  student: StudentsModel; // Assuming you might want to display student details related to the exemption
  type: ExemptionType;
  fixedAmount?: number; // Optional, as it depends on ExemptionType
  percentageAmount?: number; // Optional, as it depends on ExemptionType
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
