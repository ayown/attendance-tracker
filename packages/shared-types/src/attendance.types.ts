export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export enum AttendanceMethod {
  QR_SCAN = 'QR_SCAN',
  MANUAL_CODE = 'MANUAL_CODE',
  ADMIN_OVERRIDE = 'ADMIN_OVERRIDE',
}

export enum CodeType {
  QR_CODE = 'QR_CODE',
  MANUAL_CODE = 'MANUAL_CODE',
}

export interface Attendance {
  id: string;
  studentId: string;
  scheduleId: string;
  status: AttendanceStatus;
  markedBy: string;
  method: AttendanceMethod;
  codeId?: string;
  remarks?: string;
  createdAt: Date;
}

export interface AttendanceCode {
  id: string;
  studentId: string;
  scheduleId: string;
  code: string;
  qrData: string;
  codeType: CodeType;
  expiresAt: Date;
  isUsed: boolean;
  usedAt?: Date;
  createdAt: Date;
}

export interface MarkAttendanceDTO {
  code: string;
  scheduleId: string;
}
