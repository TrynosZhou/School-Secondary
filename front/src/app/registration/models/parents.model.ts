export interface ParentsModel {
  email: string;
  surname: string;
  sex: string;
  title: string;
  idnumber: string;
  cell: string;
  address: string;
  /** Linked children (when loaded from API with relations) */
  students?: { studentNumber: string; name?: string; surname?: string }[];
}
