import React from 'react';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/Login';
import UnauthorizedPage from '../pages/Unauthorized';
import { FacultyListPage } from '../modules/academic/pages/FacultyListPage';
import { StaffListPage } from '../modules/academic/pages/StaffListPage';
import { FacultyMySubjects } from '../modules/dashboard/components/FacultyMySubjects';
import { AdmissionForm } from '../modules/admission/pages/AdmissionForm';
import { MyApplications } from '../modules/admission/pages/MyApplications';
import { InstructionsPage } from '../modules/admission/pages/InstructionsPage';
import { TestPortal } from '../modules/admission/pages/TestPortal';
import { SuccessPage } from '../modules/admission/pages/SuccessPage';
import { MonitoringDashboard } from '../modules/admission/pages/MonitoringDashboard';
import { MyChildren } from '../modules/student/pages/MyChildren';
import { AcademicHistory } from '../modules/student/pages/AcademicHistory';
import { DashboardPage as StudentDashboardPage } from '../modules/student/pages/DashboardPage';
import { StudentListPage } from '../modules/student/pages/StudentListPage';
import { StudentDetailsPage } from '../modules/student/pages/StudentDetailsPage';
import { StudentProfilePage } from '../modules/student/pages/StudentProfilePage';
import { ParentGuardianPage } from '../modules/student/pages/ParentGuardianPage';
import { AcademicRecordPage } from '../modules/student/pages/AcademicRecordPage';
import { ClassAllocationPage } from '../modules/student/pages/ClassAllocationPage';
import { PromotionPage } from '../modules/student/pages/PromotionPage';
import { TransferPage } from '../modules/student/pages/TransferPage';
import { IdentityCardPage } from '../modules/student/pages/IdentityCardPage';
import { TimelinePage } from '../modules/student/pages/TimelinePage';
import { AuditLogsPage } from '../modules/student/pages/AuditLogsPage';
import { ReportsPage as StudentReportsPage } from '../modules/student/pages/ReportsPage';
import { SettingsPage as StudentSettingsPage } from '../modules/student/pages/SettingsPage';
import { ImportWizardPage } from '../modules/student/pages/ImportWizardPage';
import { AdmissionHistoryPage } from '../modules/student/pages/AdmissionHistoryPage';
import { ClassList } from '../modules/academic/pages/ClassList';
import { SectionList } from '../modules/academic/pages/SectionList';
import { DepartmentsListPage } from '../modules/academic/pages/DepartmentsListPage';
import { AssignmentManagement } from '../modules/academic/pages/AssignmentManagement';
import { MyAssignments } from '../modules/academic/pages/MyAssignments';
import { MyStudents } from '../modules/academic/pages/MyStudents';
import { SubjectManagement } from '../modules/exam/pages/SubjectManagement';
import { ExamManagement } from '../modules/exam/pages/ExamManagement';
import { AcademicYearManagement } from '../modules/academic/pages/AcademicYearManagement';
import { BulkOperations } from '../modules/admin/pages/BulkOperations';
import { ExecutiveOverview } from '../modules/common/executive/ExecutiveOverview';
import { MarksEntry } from '../modules/exam/pages/MarksEntry';
import { StudentResults } from '../modules/exam/pages/StudentResults';
import { MyHallTicket } from '../modules/exam/pages/MyHallTicket';
import { MyReportCard } from '../modules/exam/pages/MyReportCard';
import { ExamHallManagement } from '../modules/exam/pages/ExamHallManagement';
import { FacultyExamDashboard } from '../modules/exam/pages/FacultyExamDashboard';
import { FacultyInvigilationView } from '../modules/exam/pages/FacultyInvigilationView';
import { MyExams } from '../modules/exam/pages/MyExams';
import { ExamDashboard } from '../modules/exam/pages/ExamDashboard';
import { ExamTimetablePage } from '../modules/exam/pages/ExamTimetablePage';
import { ExamEligibilityPage } from '../modules/exam/pages/ExamEligibilityPage';
import { ExamHallTickets } from '../modules/exam/pages/ExamHallTickets';
import { ExamSeating } from '../modules/exam/pages/ExamSeating';
import { ExamQuestionPapers } from '../modules/exam/pages/ExamQuestionPapers';
import { ExamResults } from '../modules/exam/pages/ExamResults';
import { ExamAnalytics } from '../modules/exam/pages/ExamAnalytics';
import { AttendanceMarking } from '../modules/attendance/pages/AttendanceMarking';
import { AdminAttendanceDashboard } from '../modules/attendance/pages/AdminAttendanceDashboard';
import { SectionAttendanceView } from '../modules/attendance/pages/SectionAttendanceView';
import { MyAttendance } from '../modules/attendance/pages/MyAttendance';
import { DashboardPage as AttendanceDashboardPage } from '../modules/attendance/pages/DashboardPage';
import { DailyAttendancePage } from '../modules/attendance/pages/DailyAttendancePage';
import { PeriodAttendancePage } from '../modules/attendance/pages/PeriodAttendancePage';
import { StudentAttendancePage } from '../modules/attendance/pages/StudentAttendancePage';
import { LeaveManagementPage } from '../modules/attendance/pages/LeaveManagementPage';
import { CorrectionPage } from '../modules/attendance/pages/CorrectionPage';
import { HolidayPage } from '../modules/attendance/pages/HolidayPage';
import { BiometricPage } from '../modules/attendance/pages/BiometricPage';
import { ReportsPage as AttendanceReportsPage } from '../modules/attendance/pages/ReportsPage';
import { AnalyticsPage as AttendanceAnalyticsPage } from '../modules/attendance/pages/AnalyticsPage';
import { SettingsPage as AttendanceSettingsPage } from '../modules/attendance/pages/SettingsPage';
import { TimetableBuilder } from '../modules/timetable/pages/TimetableBuilder';
import { MyTimetable } from '../modules/timetable/pages/MyTimetable';
import { FeeStructureManagement } from '../modules/fees/pages/FeeStructureManagement';
import { StudentFeeAssignment } from '../modules/fees/pages/StudentFeeAssignment';
import { PaymentEntry } from '../modules/fees/pages/PaymentEntry';
import { MyFees } from '../modules/fees/pages/MyFees';
import { AdminFeeLedger } from '../modules/fees/pages/AdminFeeLedger';
import { FinanceDashboard } from '../modules/fees/pages/FinanceDashboard';
import { DemandManagement } from '../modules/fees/pages/DemandManagement';
import { ReceiptCenter } from '../modules/fees/pages/ReceiptCenter';
import { StudentLedger } from '../modules/fees/pages/StudentLedger';
import { Waivers } from '../modules/fees/pages/Waivers';
import { Refunds } from '../modules/fees/pages/Refunds';
import { FinanceReports } from '../modules/fees/pages/FinanceReports';
import { FinanceSettings } from '../modules/fees/pages/FinanceSettings';
import { TransportSetup } from '../modules/transport/pages/TransportSetup';
import { TransportBulkAssignmentPage } from '../modules/transport/pages/TransportBulkAssignmentPage';
import { StudentTransportAssignment } from '../modules/transport/pages/StudentTransportAssignment';
import { MyTransport } from '../modules/transport/pages/MyTransport';
import { TransportAnalytics } from '../modules/transport/pages/TransportAnalytics';
import { AdminDashboard } from '../modules/dashboard/pages/AdminDashboard';
import { TransportAdminDashboard } from '../modules/transport/pages/TransportAdminDashboard';
import { TransportDebugPage } from '../modules/transport/pages/TransportDebugPage';
import { LiveTripMonitor } from '../modules/transport/pages/LiveTripMonitor';
import { IncidentsPage } from '../modules/transport/pages/IncidentsPage';
import { ManifestPage } from '../modules/transport/pages/ManifestPage';
import { DriverDashboard } from '../modules/transport/pages/DriverDashboard';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { WorkflowDashboard } from '../modules/workflows/pages/WorkflowDashboard';
import { WorkflowBuilder } from '../modules/workflows/pages/WorkflowBuilder';
import { TaskCenter } from '../modules/workflows/pages/TaskCenter';
import { WorkflowAnalytics } from '../modules/workflows/pages/WorkflowAnalytics';
import { ImportHistoryPage } from '../modules/import/pages/ImportHistory';
import { StudentDashboard } from '../modules/dashboard/pages/StudentDashboard';
import WorkspaceDashboard from '../modules/admission/pages/Workspace';
import Applicant360Page from '../modules/admission/pages/Applicant360';
import PipelinePage from '../modules/admission/pages/Pipeline';
import AnalyticsPage from '../modules/admission/pages/Analytics';
import ReportsPage from '../modules/admission/pages/Reports';
import { InquiryListPage } from '../modules/admission/pages/InquiryListPage';
import { ApplicationWizardPage } from '../modules/admission/pages/ApplicationWizardPage';
import { DocumentVerificationPage } from '../modules/admission/pages/DocumentVerificationPage';
import { EntranceExamPage } from '../modules/admission/pages/EntranceExamPage';
import { InterviewPage } from '../modules/admission/pages/InterviewPage';
import { MeritListPage } from '../modules/admission/pages/MeritListPage';
import { OfferLetterPage } from '../modules/admission/pages/OfferLetterPage';
import { FeeCollectionPage as AdmissionFeeCollectionPage } from '../modules/admission/pages/FeeCollectionPage';
import { EnrollmentPage } from '../modules/admission/pages/EnrollmentPage';
import { SettingsPage as AdmissionSettingsPage } from '../modules/admission/pages/SettingsPage';
import { AssessmentSettings } from '../modules/assessment/foundation/pages/AssessmentSettings';
import { WorkflowBuilder as AssessmentWorkflowBuilder } from '../modules/assessment/foundation/pages/WorkflowBuilder';
import { QuestionBankPage } from '../modules/assessment/question-bank/pages/QuestionBankPage';
import { QuestionEditorPage } from '../modules/assessment/question-bank/pages/QuestionEditorPage';
import { QuestionPreviewPage } from '../modules/assessment/question-bank/pages/QuestionPreviewPage';
import { QuestionHistoryPage } from '../modules/assessment/question-bank/pages/QuestionHistoryPage';
import { QuestionImportPage } from '../modules/assessment/question-bank/pages/QuestionImportPage';
import { QuestionReviewQueuePage } from '../modules/assessment/question-bank/pages/QuestionReviewQueuePage';
import { QuestionFolderPage } from '../modules/assessment/question-bank/pages/QuestionFolderPage';
import { QuestionAssetsPage } from '../modules/assessment/question-bank/pages/QuestionAssetsPage';
import { TemplateDashboardPage } from '../modules/assessment/template-builder/pages/TemplateDashboardPage';
import { TemplateEditorPage } from '../modules/assessment/template-builder/pages/TemplateEditorPage';
import { TemplatePreviewPage } from '../modules/assessment/template-builder/pages/TemplatePreviewPage';
import { TemplateHistoryPage } from '../modules/assessment/template-builder/pages/TemplateHistoryPage';
import { BlueprintDashboardPage } from '../modules/assessment/blueprint-builder/pages/BlueprintDashboardPage';
import { BlueprintEditorPage } from '../modules/assessment/blueprint-builder/pages/BlueprintEditorPage';
import { BlueprintPreviewPage } from '../modules/assessment/blueprint-builder/pages/BlueprintPreviewPage';
import { BlueprintHistoryPage } from '../modules/assessment/blueprint-builder/pages/BlueprintHistoryPage';
import { AssessmentDashboard } from '../modules/assessment/foundation/pages/AssessmentDashboard';

import { PaperDashboardPage } from '../modules/assessment/paper-generator/pages/PaperDashboardPage';
import { PaperGeneratorWizard } from '../modules/assessment/paper-generator/pages/PaperGeneratorWizard';
import { PaperPreviewPage } from '../modules/assessment/paper-generator/pages/PaperPreviewPage';

import { EvaluationDashboardPage } from '../modules/assessment/evaluation/pages/EvaluationDashboardPage';
import { EvaluationWorkspacePage } from '../modules/assessment/evaluation/pages/EvaluationWorkspacePage';
import { RubricDesignerPage } from '../modules/assessment/evaluation/pages/RubricDesignerPage';
import { ModerationQueuePage } from '../modules/assessment/evaluation/pages/ModerationQueuePage';
import { RevaluationPage } from '../modules/assessment/evaluation/pages/RevaluationPage';
import { GradeCalculationPage } from '../modules/assessment/evaluation/pages/GradeCalculationPage';
import { EvaluationAnalyticsPage } from '../modules/assessment/evaluation/pages/EvaluationAnalyticsPage';

import { ResultDashboardPage } from '../modules/assessment/result-engine/pages/ResultDashboardPage';
import { StudentResultsPage } from '../modules/assessment/result-engine/pages/StudentResultsPage';
import { RankingPage } from '../modules/assessment/result-engine/pages/RankingPage';
import { PromotionPage as AssessmentPromotionPage } from '../modules/assessment/result-engine/pages/PromotionPage';
import { GradeCardPage } from '../modules/assessment/result-engine/pages/GradeCardPage';
import { TranscriptPage } from '../modules/assessment/result-engine/pages/TranscriptPage';
import { ResultAnalyticsPage } from '../modules/assessment/result-engine/pages/ResultAnalyticsPage';

import { AssessmentAnalyticsDashboard } from '../modules/assessment/analytics/pages/AssessmentAnalyticsDashboard';
import { QuestionAnalyticsPage } from '../modules/assessment/analytics/pages/QuestionAnalyticsPage';
import { COAttainmentPage } from '../modules/assessment/analytics/pages/COAttainmentPage';
import { POAttainmentPage } from '../modules/assessment/analytics/pages/POAttainmentPage';
import { LearningGapPage } from '../modules/assessment/analytics/pages/LearningGapPage';
import { AccreditationPage } from '../modules/assessment/analytics/pages/AccreditationPage';

import { AcademicRecordsDashboard } from '../modules/assessment/academic-records/pages/AcademicRecordsDashboard';
import { AcademicHistoryPage } from '../modules/assessment/academic-records/pages/AcademicHistoryPage';
import { DegreeAuditPage } from '../modules/assessment/academic-records/pages/DegreeAuditPage';
import { GraduationDashboard } from '../modules/assessment/academic-records/pages/GraduationDashboard';
import { TranscriptCenterPage } from '../modules/assessment/academic-records/pages/TranscriptCenterPage';
import { AcademicStandingPage } from '../modules/assessment/academic-records/pages/AcademicStandingPage';

import { AttendanceDashboard } from '../modules/attendance/pages/AttendanceDashboard';
import { AttendanceCalendarManager } from '../modules/attendance/pages/AttendanceCalendarManager';
import { AttendanceExceptionsPage } from '../modules/attendance/pages/AttendanceExceptionsPage';
import { DefaultersPage } from '../modules/attendance/pages/DefaultersPage';
import { AttendanceAnalyticsPage as AttendanceAnalyticsPageV2 } from '../modules/attendance/pages/AttendanceAnalyticsPage';
import { DeviceMonitoringPage } from '../modules/attendance/pages/DeviceMonitoringPage';

export interface RouteConfig {
    path: string;
    element: React.ReactNode;
    permission?: string;
    permissions?: string[]; // For AnyPermissionGuard
    layout: 'dashboard' | 'exam_admin' | 'admission_workspace' | 'none';
    guardType?: 'exam_operation' | 'admission_inquiry' | 'admission_application' | 'none';
}

export const ROUTE_REGISTRY: RouteConfig[] = [
    // CORE DASHBOARDS
    { path: 'dashboard', element: <Dashboard />, layout: 'dashboard' },
    { path: 'student/dashboard', element: <StudentDashboard />, layout: 'dashboard', permission: 'student.dashboard.view' },
    { path: 'admin/dashboard', element: <AdminDashboard />, layout: 'dashboard', permission: 'admin.dashboard.view' },
    { path: 'assessment/dashboard', element: <AssessmentDashboard />, layout: 'dashboard', permission: 'assessment.dashboard.view' },
    { path: 'executive', element: <ExecutiveOverview />, layout: 'dashboard', permission: 'admin.dashboard.view' },

    // WORKSPACE PROFILE & SETTINGS
    { path: 'profile', element: <Profile />, layout: 'dashboard' },
    { path: 'settings', element: <Settings />, layout: 'dashboard' },

    // PARENT PORTAL
    { path: 'admissions/my', element: <MyApplications />, layout: 'dashboard', permission: 'admission.view_own' },

    // ADMISSIONS DESK (AdmissionWorkspaceLayout)
    { path: 'admissions/dashboard', element: <WorkspaceDashboard />, layout: 'admission_workspace', permission: 'admission.dashboard.view' },
    { path: 'admissions/analytics', element: <AnalyticsPage />, layout: 'admission_workspace', permission: 'admission.review' },
    { path: 'admissions/inquiries', element: <InquiryListPage />, layout: 'admission_workspace', guardType: 'admission_inquiry' },
    { path: 'admissions/enquiry', element: <InquiryListPage />, layout: 'admission_workspace', guardType: 'admission_inquiry' },
    { path: 'admissions/assign', element: <InquiryListPage />, layout: 'admission_workspace', guardType: 'admission_inquiry' },
    { path: 'admissions/new', element: <AdmissionForm />, layout: 'admission_workspace', permission: 'admission.create' },
    { path: 'admissions/wizard', element: <ApplicationWizardPage />, layout: 'admission_workspace', permission: 'admission.create' },
    { path: 'admissions/application/:id', element: <Applicant360Page />, layout: 'admission_workspace', guardType: 'admission_application' },
    { path: 'admissions/documents/:id', element: <Applicant360Page />, layout: 'admission_workspace', guardType: 'admission_application' },
    { path: 'admissions/timeline/:id', element: <Applicant360Page />, layout: 'admission_workspace', guardType: 'admission_application' },
    { path: 'admissions/review', element: <PipelinePage />, layout: 'admission_workspace', permission: 'admission.review' },
    { path: 'admissions/:id', element: <Applicant360Page />, layout: 'admission_workspace', guardType: 'admission_application' },
    { path: 'admissions/verification', element: <DocumentVerificationPage />, layout: 'admission_workspace', permission: 'admission.review' },
    { path: 'admissions/exams', element: <EntranceExamPage />, layout: 'admission_workspace', permissions: ['admission.review', 'admission.exam.manage', 'admission.exam.evaluate'] },
    { path: 'admissions/entrance-assessment', element: <InstructionsPage />, layout: 'admission_workspace', permission: 'admission.assessment.write' },
    { path: 'admissions/entrance-assessment/workspace', element: <TestPortal />, layout: 'admission_workspace', permission: 'admission.assessment.write' },
    { path: 'admissions/entrance-assessment/success', element: <SuccessPage />, layout: 'admission_workspace', permission: 'admission.assessment.write' },
    { path: 'admissions/assessment-monitor', element: <MonitoringDashboard />, layout: 'admission_workspace', permission: 'admission.assessment.manage' },
    { path: 'admissions/interviews', element: <InterviewPage />, layout: 'admission_workspace', permissions: ['admission.review', 'admission.interview.manage', 'admission.interview.evaluate'] },
    { path: 'admissions/merit', element: <MeritListPage />, layout: 'admission_workspace', permissions: ['admission.review', 'admission.merit.generate', 'admission.exam.manage', 'admission.interview.manage'] },
    { path: 'admissions/offers', element: <OfferLetterPage />, layout: 'admission_workspace', permissions: ['admission.review', 'admission.merit.generate', 'admission.exam.manage', 'admission.interview.manage'] },
    { path: 'admissions/merit/offers', element: <OfferLetterPage />, layout: 'admission_workspace', permissions: ['admission.review', 'admission.merit.generate', 'admission.exam.manage', 'admission.interview.manage'] },
    { path: 'admissions/fees', element: <AdmissionFeeCollectionPage />, layout: 'admission_workspace', permission: 'fees.payment.collect' },
    { path: 'admissions/enrollment', element: <EnrollmentPage />, layout: 'admission_workspace', permission: 'admission.review' },
    { path: 'admissions/reports', element: <ReportsPage />, layout: 'admission_workspace', permission: 'admission.review' },
    { path: 'admissions/settings', element: <AdmissionSettingsPage />, layout: 'admission_workspace', permission: 'admission.review' },
    
    // ASSESSMENT PLATFORM NAMESPACES (Admin dashboard layouts)
    { path: 'assessment/settings', element: <AssessmentSettings />, layout: 'dashboard', permission: 'assessment.foundation.manage' },
    { path: 'assessment/workflows/new', element: <AssessmentWorkflowBuilder />, layout: 'dashboard', permission: 'assessment.foundation.manage' },
    { path: 'assessment/workflows/:id/edit', element: <AssessmentWorkflowBuilder />, layout: 'dashboard', permission: 'assessment.foundation.manage' },
    { path: 'assessment/questions', element: <QuestionBankPage />, layout: 'dashboard', permission: 'assessment.question.view' },
    { path: 'assessment/questions/new', element: <QuestionEditorPage />, layout: 'dashboard', permission: 'assessment.question.create' },
    { path: 'assessment/questions/:id/edit', element: <QuestionEditorPage />, layout: 'dashboard', permission: 'assessment.question.update' },
    { path: 'assessment/questions/:id', element: <QuestionPreviewPage />, layout: 'dashboard', permission: 'assessment.question.view' },
    { path: 'assessment/questions/:id/history', element: <QuestionHistoryPage />, layout: 'dashboard', permission: 'assessment.question.view' },
    { path: 'assessment/questions/import', element: <QuestionImportPage />, layout: 'dashboard', permission: 'assessment.question.publish' },
    { path: 'assessment/questions/review', element: <QuestionReviewQueuePage />, layout: 'dashboard', permission: 'assessment.question.review' },
    { path: 'assessment/questions/folders', element: <QuestionFolderPage />, layout: 'dashboard', permission: 'assessment.folder.manage' },
    { path: 'assessment/questions/assets', element: <QuestionAssetsPage />, layout: 'dashboard', permission: 'assessment.asset.upload' },
    { path: 'assessment/templates', element: <TemplateDashboardPage />, layout: 'dashboard', permission: 'assessment.template.view' },
    { path: 'assessment/templates/new', element: <TemplateEditorPage />, layout: 'dashboard', permission: 'assessment.template.create' },
    { path: 'assessment/templates/:id', element: <TemplatePreviewPage />, layout: 'dashboard', permission: 'assessment.template.view' },
    { path: 'assessment/templates/:id/edit', element: <TemplateEditorPage />, layout: 'dashboard', permission: 'assessment.template.update' },
    { path: 'assessment/templates/:id/history', element: <TemplateHistoryPage />, layout: 'dashboard', permission: 'assessment.template.view' },
    { path: 'assessment/blueprints', element: <BlueprintDashboardPage />, layout: 'dashboard', permission: 'assessment.blueprint.view' },
    { path: 'assessment/blueprints/new', element: <BlueprintEditorPage />, layout: 'dashboard', permission: 'assessment.blueprint.create' },
    { path: 'assessment/blueprints/:id', element: <BlueprintPreviewPage />, layout: 'dashboard', permission: 'assessment.blueprint.view' },
    { path: 'assessment/blueprints/:id/edit', element: <BlueprintEditorPage />, layout: 'dashboard', permission: 'assessment.blueprint.update' },
    { path: 'assessment/blueprints/:id/history', element: <BlueprintHistoryPage />, layout: 'dashboard', permission: 'assessment.blueprint.view' },

    // PAPER GENERATOR
    { path: 'assessment/papers', element: <PaperDashboardPage />, layout: 'dashboard', permission: 'assessment.paper.preview' },
    { path: 'assessment/papers/wizard', element: <PaperGeneratorWizard />, layout: 'dashboard', permission: 'assessment.paper.generate' },
    { path: 'assessment/papers/:id', element: <PaperPreviewPage />, layout: 'dashboard', permission: 'assessment.paper.preview' },

    // EVALUATION & GRADING ENGINE
    { path: 'assessment/evaluation', element: <EvaluationDashboardPage />, layout: 'dashboard', permission: 'assessment.evaluation.view' },
    { path: 'assessment/evaluation/workspace/:id', element: <EvaluationWorkspacePage />, layout: 'dashboard', permission: 'assessment.evaluation.score' },
    { path: 'assessment/evaluation/rubrics', element: <RubricDesignerPage />, layout: 'dashboard', permission: 'assessment.evaluation.score' },
    { path: 'assessment/evaluation/moderation', element: <ModerationQueuePage />, layout: 'dashboard', permission: 'assessment.evaluation.moderate' },
    { path: 'assessment/evaluation/revaluation', element: <RevaluationPage />, layout: 'dashboard', permission: 'assessment.evaluation.revaluate' },
    { path: 'assessment/evaluation/grades', element: <GradeCalculationPage />, layout: 'dashboard', permission: 'assessment.evaluation.finalize' },
    { path: 'assessment/evaluation/analytics', element: <EvaluationAnalyticsPage />, layout: 'dashboard', permission: 'assessment.evaluation.analytics' },

    // RESULT PROCESSING & PUBLICATION ENGINE
    { path: 'assessment/results', element: <ResultDashboardPage />, layout: 'dashboard', permission: 'assessment.result.view' },
    { path: 'assessment/results/student-results', element: <StudentResultsPage />, layout: 'dashboard', permission: 'assessment.result.view' },
    { path: 'assessment/results/rankings', element: <RankingPage />, layout: 'dashboard', permission: 'assessment.result.statistics' },
    { path: 'assessment/results/promotions', element: <AssessmentPromotionPage />, layout: 'dashboard', permission: 'assessment.result.promotion' },
    { path: 'assessment/results/grade-cards', element: <GradeCardPage />, layout: 'dashboard', permission: 'assessment.result.gradecard' },
    { path: 'assessment/results/transcripts', element: <TranscriptPage />, layout: 'dashboard', permission: 'assessment.result.transcript' },
    { path: 'assessment/results/analytics', element: <ResultAnalyticsPage />, layout: 'dashboard', permission: 'assessment.result.analytics' },

    // ACCREDITATION & ANALYTICS ENGINE
    { path: 'assessment/analytics', element: <AssessmentAnalyticsDashboard />, layout: 'dashboard', permission: 'assessment.analytics.view' },
    { path: 'assessment/analytics/question-analysis', element: <QuestionAnalyticsPage />, layout: 'dashboard', permission: 'assessment.analytics.view' },
    { path: 'assessment/analytics/co-attainment', element: <COAttainmentPage />, layout: 'dashboard', permission: 'assessment.analytics.view' },
    { path: 'assessment/analytics/po-attainment', element: <POAttainmentPage />, layout: 'dashboard', permission: 'assessment.analytics.view' },
    { path: 'assessment/analytics/learning-gap', element: <LearningGapPage />, layout: 'dashboard', permission: 'assessment.analytics.view' },
    { path: 'assessment/analytics/accreditation', element: <AccreditationPage />, layout: 'dashboard', permission: 'assessment.analytics.view' },

    // ACADEMIC RECORDS & GRADUATION ENGINE
    { path: 'academic-records', element: <AcademicRecordsDashboard />, layout: 'dashboard', permission: 'academic.records.view' },
    { path: 'academic-records/history', element: <AcademicHistoryPage />, layout: 'dashboard', permission: 'academic.records.view' },
    { path: 'academic-records/degree-audit', element: <DegreeAuditPage />, layout: 'dashboard', permission: 'academic.records.view' },
    { path: 'academic-records/graduation', element: <GraduationDashboard />, layout: 'dashboard', permission: 'academic.records.view' },
    { path: 'academic-records/transcripts', element: <TranscriptCenterPage />, layout: 'dashboard', permission: 'academic.records.view' },
    { path: 'academic-records/standing', element: <AcademicStandingPage />, layout: 'dashboard', permission: 'academic.records.view' },

    // ATTENDANCE ENGINE
    { path: 'attendance', element: <AttendanceDashboard />, layout: 'dashboard', permission: 'attendance.view' },
    { path: 'attendance/calendar', element: <AttendanceCalendarManager />, layout: 'dashboard', permission: 'attendance.view' },
    { path: 'attendance/exceptions', element: <AttendanceExceptionsPage />, layout: 'dashboard', permission: 'attendance.view' },
    { path: 'attendance/leaves', element: <LeaveManagementPage />, layout: 'dashboard', permission: 'attendance.view' },
    { path: 'attendance/defaulters', element: <DefaultersPage />, layout: 'dashboard', permission: 'attendance.view' },
    { path: 'attendance/analytics', element: <AttendanceAnalyticsPage />, layout: 'dashboard', permission: 'attendance.view' },
    { path: 'attendance/devices', element: <DeviceMonitoringPage />, layout: 'dashboard', permission: 'attendance.view' },

    // STUDENT MANAGEMENT
    { path: 'students/dashboard', element: <StudentDashboardPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students', element: <StudentListPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/:id', element: <StudentDetailsPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/:id/edit', element: <StudentProfilePage />, layout: 'dashboard', permission: 'STUDENT_UPDATE' },
    { path: 'students/:id/parents', element: <ParentGuardianPage />, layout: 'dashboard', permission: 'STUDENT_UPDATE' },
    { path: 'students/:id/academics', element: <AcademicRecordPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/:id/allocation', element: <ClassAllocationPage />, layout: 'dashboard', permission: 'STUDENT_ASSIGN_SECTION' },
    { path: 'students/promote', element: <PromotionPage />, layout: 'dashboard', permission: 'STUDENT_ASSIGN_SECTION' },
    { path: 'students/transfer', element: <TransferPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/identity', element: <IdentityCardPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/:id/timeline', element: <TimelinePage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/:id/audit', element: <AuditLogsPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/reports', element: <StudentReportsPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/settings', element: <StudentSettingsPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/import', element: <ImportWizardPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/:id/admission-history', element: <AdmissionHistoryPage />, layout: 'dashboard', permission: 'STUDENT_VIEW' },
    { path: 'students/my-children', element: <MyChildren />, layout: 'dashboard', permission: 'STUDENT_VIEW_SELF' },
    { path: 'student/academic-history', element: <AcademicHistory />, layout: 'dashboard', permission: 'STUDENT_VIEW_SELF' },

    // ACADEMIC OPERATIONS
    { path: 'academic/classes', element: <ClassList />, layout: 'dashboard', permission: 'CLASS_VIEW' },
    { path: 'academic/years', element: <AcademicYearManagement />, layout: 'dashboard', permission: 'CLASS_CREATE' },
    { path: 'admin/bulk', element: <BulkOperations />, layout: 'dashboard', permission: 'admin.dashboard.view' },
    { path: 'academic/departments', element: <DepartmentsListPage />, layout: 'dashboard', permission: 'DEPARTMENT_VIEW' },
    { path: 'academic/classes/:classId', element: <SectionList />, layout: 'dashboard', permission: 'SECTION_VIEW' },
    { path: 'academic/assignments', element: <AssignmentManagement />, layout: 'dashboard', permission: 'SECTION_VIEW' },
    { path: 'academic/my-students', element: <MyStudents />, layout: 'dashboard', permission: 'SECTION_VIEW' },
    { path: 'admin/staff', element: <StaffListPage />, layout: 'dashboard', permission: 'admin.dashboard.view' },
    { path: 'faculty/subjects', element: <FacultyMySubjects />, layout: 'dashboard', permission: 'SECTION_VIEW' },
    { path: 'student/assignments', element: <MyAssignments />, layout: 'dashboard', permission: 'STUDENT_VIEW_SELF' },

    // EXAM PLATFORM OPERATIONS
    { path: 'academic/subjects', element: <SubjectManagement />, layout: 'dashboard', permission: 'SUBJECT_VIEW' },
    { path: 'student/exams/my-results', element: <StudentResults />, layout: 'dashboard', permission: 'MARKS_VIEW' },
    { path: 'student/exams/hall-ticket', element: <MyHallTicket />, layout: 'dashboard', permission: 'STUDENT_VIEW_SELF' },
    { path: 'student/exams/report-card', element: <MyReportCard />, layout: 'dashboard', permission: 'STUDENT_VIEW_SELF' },
    { path: 'student/exams/dashboard', element: <MyExams />, layout: 'dashboard', permission: 'STUDENT_VIEW_SELF' },
    { path: 'faculty/exams/dashboard', element: <FacultyExamDashboard />, layout: 'dashboard', permission: 'EXAM_VIEW' },
    { path: 'faculty/exams/invigilation', element: <FacultyInvigilationView />, layout: 'dashboard', permission: 'EXAM_VIEW' },
    { path: 'faculty/exams/marks-entry', element: <MarksEntry />, layout: 'dashboard', permission: 'MARKS_ENTER' },

    // ATTENDANCE OPERATIONS
    { path: 'attendance/mark', element: <AttendanceMarking />, layout: 'dashboard', permission: 'ATTENDANCE_MARK' },
    { path: 'attendance/admin/dashboard', element: <AdminAttendanceDashboard />, layout: 'dashboard', permission: 'DASHBOARD_VIEW_ADMIN' },
    { path: 'attendance/section', element: <SectionAttendanceView />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/my', element: <MyAttendance />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW_SELF' },
    { path: 'attendance/dashboard', element: <AttendanceDashboardPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/daily', element: <DailyAttendancePage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/period', element: <PeriodAttendancePage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/student', element: <StudentAttendancePage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/leaves', element: <LeaveManagementPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/corrections', element: <CorrectionPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/holidays', element: <HolidayPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/biometric', element: <BiometricPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/reports', element: <AttendanceReportsPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/analytics', element: <AttendanceAnalyticsPageV2 />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },
    { path: 'attendance/settings', element: <AttendanceSettingsPage />, layout: 'dashboard', permission: 'ATTENDANCE_VIEW' },

    // TIMETABLE OPERATIONS
    { path: 'timetable/manage', element: <TimetableBuilder />, layout: 'dashboard', permission: 'TIMETABLE_CREATE' },
    { path: 'timetable/my', element: <MyTimetable />, layout: 'dashboard', permission: 'TIMETABLE_VIEW_SELF' },

    // FEE PLATFORM
    { path: 'finance/structures', element: <FeeStructureManagement />, layout: 'dashboard', permission: 'fees.structure.manage' },
    { path: 'finance/assign', element: <StudentFeeAssignment />, layout: 'dashboard', permission: 'fees.structure.manage' },
    { path: 'fees/payments', element: <PaymentEntry />, layout: 'dashboard', permission: 'fees.payment.collect' },
    { path: 'fees/my', element: <MyFees />, layout: 'dashboard', permission: 'PAYMENT_VIEW_SELF' },
    { path: 'fees/ledger', element: <AdminFeeLedger />, layout: 'dashboard', permission: 'fees.view' },
    { path: 'finance/dashboard', element: <FinanceDashboard />, layout: 'dashboard', permission: 'fees.view' },
    { path: 'finance/demands', element: <DemandManagement />, layout: 'dashboard', permission: 'fees.demand.view' },
    { path: 'finance/payments', element: <PaymentEntry />, layout: 'dashboard', permission: 'fees.payment.collect' },
    { path: 'finance/ledger', element: <StudentLedger />, layout: 'dashboard', permission: 'fees.view' },
    { path: 'finance/receipts', element: <ReceiptCenter />, layout: 'dashboard', permission: 'fees.view' },
    { path: 'finance/waivers', element: <Waivers />, layout: 'dashboard', permission: 'fees.waiver.approve' },
    { path: 'finance/refunds', element: <Refunds />, layout: 'dashboard', permission: 'fees.refund.process' },
    { path: 'finance/reports', element: <FinanceReports />, layout: 'dashboard', permission: 'fees.view' },
    { path: 'finance/settings', element: <FinanceSettings />, layout: 'dashboard', permission: 'fees.structure.manage' },

    // TRANSPORT PLATFORM
    { path: 'transport/setup', element: <TransportSetup />, layout: 'dashboard', permission: 'TRANSPORT_SETUP' },
    { path: 'transport/bulk-assign', element: <TransportBulkAssignmentPage />, layout: 'dashboard', permission: 'TRANSPORT_SETUP' },
    { path: 'transport/assign', element: <StudentTransportAssignment />, layout: 'dashboard', permission: 'TRANSPORT_SETUP' },
    { path: 'transport/my', element: <MyTransport />, layout: 'dashboard', permission: 'TRANSPORT_VIEW_SELF' },
    { path: 'transport/analytics', element: <TransportAnalytics />, layout: 'dashboard', permission: 'TRIP_MONITOR' },
    { path: 'transport/overview', element: <TransportAdminDashboard />, layout: 'dashboard', permission: 'TRIP_MONITOR' },
    { path: 'transport/debug', element: <TransportDebugPage />, layout: 'dashboard', permission: 'TRANSPORT_SETUP' },
    { path: 'transport/monitor', element: <LiveTripMonitor />, layout: 'dashboard', permission: 'TRIP_MONITOR' },
    { path: 'transport/incidents', element: <IncidentsPage />, layout: 'dashboard', permission: 'TRIP_MONITOR' },
    { path: 'transport/manifests', element: <ManifestPage />, layout: 'dashboard', permission: 'TRIP_MONITOR' },
    { path: 'transport/driver', element: <DriverDashboard />, layout: 'dashboard', permission: 'driver.dashboard.view' },

    // WORKFLOW PLATFORM
    { path: 'workflows/dashboard', element: <WorkflowDashboard />, layout: 'dashboard', permission: 'admin.dashboard.view' },
    { path: 'workflows/builder', element: <WorkflowBuilder />, layout: 'dashboard', permission: 'admin.dashboard.view' },
    { path: 'workflows/tasks', element: <TaskCenter />, layout: 'dashboard' },
    { path: 'workflows/analytics', element: <WorkflowAnalytics />, layout: 'dashboard', permission: 'admin.dashboard.view' },

    // IMPORT TOOLKIT
    { path: 'import/history', element: <ImportHistoryPage />, layout: 'dashboard', permission: 'admin.dashboard.view' }
];

// EXAM_ADMIN PLATFORM (Dedicated Layout)
export const EXAM_ADMIN_ROUTES: RouteConfig[] = [
    { path: 'dashboard', element: <ExamDashboard />, layout: 'exam_admin' },
    { path: 'timetable', element: <ExamTimetablePage />, layout: 'exam_admin' },
    { path: 'eligibility', element: <ExamEligibilityPage />, layout: 'exam_admin' },
    { path: 'seating', element: <ExamSeating />, layout: 'exam_admin' },
    { path: 'halls', element: <ExamHallManagement />, layout: 'exam_admin' },
    { path: 'hall-tickets', element: <ExamHallTickets />, layout: 'exam_admin' },
    { path: 'question-papers', element: <ExamQuestionPapers />, layout: 'exam_admin' },
    { path: 'results', element: <ExamResults />, layout: 'exam_admin' },
    { path: 'analytics', element: <ExamAnalytics />, layout: 'exam_admin' },
    { path: 'manage', element: <ExamManagement />, layout: 'exam_admin' },
    { path: 'marks-entry', element: <MarksEntry />, layout: 'exam_admin' }
];
