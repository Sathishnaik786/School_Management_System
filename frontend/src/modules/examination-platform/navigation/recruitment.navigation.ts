import { ClipboardCheck, Compass, HelpCircle } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const recruitmentNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: ClipboardCheck,
    roles: [ExamRole.RECRUITMENT_CANDIDATE],
  },
  {
    label: 'Screening Tests',
    href: '/app/exams/candidate/screening',
    icon: Compass,
    roles: [ExamRole.RECRUITMENT_CANDIDATE],
  },
  {
    label: 'Help Desk',
    href: '/exam/help',
    icon: HelpCircle,
    roles: [ExamRole.RECRUITMENT_CANDIDATE],
  },
];
