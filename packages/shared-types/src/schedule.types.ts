import type { Shift } from './student.types.js';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export interface Schedule {
  id: string;
  batchId: string;
  dayOfWeek: DayOfWeek;
  period: number;
  shift: Shift;
  startTime: string;
  endTime: string;
  mentorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduleDTO {
  batchId: string;
  dayOfWeek: DayOfWeek;
  period: number;
  shift: Shift;
  startTime: string;
  endTime: string;
  mentorId?: string;
}

export interface Mentor {
  id: string;
  userId: string;
  cohortId: string;
  createdAt: Date;
}
