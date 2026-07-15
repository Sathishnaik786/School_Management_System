import { Eye, ShieldAlert, History } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const invigilatorNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: Eye,
    roles: [ExamRole.INVIGILATOR],
  },
  {
    label: 'Live Exam Room',
    href: '/app/exams/invigilator/monitoring',
    icon: ShieldAlert,
    roles: [ExamRole.INVIGILATOR],
    badge: 'Live',
  },
  {
    label: 'Proctor Logs',
    href: '/app/exams/invigilator/logs',
    icon: History,
    roles: [ExamRole.INVIGILATOR],
  },
];
