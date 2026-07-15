import { ClipboardCheck, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const evaluatorNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: ClipboardCheck,
    roles: [ExamRole.EVALUATOR],
  },
  {
    label: 'Grading Queue',
    href: '/app/exams/evaluator/queue',
    icon: FileSpreadsheet,
    roles: [ExamRole.EVALUATOR],
    badge: 5,
  },
  {
    label: 'Completed Grades',
    href: '/app/exams/evaluator/completed',
    icon: CheckCircle,
    roles: [ExamRole.EVALUATOR],
  },
];
