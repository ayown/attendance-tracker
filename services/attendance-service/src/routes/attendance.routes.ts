import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireMentor } from '../middleware/role.middleware.js';
import {
  getScheduleAttendance,
  markAttendance,
  updateAttendanceStatus,
} from '../controllers/attendance.controller.js';

export const attendanceRouter = Router();

attendanceRouter.use(authenticate);

attendanceRouter.post('/mark', requireMentor, markAttendance);
attendanceRouter.get('/schedule/:scheduleId', requireMentor, getScheduleAttendance);
attendanceRouter.put('/:id/status', requireMentor, updateAttendanceStatus);
