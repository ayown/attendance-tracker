export interface Cohort {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCohortDTO {
  name: string;
  description?: string;
}

export interface UpdateCohortDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface Admin {
  id: string;
  userId: string;
  cohortId: string;
  createdAt: Date;
}

export interface AssignAdminDTO {
  userId: string;
  cohortId: string;
}
