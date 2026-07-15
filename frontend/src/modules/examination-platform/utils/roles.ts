import { ExamRole } from '../enums/ExamRole';

export const resolveExamRole = (roles: string[]): ExamRole => {
  const normalized = roles.map(r => r.toUpperCase());
  if (normalized.includes('SUPERADMIN') || normalized.includes('ADMIN') || normalized.includes('EXAM_CELL_ADMIN')) {
    return ExamRole.EXAM_CELL;
  }
  if (normalized.includes('TEACHER') || normalized.includes('FACULTY')) {
    return ExamRole.TEACHER;
  }
  if (normalized.includes('EVALUATOR')) {
    return ExamRole.EVALUATOR;
  }
  if (normalized.includes('INVIGILATOR')) {
    return ExamRole.INVIGILATOR;
  }
  if (normalized.includes('APPLICANT')) {
    return ExamRole.APPLICANT;
  }
  if (normalized.includes('RECRUITMENT_CANDIDATE')) {
    return ExamRole.RECRUITMENT_CANDIDATE;
  }
  return ExamRole.STUDENT;
};
