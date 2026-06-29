import { ROUTES } from '../constants/routes';
import { PERMISSIONS } from '../constants/permissions';

export interface NavigationItem {
    title: string;
    path: string;
    permission?: string;
    icon: string;
    badge?: string;
    children?: NavigationItem[];
}

export const NAVIGATION_CONFIG: NavigationItem[] = [
    {
        title: 'Dashboard',
        path: ROUTES.APP.DASHBOARD,
        icon: 'LayoutDashboard',
    },
    {
        title: 'Admissions',
        path: '/app/admissions',
        permission: PERMISSIONS.ADMISSION.VIEW_OWN,
        icon: 'UserPlus',
        children: [
            {
                title: 'Overview',
                path: '/app/admissions/dashboard',
                permission: 'admission.review',
                icon: 'LayoutDashboard',
            },
            {
                title: 'Analytics',
                path: '/app/admissions/analytics',
                permission: 'admission.review',
                icon: 'BarChart2',
            },
            {
                title: 'Inquiry CRM',
                path: '/app/admissions/inquiries',
                permission: 'admission.review',
                icon: 'PhoneCall',
            },
            {
                title: 'Apply Now',
                path: ROUTES.ADMISSION.APPLY,
                icon: 'FilePlus',
            },
            {
                title: 'Application Wizard',
                path: '/app/admissions/wizard',
                icon: 'FileText',
            },
            {
                title: 'My Applications',
                path: ROUTES.ADMISSION.MY,
                icon: 'FolderOpen',
            },
            {
                title: 'Review Desk',
                path: ROUTES.ADMISSION.LIST,
                permission: PERMISSIONS.ADMISSION.REVIEW,
                icon: 'ShieldCheck',
            },
            {
                title: 'Doc Verification',
                path: '/app/admissions/verification',
                permission: 'admission.review',
                icon: 'ClipboardCheck',
            },
            {
                title: 'Entrance Exams',
                path: '/app/admissions/exams',
                permission: 'admission.review',
                icon: 'GraduationCap',
            },
            {
                title: 'Interview Desk',
                path: '/app/admissions/interviews',
                permission: 'admission.review',
                icon: 'MessageSquare',
            },
            {
                title: 'Merit Desk',
                path: '/app/admissions/merit',
                permission: 'admission.review',
                icon: 'Award',
            },
            {
                title: 'Offer Letters',
                path: '/app/admissions/offers',
                permission: 'admission.review',
                icon: 'MailOpen',
            },
            {
                title: 'Fee Collection',
                path: '/app/admissions/fees',
                permission: 'admission.review',
                icon: 'CreditCard',
            },
            {
                title: 'Enrollment Handoff',
                path: '/app/admissions/enrollment',
                permission: 'admission.review',
                icon: 'UserCheck',
            },
            {
                title: 'Module Reports',
                path: '/app/admissions/reports',
                permission: 'admission.review',
                icon: 'FileSpreadsheet',
            },
            {
                title: 'Module Settings',
                path: '/app/admissions/settings',
                permission: 'admission.review',
                icon: 'Settings',
            }
        ]
    },
    {
        title: 'Student SIS',
        path: '/app/students-root',
        permission: PERMISSIONS.STUDENT.VIEW,
        icon: 'Users',
        children: [
            {
                title: 'Student Master',
                path: ROUTES.STUDENT.LIST,
                icon: 'UserSquare',
            },
            {
                title: 'Section Transfers',
                path: ROUTES.STUDENT.PROMOTE,
                permission: PERMISSIONS.STUDENT.PROMOTE,
                icon: 'ArrowLeftRight',
            }
        ]
    },
    {
        title: 'Attendance',
        path: '/app/attendance-root',
        permission: PERMISSIONS.ATTENDANCE.MARK,
        icon: 'CalendarCheck',
        children: [
            {
                title: 'Mark Register',
                path: ROUTES.ATTENDANCE.MARK,
                icon: 'ClipboardList',
            },
            {
                title: 'Leave Applications',
                path: ROUTES.ATTENDANCE.LEAVES,
                icon: 'PlaneTakeoff',
            }
        ]
    }
];
