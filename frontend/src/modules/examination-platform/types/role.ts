import { ExamRole } from '../enums/ExamRole';

export type PortalRole = ExamRole;
export type UserRole = 'ADMIN' | 'SUPERADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'EXAM_CELL_ADMIN' | 'FACULTY' | 'HEAD_OF_INSTITUTE' | 'ADMISSION_OFFICER' | 'ACCOUNTANT' | 'COUNSELOR' | string;
