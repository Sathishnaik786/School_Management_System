import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WorkspaceShell } from '../modules/common/workspace/WorkspaceShell';
import LoginPage from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import UnauthorizedPage from '../pages/Unauthorized';
import { FacultyListPage } from '../modules/academic/pages/FacultyListPage';
import { StaffListPage } from '../modules/academic/pages/StaffListPage';
// import { SectionDetailsPage } from '../modules/academic/pages/SectionDetailsPage'; // Commented out until created
import { FacultyMySubjects } from '../modules/dashboard/components/FacultyMySubjects';
import { ProtectedRoute, PermissionGuard, ExamOperationGuard } from '../components/auth/ProtectedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ExamAdminLayout } from '../layouts/ExamAdminLayout';
import { AdmissionWorkspaceLayout } from '../modules/admission/layouts/AdmissionWorkspaceLayout';
import { AdmissionForm } from '../modules/admission/pages/AdmissionForm';
import { MyApplications } from '../modules/admission/pages/MyApplications';
import { AdmissionReviewList } from '../modules/admission/pages/AdmissionReviewList';
import { ApplicationDetails } from '../modules/admission/pages/ApplicationDetails';
import { AdmissionReviewPage } from '../modules/admission/pages/AdmissionReviewPage';
import { StudentList } from '../modules/student/pages/StudentList';
import { StudentPromotion } from '../modules/student/pages/StudentPromotion';
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
import { ExamSeatingAllocation } from '../modules/exam/pages/ExamSeatingAllocation';
import { QuestionPaperManager } from '../modules/exam/pages/QuestionPaperManager';
import { ExamAnalyticsDashboard } from '../modules/exam/pages/ExamAnalyticsDashboard';
import { FacultyExamDashboard } from '../modules/exam/pages/FacultyExamDashboard';
import { FacultyInvigilationView } from '../modules/exam/pages/FacultyInvigilationView';
import { MyExams } from '../modules/exam/pages/MyExams';

// Phase 10A Scaffolds
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
import { AttendanceBridgeManager } from '../modules/attendance/pages/AttendanceBridgeManager';
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
import { FinanceLayout } from '../layouts/FinanceLayout';
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
import { TransportDiagnostics } from '../modules/transport/pages/TransportDiagnostics';
import { TransportDebugPage } from '../modules/transport/pages/TransportDebugPage';
import { LiveTripMonitor } from '../modules/transport/pages/LiveTripMonitor';
import { IncidentsPage } from '../modules/transport/pages/IncidentsPage';
import { ManifestPage } from '../modules/transport/pages/ManifestPage';
import { DriverDashboard } from '../modules/transport/pages/DriverDashboard';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';

// Workflow Platform Imports
import { WorkflowDashboard } from '../modules/workflows/pages/WorkflowDashboard';
import { WorkflowBuilder } from '../modules/workflows/pages/WorkflowBuilder';
import { TaskCenter } from '../modules/workflows/pages/TaskCenter';
import { WorkflowAnalytics } from '../modules/workflows/pages/WorkflowAnalytics';

// Public Site Imports
import PublicLayout from '../layouts/PublicLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import VisionMission from '../pages/VisionMission';
import Leadership from '../pages/Leadership';
import Academics from '../pages/Academics';
import Departments from '../pages/Departments';
import Faculty from '../pages/Faculty';
import Admissions from '../pages/Admissions';
import AdmissionProcess from '../pages/AdmissionProcess';
import Campus from '../pages/Campus';
import StudentLife from '../pages/StudentLife';
import Achievements from '../pages/Achievements';
import Events from '../pages/Events';
import Contact from '../pages/Contact';
import Notifications from '../pages/Notifications';
import NotFound from '../pages/NotFound';
import { ImportHistoryPage } from '../modules/import/pages/ImportHistory';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import SessionExpiredPage from '../features/auth/SessionExpiredPage';
import { StudentDashboard } from '../modules/dashboard/pages/StudentDashboard';

import { DashboardPage as AdmissionDashboardPage } from '../modules/admission/pages/DashboardPage';
import { AnalyticsPage as AdmissionAnalyticsPage } from '../modules/admission/pages/AnalyticsPage';
import { InquiryListPage } from '../modules/admission/pages/InquiryListPage';
import { AdmissionInquiryGuard } from '../modules/admission/components/AdmissionInquiryGuard';
import { AdmissionApplicationGuard } from '../modules/admission/components/AdmissionApplicationGuard';
import { ApplicationWizardPage } from '../modules/admission/pages/ApplicationWizardPage';
import { ApplicationListPage } from '../modules/admission/pages/ApplicationListPage';
import { DocumentVerificationPage } from '../modules/admission/pages/DocumentVerificationPage';
import { EntranceExamPage } from '../modules/admission/pages/EntranceExamPage';
import { InterviewPage } from '../modules/admission/pages/InterviewPage';
import { MeritListPage } from '../modules/admission/pages/MeritListPage';
import { OfferLetterPage } from '../modules/admission/pages/OfferLetterPage';
import { FeeCollectionPage as AdmissionFeeCollectionPage } from '../modules/admission/pages/FeeCollectionPage';
import { EnrollmentPage } from '../modules/admission/pages/EnrollmentPage';
import { ReportsPage as AdmissionReportsPage } from '../modules/admission/pages/ReportsPage';
import { SettingsPage as AdmissionSettingsPage } from '../modules/admission/pages/SettingsPage';

// Upgraded Phase 3 Admissions UI Pages
import WorkspaceDashboard from '../modules/admission/pages/Workspace';
import Applicant360Page from '../modules/admission/pages/Applicant360';
import PipelinePage from '../modules/admission/pages/Pipeline';
import AnalyticsPage from '../modules/admission/pages/Analytics';
import ReportsPage from '../modules/admission/pages/Reports';


export const AppRouter = () => {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <WorkspaceShell>
            <Routes>
                {/* Public Site Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/vision-mission" element={<VisionMission />} />
                    <Route path="/leadership" element={<Leadership />} />
                    <Route path="/academics" element={<Academics />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/faculty" element={<Faculty />} />
                    <Route path="/admissions" element={<Admissions />} />
                    <Route path="/admission-process" element={<AdmissionProcess />} />
                    <Route path="/admissions/apply" element={<AdmissionForm />} />
                    <Route path="/campus" element={<Campus />} />
                    <Route path="/student-life" element={<StudentLife />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/notifications" element={<Notifications />} />
                </Route>

                {/* Login */}
                <Route path="/login" element={<LoginPage />} />

                {/* Auth Utility Pages */}
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/session-expired" element={<SessionExpiredPage />} />

                {/* Protected App Routes */}
                <Route path="/app" element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="student/dashboard" element={<StudentDashboard />} />
                        <Route path="admin/dashboard" element={
                            <PermissionGuard permission="DASHBOARD_VIEW_ADMIN">
                                <AdminDashboard />
                            </PermissionGuard>
                        } />
                        <Route path="executive" element={
                            <PermissionGuard permission="DASHBOARD_VIEW_ADMIN">
                                <ExecutiveOverview />
                            </PermissionGuard>
                        } />
                        <Route path="exam-admin/dashboard" element={
                            <PermissionGuard permission="EXAM_VIEW">
                                <ExamDashboard />
                            </PermissionGuard>
                        } />

                        {/* Admission Module Routes */}
                        <Route path="admissions/my" element={
                            <PermissionGuard permission="admission.view_own">
                                <MyApplications />
                            </PermissionGuard>
                        } />

                        <Route element={<AdmissionWorkspaceLayout />}>
                            <Route path="admissions/dashboard" element={
                                <PermissionGuard permission="admission.review">
                                    <WorkspaceDashboard />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/analytics" element={
                                <PermissionGuard permission="admission.review">
                                    <AnalyticsPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/inquiries" element={
                                <AdmissionInquiryGuard>
                                    <InquiryListPage />
                                </AdmissionInquiryGuard>
                            } />
                            <Route path="admissions/enquiry" element={
                                <AdmissionInquiryGuard>
                                    <InquiryListPage />
                                </AdmissionInquiryGuard>
                            } />
                            <Route path="admissions/assign" element={
                                <AdmissionInquiryGuard>
                                    <InquiryListPage />
                                </AdmissionInquiryGuard>
                            } />
                            <Route path="admissions/new" element={
                                <PermissionGuard permission="admission.create">
                                    <AdmissionForm />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/wizard" element={
                                <PermissionGuard permission="admission.create">
                                    <ApplicationWizardPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/application/:id" element={
                                <AdmissionApplicationGuard>
                                    <Applicant360Page />
                                </AdmissionApplicationGuard>
                            } />
                            <Route path="admissions/documents/:id" element={
                                <AdmissionApplicationGuard>
                                    <Applicant360Page />
                                </AdmissionApplicationGuard>
                            } />
                            <Route path="admissions/timeline/:id" element={
                                <AdmissionApplicationGuard>
                                    <Applicant360Page />
                                </AdmissionApplicationGuard>
                            } />
                            <Route path="admissions/review" element={
                                <PermissionGuard permission="admission.review">
                                    <PipelinePage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/review/:id" element={
                                <PermissionGuard permission="admission.view_all">
                                    <AdmissionReviewPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/:id" element={
                                <AdmissionApplicationGuard>
                                    <Applicant360Page />
                                </AdmissionApplicationGuard>
                            } />
                            <Route path="admissions/verification" element={
                                <PermissionGuard permission="admission.review">
                                    <DocumentVerificationPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/exams" element={
                                <PermissionGuard permission="admission.review">
                                    <EntranceExamPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/interviews" element={
                                <PermissionGuard permission="admission.review">
                                    <InterviewPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/merit" element={
                                <PermissionGuard permission="admission.review">
                                    <MeritListPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/offers" element={
                                <PermissionGuard permission="admission.review">
                                    <OfferLetterPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/merit/offers" element={
                                <PermissionGuard permission="admission.review">
                                    <OfferLetterPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/fees" element={
                                <PermissionGuard permission="fees.payment.collect">
                                    <AdmissionFeeCollectionPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/enrollment" element={
                                <PermissionGuard permission="admission.review">
                                    <EnrollmentPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/reports" element={
                                <PermissionGuard permission="admission.review">
                                    <ReportsPage />
                                </PermissionGuard>
                            } />
                            <Route path="admissions/settings" element={
                                <PermissionGuard permission="admission.review">
                                    <AdmissionSettingsPage />
                                </PermissionGuard>
                            } />
                        </Route>

                        {/* Student Module Routes */}
                        <Route path="students/dashboard" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <StudentDashboardPage />
                            </PermissionGuard>
                        } />
                        <Route path="students" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <StudentListPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <StudentDetailsPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/edit" element={
                            <PermissionGuard permission="STUDENT_UPDATE">
                                <StudentProfilePage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/parents" element={
                            <PermissionGuard permission="STUDENT_UPDATE">
                                <ParentGuardianPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/academics" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <AcademicRecordPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/allocation" element={
                            <PermissionGuard permission="STUDENT_ASSIGN_SECTION">
                                <ClassAllocationPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/promote" element={
                            <PermissionGuard permission="STUDENT_ASSIGN_SECTION">
                                <PromotionPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/transfer" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <TransferPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/identity" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <IdentityCardPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/timeline" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <TimelinePage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/audit" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <AuditLogsPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/reports" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <StudentReportsPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/settings" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <StudentSettingsPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/import" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <ImportWizardPage />
                            </PermissionGuard>
                        } />
                        <Route path="students/:id/admission-history" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <AdmissionHistoryPage />
                            </PermissionGuard>
                        } />

                        {/* Old / Parent custom views */}
                        <Route path="students/my-children" element={
                            <PermissionGuard permission="STUDENT_VIEW_SELF">
                                <MyChildren />
                            </PermissionGuard>
                        } />
                        <Route path="student/academic-history" element={
                            <PermissionGuard permission="STUDENT_VIEW_SELF">
                                <AcademicHistory />
                            </PermissionGuard>
                        } />

                        {/* Academic Module Routes */}
                        <Route path="academic/classes" element={
                            <PermissionGuard permission="CLASS_VIEW">
                                <ClassList />
                            </PermissionGuard>
                        } />

                        <Route path="academic/years" element={
                            <PermissionGuard permission="CLASS_CREATE">
                                <AcademicYearManagement />
                            </PermissionGuard>
                        } />

                        <Route path="admin/bulk" element={
                            <PermissionGuard permission="STUDENT_ASSIGN_SECTION">
                                <BulkOperations />
                            </PermissionGuard>
                        } />

                        <Route path="academic/departments" element={
                            <PermissionGuard permission="DEPARTMENT_VIEW">
                                <DepartmentsListPage />
                            </PermissionGuard>
                        } />

                        <Route path="academic/classes/:classId" element={
                            <PermissionGuard permission="SECTION_VIEW">
                                <SectionList />
                            </PermissionGuard>
                        } />

                        <Route path="academic/assignments" element={
                            <PermissionGuard permission="SECTION_VIEW">
                                <AssignmentManagement />
                            </PermissionGuard>
                        } />

                        <Route path="academic/my-students" element={
                            <PermissionGuard permission="SECTION_VIEW">
                                <MyStudents />
                            </PermissionGuard>
                        } />

                        {/* Faculty & Staff Management */}
                        <Route path="academic/faculty" element={
                            <PermissionGuard permission="FACULTY_PROFILE_MANAGE">
                                <FacultyListPage />
                            </PermissionGuard>
                        } />

                        <Route path="admin/staff" element={
                            <PermissionGuard permission="STAFF_PROFILE_MANAGE">
                                <StaffListPage />
                            </PermissionGuard>
                        } />

                        <Route path="faculty/subjects" element={
                            <PermissionGuard permission="SECTION_VIEW">
                                <FacultyMySubjects />
                            </PermissionGuard>
                        } />

                        <Route path="student/assignments" element={
                            <PermissionGuard permission="STUDENT_VIEW_SELF">
                                <MyAssignments />
                            </PermissionGuard>
                        } />

                        {/* Exam Module Routes */}

                        {/* ADMIN EXAM VIEWS (PHASE 10A) */}
                        <Route path="admin/exams/dashboard" element={
                            <PermissionGuard permission="EXAM_VIEW">
                                <ExamDashboard />
                            </PermissionGuard>
                        } />
                        <Route path="admin/exams/timetable" element={
                            <ExamOperationGuard>
                                <ExamTimetablePage />
                            </ExamOperationGuard>
                        } />
                        <Route path="admin/exams/seating" element={
                            <ExamOperationGuard>
                                <ExamSeating />
                            </ExamOperationGuard>
                        } />
                        <Route path="admin/exams/question-papers" element={
                            <ExamOperationGuard>
                                <ExamQuestionPapers />
                            </ExamOperationGuard>
                        } />
                        <Route path="admin/exams/results" element={
                            <ExamOperationGuard>
                                <ExamResults />
                            </ExamOperationGuard>
                        } />
                        <Route path="admin/exams/analytics" element={
                            <ExamOperationGuard>
                                <ExamAnalytics />
                            </ExamOperationGuard>
                        } />

                        <Route path="exams/subjects" element={
                            <PermissionGuard permission="SUBJECT_VIEW">
                                <SubjectManagement />
                            </PermissionGuard>
                        } />
                        <Route path="exams/manage" element={
                            <ExamOperationGuard>
                                <ExamManagement />
                            </ExamOperationGuard>
                        } />
                        <Route path="exams/timetable" element={
                            <ExamOperationGuard>
                                <ExamTimetablePage />
                            </ExamOperationGuard>
                        } />
                        {/* Marks entry is shared with Faculty, so keep PermissionGuard or handle logic inside. 
                            If this route is ONLY for admin/exam-cell, use OpGuard.
                            But usually 'exams/marks' is generic.
                            Wait, MARK_ENTRY permission is used by Faculty.
                            ExamOperationGuard BLOCKS admins.
                            We want Admins BLOCKED from entry? Yes.
                            We want Faculty ALLOWED?
                            ExamOperationGuard currently allows ONLY ExamCellAdmin.
                            It BLOCKS Admin.
                            It BLOCKS everyone else implicitly (check logic: if !isExamAdmin && !isAdmin -> Denied).
                            So we CANNOT use ExamOperationGuard for Faculty routes.
                            We must leave PermissionGuard for faculty routes.
                        */}
                        <Route path="exams/marks" element={
                            <PermissionGuard permission="MARKS_ENTER">
                                <MarksEntry />
                            </PermissionGuard>
                        } />


                        {/* SEATING & HALLS */}
                        {/* SEATING & HALLS */}
                        <Route path="exams/halls" element={
                            <ExamOperationGuard>
                                <ExamHallManagement />
                            </ExamOperationGuard>
                        } />
                        <Route path="exams/seating" element={
                            <ExamOperationGuard>
                                <ExamSeatingAllocation />
                            </ExamOperationGuard>
                        } />
                        <Route path="exams/question-papers" element={
                            <ExamOperationGuard>
                                <QuestionPaperManager />
                            </ExamOperationGuard>
                        } />
                        <Route path="exams/analytics" element={
                            <ExamOperationGuard>
                                <ExamAnalyticsDashboard />
                            </ExamOperationGuard>
                        } />

                        {/* DELIVERABLES */}
                        {/* Student / Parent Exam Routes */}
                        <Route path="student/exams" element={
                            <PermissionGuard permission="EXAM_VIEW">
                                <MyExams />
                            </PermissionGuard>
                        } />
                        <Route path="student/exams/hall-ticket" element={
                            <PermissionGuard permission="EXAM_VIEW">
                                <MyHallTicket />
                            </PermissionGuard>
                        } />
                        <Route path="student/exams/report-card" element={
                            <PermissionGuard permission="MARKS_VIEW">
                                <MyReportCard />
                            </PermissionGuard>
                        } />

                        {/* Legacy Routes - kept for backward compat if any, but redir preferred */}
                        <Route path="exams/my-hall-ticket" element={<Navigate to="/app/student/exams/hall-ticket" replace />} />
                        <Route path="exams/my-report-card" element={<Navigate to="/app/student/exams/report-card" replace />} />


                        <Route path="exams/results" element={
                            <PermissionGuard permission="MARKS_VIEW">
                                <StudentResults />
                            </PermissionGuard>
                        } />

                        {/* Faculty Exam Routes */}
                        <Route path="faculty/exams" element={
                            <PermissionGuard permission="MARKS_ENTRY">
                                <FacultyExamDashboard />
                            </PermissionGuard>
                        } />
                        <Route path="faculty/exams/marks" element={
                            <PermissionGuard permission="MARKS_ENTRY">
                                <MarksEntry />
                            </PermissionGuard>
                        } />
                        <Route path="faculty/exams/question-papers" element={
                            <PermissionGuard permission="MARKS_ENTRY">
                                <QuestionPaperManager />
                            </PermissionGuard>
                        } />
                        <Route path="faculty/exams/invigilation" element={
                            <PermissionGuard permission="EXAM_VIEW">
                                <FacultyInvigilationView />
                            </PermissionGuard>
                        } />

                        {/* Attendance Module Routes */}
                        <Route path="attendance/dashboard" element={
                            <PermissionGuard permission="attendance.verify">
                                <AttendanceDashboardPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/mark-daily" element={
                            <PermissionGuard permission="attendance.mark">
                                <DailyAttendancePage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/period" element={
                            <PermissionGuard permission="attendance.mark">
                                <PeriodAttendancePage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/student/:id" element={
                            <PermissionGuard permission="attendance.verify">
                                <StudentAttendancePage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/leaves" element={
                            <PermissionGuard permission="attendance.leave.approve">
                                <LeaveManagementPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/corrections" element={
                            <PermissionGuard permission="attendance.correction.approve">
                                <CorrectionPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/holidays" element={
                            <PermissionGuard permission="attendance.mark">
                                <HolidayPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/biometric" element={
                            <PermissionGuard permission="attendance.sync">
                                <BiometricPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/reports" element={
                            <PermissionGuard permission="attendance.verify">
                                <AttendanceReportsPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/analytics" element={
                            <PermissionGuard permission="attendance.verify">
                                <AttendanceAnalyticsPage />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/settings" element={
                            <PermissionGuard permission="attendance.verify">
                                <AttendanceSettingsPage />
                            </PermissionGuard>
                        } />

                        {/* Legacy/Phase 10A compatibility routes */}
                        <Route path="attendance/admin/dashboard" element={
                            <PermissionGuard permission="DASHBOARD_VIEW_ADMIN">
                                <AdminAttendanceDashboard />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/admin/bridge" element={
                            <PermissionGuard permission="DASHBOARD_VIEW_ADMIN">
                                <AttendanceBridgeManager />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/mark" element={
                            <PermissionGuard permission="ATTENDANCE_MARK">
                                <AttendanceMarking />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/view-section" element={
                            <PermissionGuard permission="ATTENDANCE_VIEW">
                                <SectionAttendanceView />
                            </PermissionGuard>
                        } />
                        <Route path="attendance/my" element={
                            <PermissionGuard permission="ATTENDANCE_VIEW_SELF">
                                <MyAttendance />
                            </PermissionGuard>
                        } />

                        {/* Timetable Module Routes */}
                        <Route path="timetable/manage" element={
                            <PermissionGuard permission="TIMETABLE_CREATE">
                                <TimetableBuilder />
                            </PermissionGuard>
                        } />
                        <Route path="timetable/my" element={
                            <PermissionGuard permission="TIMETABLE_VIEW_SELF">
                                <MyTimetable />
                            </PermissionGuard>
                        } />


                        {/* Legacy Fees Redirects & Self-service */}
                        <Route path="fees" element={<Navigate to="/app/finance/dashboard" replace />} />
                        <Route path="fees/dashboard" element={<Navigate to="/app/finance/dashboard" replace />} />
                        <Route path="fees/structures" element={<Navigate to="/app/finance/structures" replace />} />
                        <Route path="fees/payments" element={<Navigate to="/app/finance/payments" replace />} />
                        <Route path="fees/ledger" element={<Navigate to="/app/finance/ledger" replace />} />
                        <Route path="fees/my" element={
                            <PermissionGuard permission="PAYMENT_VIEW_SELF">
                                <MyFees />
                            </PermissionGuard>
                        } />
                        <Route path="fees/assign" element={
                            <PermissionGuard permission="fees.demand.generate">
                                <StudentFeeAssignment />
                            </PermissionGuard>
                        } />

                        {/* Transport Module Routes */}
                        <Route path="transport/overview" element={
                            <PermissionGuard permission="TRIP_MONITOR">
                                <TransportAdminDashboard />
                            </PermissionGuard>
                        } />
                        <Route path="transport/setup" element={
                            <PermissionGuard permission="TRANSPORT_SETUP">
                                <TransportSetup />
                            </PermissionGuard>
                        } />
                        <Route path="transport/bulk-assign" element={
                            <PermissionGuard permission="TRANSPORT_ASSIGN">
                                <TransportBulkAssignmentPage />
                            </PermissionGuard>
                        } />
                        <Route path="transport/assign" element={
                            <PermissionGuard permission="TRANSPORT_ASSIGN">
                                <StudentTransportAssignment />
                            </PermissionGuard>
                        } />
                        <Route path="transport/monitor" element={
                            <PermissionGuard permission="TRIP_MONITOR">
                                <LiveTripMonitor />
                            </PermissionGuard>
                        } />
                        <Route path="transport/incidents" element={
                            <PermissionGuard permission="TRANSPORT_SETUP">
                                <IncidentsPage />
                            </PermissionGuard>
                        } />
                        <Route path="transport/manifests" element={
                            <PermissionGuard permission="TRANSPORT_SETUP">
                                <ManifestPage />
                            </PermissionGuard>
                        } />
                        <Route path="transport/fees" element={
                            <PermissionGuard permission="TRANSPORT_SETUP">
                                <TransportSetup />
                            </PermissionGuard>
                        } />
                        <Route path="transport/my" element={
                            <PermissionGuard permission="TRANSPORT_VIEW_SELF">
                                <MyTransport />
                            </PermissionGuard>
                        } />
                        <Route path="transport/analytics" element={
                            <PermissionGuard permission="TRIP_MONITOR">
                                <TransportAnalytics />
                            </PermissionGuard>
                        } />
                        <Route path="transport/diagnostics" element={
                            <TransportDiagnostics />
                        } />
                        <Route path="transport/debug" element={
                            <TransportDebugPage />
                        } />
                        <Route path="transport/driver" element={
                            <DriverDashboard />
                        } />

                        {/* Import History */}
                        <Route path="import/history" element={
                            <ImportHistoryPage />
                        } />

                        {/* Workflows routes */}
                        <Route path="workflows/dashboard" element={<WorkflowDashboard />} />
                        <Route path="workflows/builder" element={<WorkflowBuilder />} />
                        <Route path="workflows/tasks" element={<TaskCenter />} />
                        <Route path="workflows/analytics" element={<WorkflowAnalytics />} />

                        {/* Common User Routes */}
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />

                        {/* Finance Workspace Routes (Phase 2 Upgrade) */}
                        <Route element={<FinanceLayout />}>
                            <Route path="finance/dashboard" element={
                                <PermissionGuard permission="fees.view">
                                    <FinanceDashboard />
                                </PermissionGuard>
                            } />
                            <Route path="finance/structures" element={
                                <PermissionGuard permission="fees.structure.manage">
                                    <FeeStructureManagement />
                                </PermissionGuard>
                            } />
                            <Route path="finance/demands" element={
                                <PermissionGuard permission="fees.demand.view">
                                    <DemandManagement />
                                </PermissionGuard>
                            } />
                            <Route path="finance/payments" element={
                                <PermissionGuard permission="fees.payment.collect">
                                    <PaymentEntry />
                                </PermissionGuard>
                            } />
                            <Route path="finance/ledger" element={
                                <PermissionGuard permission="fees.view">
                                    <StudentLedger />
                                </PermissionGuard>
                            } />
                            <Route path="finance/receipts" element={
                                <PermissionGuard permission="fees.view">
                                    <ReceiptCenter />
                                </PermissionGuard>
                            } />
                            <Route path="finance/waivers" element={
                                <PermissionGuard permission="fees.waiver.approve">
                                    <Waivers />
                                </PermissionGuard>
                            } />
                            <Route path="finance/refunds" element={
                                <PermissionGuard permission="fees.refund.process">
                                    <Refunds />
                                </PermissionGuard>
                            } />
                            <Route path="finance/reports" element={
                                <PermissionGuard permission="fees.view">
                                    <FinanceReports />
                                </PermissionGuard>
                            } />
                            <Route path="finance/settings" element={
                                <PermissionGuard permission="fees.structure.manage">
                                    <FinanceSettings />
                                </PermissionGuard>
                            } />
                        </Route>

                        <Route path="unauthorized" element={<UnauthorizedPage />} />
                    </Route>

                    {/* EXAM ADMIN DASHBOARD (New Role) */}
                    <Route path="exam-admin" element={
                        <PermissionGuard permission="EXAM_VIEW">
                            <ExamAdminLayout />
                        </PermissionGuard>
                    }>
                        <Route path="dashboard" element={<ExamDashboard />} />
                        <Route path="timetable" element={<ExamTimetablePage />} />
                        <Route path="eligibility" element={<ExamEligibilityPage />} />
                        <Route path="seating" element={<ExamSeating />} />
                        <Route path="halls" element={<ExamHallManagement />} />
                        <Route path="hall-tickets" element={<ExamHallTickets />} />
                        <Route path="question-papers" element={<ExamQuestionPapers />} />
                        <Route path="results" element={<ExamResults />} />
                        <Route path="analytics" element={<ExamAnalytics />} />
                    </Route>
                    <Route path="" element={<Navigate to="dashboard" replace />} />
                </Route>

                {/* Redirects */}
                <Route path="/app/*" element={<Navigate to="/app/dashboard" replace />} />
                <Route path="*" element={<Home />} />
            </Routes>
            </WorkspaceShell>
        </BrowserRouter>
    );
};
