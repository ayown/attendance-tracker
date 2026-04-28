export enum Shift {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

export interface Student {
  id: string;
  userId: string;
  regno: string;
  shift: Shift;
  batchId?: string;
  cohortId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Batch {
  id: string;
  name: string;
  cohortId: string;
  createdAt: Date;
}

export interface CreateStudentDTO {
  email: string;
  name: string;
  regno: string;
  shift: Shift;
  cohortId: string;
}

export interface BulkCreateStudentsDTO {
  students: CreateStudentDTO[];
}

export interface CreateBatchDTO {
  name: string;
  cohortId: string;
}

export interface CSVStudentRow {
  Name: string;
  Email: string;
  Regno: string;
  Shift: string;
}
