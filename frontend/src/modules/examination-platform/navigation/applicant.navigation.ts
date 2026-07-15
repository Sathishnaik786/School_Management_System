import { UserCheck, Compass, FileText } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const applicantNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: UserCheck,
    roles: [ExamRole.APPLICANT],
  },
  {
    label: 'Entrance Tests',
    href: '/app/exams/applicant/tests',
    icon: Compass,
    roles: [ExamRole.APPLICANT],
  },
  {
    label: 'Admissions Inquiry',
    href: '/exam/help',
    icon: FileText,
    roles: [ExamRole.APPLICANT],
  },
];
