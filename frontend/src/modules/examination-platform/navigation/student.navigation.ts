import { BookOpen, Award, FileText, HelpCircle, PenTool } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const studentNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: BookOpen,
    roles: [ExamRole.STUDENT],
  },
  {
    label: 'My Exams',
    href: '/app/exams/student/my-exams',
    icon: FileText,
    roles: [ExamRole.STUDENT],
    badge: 'New',
  },
  {
    label: 'Attempt Exam',
    href: '/app/exams/student/attempt',
    icon: PenTool,
    roles: [ExamRole.STUDENT],
    badge: 'Live',
  },
  {
    label: 'Results & Transcript',
    href: '/app/exams/student/results',
    icon: Award,
    roles: [ExamRole.STUDENT],
  },
  {
    label: 'Verification & Help',
    href: '/exam/help',
    icon: HelpCircle,
    roles: [ExamRole.STUDENT],
  },
];
