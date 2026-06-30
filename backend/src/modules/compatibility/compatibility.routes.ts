import { Router } from 'express';
import { admissionRouter } from '../admission/admission.routes';
import { studentRouter } from '../student/student.routes';
import { attendanceRouter } from '../attendance/attendance.routes';

export const compatibilityRouter = Router();

// Mount legacy prefixes under the compatibility router
compatibilityRouter.use('/admissions', admissionRouter);
compatibilityRouter.use('/students', studentRouter);
compatibilityRouter.use('/attendance', attendanceRouter);
