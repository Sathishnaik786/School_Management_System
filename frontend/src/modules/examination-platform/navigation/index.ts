import { ExamRole } from '../enums/ExamRole';
import { SidebarItem } from '../types/navigation';
import { studentNavigation } from './student.navigation';
import { teacherNavigation } from './teacher.navigation';
import { examCellNavigation } from './examcell.navigation';
import { evaluatorNavigation } from './evaluator.navigation';
import { invigilatorNavigation } from './invigilator.navigation';
import { applicantNavigation } from './applicant.navigation';
import { recruitmentNavigation } from './recruitment.navigation';

export * from './student.navigation';
export * from './teacher.navigation';
export * from './examcell.navigation';
export * from './evaluator.navigation';
export * from './invigilator.navigation';
export * from './applicant.navigation';
export * from './recruitment.navigation';

export const ROLE_NAVIGATION_MAP: Record<ExamRole, SidebarItem[]> = {
  [ExamRole.STUDENT]: studentNavigation,
  [ExamRole.APPLICANT]: applicantNavigation,
  [ExamRole.TEACHER]: teacherNavigation,
  [ExamRole.EXAM_CELL]: examCellNavigation,
  [ExamRole.EVALUATOR]: evaluatorNavigation,
  [ExamRole.INVIGILATOR]: invigilatorNavigation,
  [ExamRole.RECRUITMENT_CANDIDATE]: recruitmentNavigation,
};
