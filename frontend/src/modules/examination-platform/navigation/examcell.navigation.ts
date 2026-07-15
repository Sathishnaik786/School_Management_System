import { Layers, Calendar, Clipboard, Users, ShieldAlert } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const examCellNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: Layers,
    roles: [ExamRole.EXAM_CELL],
  },
  {
    label: 'Timetable Manager',
    href: '/app/exams/admin/timetable',
    icon: Calendar,
    roles: [ExamRole.EXAM_CELL],
  },
  {
    label: 'Question Banks',
    href: '/app/exams/admin/questions',
    icon: Clipboard,
    roles: [ExamRole.EXAM_CELL],
  },
  {
    label: 'Candidate Enrolls',
    href: '/app/exams/admin/candidates',
    icon: Users,
    roles: [ExamRole.EXAM_CELL],
  },
  {
    label: 'Proctor Control',
    href: '/app/exams/admin/monitoring',
    icon: ShieldAlert,
    roles: [ExamRole.EXAM_CELL],
  },
];
