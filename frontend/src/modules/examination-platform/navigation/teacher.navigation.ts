import { BookOpen, Calendar, Edit3, Award } from 'lucide-react';
import { SidebarItem } from '../types/navigation';
import { ExamRole } from '../enums/ExamRole';

export const teacherNavigation: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/app/exams/dashboard',
    icon: BookOpen,
    roles: [ExamRole.TEACHER],
  },
  {
    label: 'Timetable Scheduling',
    href: '/app/exams/teacher/schedule',
    icon: Calendar,
    roles: [ExamRole.TEACHER],
  },
  {
    label: 'Marks Entry',
    href: '/app/exams/teacher/marks',
    icon: Edit3,
    roles: [ExamRole.TEACHER],
  },
  {
    label: 'Evaluations',
    href: '/app/exams/teacher/evaluations',
    icon: Award,
    roles: [ExamRole.TEACHER],
  },
];
