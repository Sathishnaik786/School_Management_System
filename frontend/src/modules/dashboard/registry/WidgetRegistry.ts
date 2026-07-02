import { DashboardWidget } from '../types/dashboard.types';
import { DASHBOARD_CONSTANTS } from '../constants/DashboardConstants';

export const WIDGET_REGISTRY: Record<string, DashboardWidget> = {
    // Admin Widgets
    'admin.kpi.students': {
        id: 'admin.kpi.students',
        title: 'Total Students',
        type: 'kpi',
        component: 'AdminKPIStudents',
        permissionConfig: { permission: 'dashboard.admin.view' }
    },
    'admin.kpi.staff': {
        id: 'admin.kpi.staff',
        title: 'Total Staff',
        type: 'kpi',
        component: 'AdminKPIStaff',
        permissionConfig: { permission: 'dashboard.admin.view' }
    },
    'admin.kpi.admissions': {
        id: 'admin.kpi.admissions',
        title: 'New Admissions',
        type: 'kpi',
        component: 'AdminKPIAdmissions',
        permissionConfig: { permission: 'dashboard.admin.view' }
    },
    'admin.chart.enrollment_trends': {
        id: 'admin.chart.enrollment_trends',
        title: 'Enrollment Trends',
        type: 'chart',
        component: 'AdminEnrollmentChart',
        permissionConfig: { permission: 'dashboard.admin.view' }
    },

    // Faculty Widgets
    'faculty.kpi.classes_today': {
        id: 'faculty.kpi.classes_today',
        title: 'Classes Today',
        type: 'kpi',
        component: 'FacultyKPIClasses',
        permissionConfig: { permission: 'dashboard.faculty.view' }
    },
    'faculty.kpi.my_sections': {
        id: 'faculty.kpi.my_sections',
        title: 'My Sections',
        type: 'kpi',
        component: 'FacultyKPISections',
        permissionConfig: { permission: 'dashboard.faculty.view' }
    },
    'faculty.kpi.pending_works': {
        id: 'faculty.kpi.pending_works',
        title: 'Pending Submissions',
        type: 'kpi',
        component: 'FacultyKPIPending',
        permissionConfig: { permission: 'dashboard.faculty.view' }
    },

    // Student & Parent Widgets
    'student.kpi.attendance': {
        id: 'student.kpi.attendance',
        title: 'Attendance Rate',
        type: 'kpi',
        component: 'StudentKPIAttendance',
        permissionConfig: { permission: 'student.view' }
    },
    'student.kpi.fees_due': {
        id: 'student.kpi.fees_due',
        title: 'Outstanding Fees',
        type: 'kpi',
        component: 'StudentKPIFees',
        permissionConfig: { permission: 'student.view' }
    },
    'student.list.timetable': {
        id: 'student.list.timetable',
        title: 'Daily Schedule',
        type: 'custom',
        component: 'StudentTimetableWidget',
        permissionConfig: { permission: 'student.view' }
    },

    // Admissions Workspaces
    'reception.kpi.walkins': {
        id: 'reception.kpi.walkins',
        title: 'Walk-ins Today',
        type: 'kpi',
        component: 'ReceptionKPIWalkins',
        permissionConfig: { permission: 'admission.crm.view' }
    },
    'counselor.kpi.leads': {
        id: 'counselor.kpi.leads',
        title: 'Assigned Leads',
        type: 'kpi',
        component: 'CounselorKPILeads',
        permissionConfig: { permission: 'admission.crm.view' }
    },
    'officer.kpi.reviews': {
        id: 'officer.kpi.reviews',
        title: 'Pending Reviews',
        type: 'kpi',
        component: 'OfficerKPIReviews',
        permissionConfig: { permission: 'admission.review' }
    },
    'finance.kpi.ledger': {
        id: 'finance.kpi.ledger',
        title: 'Outstanding Dues',
        type: 'kpi',
        component: 'FinanceKPILedger',
        permissionConfig: { permission: 'fee.verify' }
    },
    'principal.kpi.conversions': {
        id: 'principal.kpi.conversions',
        title: 'Funnel Yield',
        type: 'kpi',
        component: 'PrincipalKPIConversions',
        permissionConfig: { permission: 'admission.approve' }
    },

    // Exam Widgets
    'exam.kpi.upcoming': {
        id: 'exam.kpi.upcoming',
        title: 'Upcoming Exams',
        type: 'kpi',
        component: 'ExamKPIUpcoming',
        permissionConfig: { permission: 'exam.view' }
    },
    'exam.chart.grades': {
        id: 'exam.chart.grades',
        title: 'Performance Distribution',
        type: 'chart',
        component: 'ExamGradesChart',
        permissionConfig: { permission: 'exam.view' }
    }
};

export const getWidgetById = (id: string): DashboardWidget | undefined => {
    return WIDGET_REGISTRY[id];
};

export default WIDGET_REGISTRY;
