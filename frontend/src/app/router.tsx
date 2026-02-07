import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { AdmissionForm } from '../modules/admission/pages/AdmissionForm';
import { MyApplications } from '../modules/admission/pages/MyApplications';
import { AdmissionReviewList } from '../modules/admission/pages/AdmissionReviewList';
import { ApplicationDetails } from '../modules/admission/pages/ApplicationDetails';
import { AdmissionReviewPage } from '../modules/admission/pages/AdmissionReviewPage';
import { StudentList } from '../modules/student/pages/StudentList';
import { MyChildren } from '../modules/student/pages/MyChildren';
import { ClassList } from '../modules/academic/pages/ClassList';
import { SectionList } from '../modules/academic/pages/SectionList';
import { DepartmentsListPage } from '../modules/academic/pages/DepartmentsListPage';
import { AssignmentManagement } from '../modules/academic/pages/AssignmentManagement';
import { MyAssignments } from '../modules/academic/pages/MyAssignments';
import { MyStudents } from '../modules/academic/pages/MyStudents';
import { SubjectManagement } from '../modules/exam/pages/SubjectManagement';
import { ExamManagement } from '../modules/exam/pages/ExamManagement';
import { ExamTimeTable } from '../modules/exam/pages/ExamTimeTable';
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
import { ExamSeating } from '../modules/exam/pages/ExamSeating';
import { ExamQuestionPapers } from '../modules/exam/pages/ExamQuestionPapers';
import { ExamResults } from '../modules/exam/pages/ExamResults';
import { ExamAnalytics } from '../modules/exam/pages/ExamAnalytics';
import { AttendanceMarking } from '../modules/attendance/pages/AttendanceMarking';
import { SectionAttendanceView } from '../modules/attendance/pages/SectionAttendanceView';
import { MyAttendance } from '../modules/attendance/pages/MyAttendance';
import { TimetableBuilder } from '../modules/timetable/pages/TimetableBuilder';
import { MyTimetable } from '../modules/timetable/pages/MyTimetable';
import { FeeStructureManagement } from '../modules/fees/pages/FeeStructureManagement';
import { StudentFeeAssignment } from '../modules/fees/pages/StudentFeeAssignment';
import { PaymentEntry } from '../modules/fees/pages/PaymentEntry';
import { MyFees } from '../modules/fees/pages/MyFees';
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

export const AppRouter = () => {
    return (
        <BrowserRouter>
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

                {/* Protected App Routes */}
                <Route path="/app" element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="admin/dashboard" element={
                            <PermissionGuard permission="DASHBOARD_VIEW_ADMIN">
                                <AdminDashboard />
                            </PermissionGuard>
                        } />
                        <Route path="exam-admin/dashboard" element={
                            <PermissionGuard permission="EXAM_VIEW">
                                <ExamDashboard />
                            </PermissionGuard>
                        } />

                        {/* Admission Module Routes */}
                        <Route path="admissions/new" element={
                            <PermissionGuard permission="admission.create">
                                <AdmissionForm />
                            </PermissionGuard>
                        } />

                        <Route path="admissions/my" element={
                            <PermissionGuard permission="admission.view_own">
                                <MyApplications />
                            </PermissionGuard>
                        } />

                        <Route path="admissions/review" element={
                            <PermissionGuard permission="admission.review">
                                <AdmissionReviewList />
                            </PermissionGuard>
                        } />

                        <Route path="admissions/review/:id" element={
                            <PermissionGuard permission="admission.view_all">
                                <AdmissionReviewPage />
                            </PermissionGuard>
                        } />

                        <Route path="admissions/:id" element={
                            <PermissionGuard permission="admission.view_own">
                                <ApplicationDetails />
                            </PermissionGuard>
                        } />

                        {/* Student Module Routes */}
                        <Route path="students" element={
                            <PermissionGuard permission="STUDENT_VIEW">
                                <StudentList />
                            </PermissionGuard>
                        } />

                        <Route path="students/my-children" element={
                            <PermissionGuard permission="STUDENT_VIEW_SELF">
                                <MyChildren />
                            </PermissionGuard>
                        } />

                        {/* Academic Module Routes */}
                        <Route path="academic/classes" element={
                            <PermissionGuard permission="CLASS_VIEW">
                                <ClassList />
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
                                <ExamTimeTable />
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

                        {/* Fees Module Routes */}
                        <Route path="fees/structures" element={
                            <PermissionGuard permission="FEES_SETUP">
                                <FeeStructureManagement />
                            </PermissionGuard>
                        } />
                        <Route path="fees/assign" element={
                            <PermissionGuard permission="FEES_ASSIGN">
                                <StudentFeeAssignment />
                            </PermissionGuard>
                        } />
                        <Route path="fees/payments" element={
                            <PermissionGuard permission="PAYMENT_RECORD">
                                <PaymentEntry />
                            </PermissionGuard>
                        } />
                        <Route path="fees/my" element={
                            <PermissionGuard permission="PAYMENT_VIEW_SELF">
                                <MyFees />
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

                        {/* Common User Routes */}
                        <Route path="profile" element={<Profile />} />
                        <Route path="settings" element={<Settings />} />

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
                        <Route path="seating" element={<ExamSeating />} />
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
        </BrowserRouter>
    );
};
