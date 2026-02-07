import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../modules/dashboard/pages/AdminDashboard';
import { FacultyDashboard } from '../modules/dashboard/pages/FacultyDashboard';
import { ParentDashboard } from '../modules/dashboard/pages/ParentDashboard';
import { TransportAdminDashboard } from '../modules/transport/pages/TransportAdminDashboard';
import { DriverDashboard } from '../modules/transport/pages/DriverDashboard';

// Exam Dashboard is now routed independently, but we might render it briefly?
// No, we are redirecting.

export default function Dashboard() {
    const { user } = useAuth();

    // Determine Role Logic
    const isAdmin = user?.roles.some(r => ['ADMIN', 'HEAD_OF_INSTITUTE'].includes(r));
    const isExamAdmin = user?.roles.includes('EXAM_CELL_ADMIN');

    // Phase 4: Enforce Dedicated Dashboards
    // If Admin, go to Admin Dashboard (Governance)
    if (isAdmin) {
        return <Navigate to="/app/admin/dashboard" replace />;
    }

    // If Exam Cell Admin (and NOT Admin), go to Exam Admin Dashboard (Operations)
    if (isExamAdmin) {
        return <Navigate to="/app/exam-admin/dashboard" replace />;
    }

    // Others stay on generic dashboard dispatcher for now, OR we can route them too.
    // User asked "FACULTY -> existing faculty dashboard".
    // I will render Faculty/Parent/Driver inline here as before, to maintain "existing" behavior without new routes if not requested.

    const isFaculty = user?.roles.includes('FACULTY');
    const isParent = user?.roles.some(r => ['PARENT', 'STUDENT'].includes(r));
    const isTransportAdmin = user?.roles.includes('TRANSPORT_ADMIN');
    const isDriver = user?.roles.includes('BUS_DRIVER');

    return (
        <div className="space-y-6">
            {/* Admin & Exam Admin are redirected above */}
            {isFaculty && <FacultyDashboard />}
            {isParent && <ParentDashboard />}
            {isTransportAdmin && <TransportAdminDashboard />}
            {isDriver && <DriverDashboard />}

            {!isFaculty && !isParent && !isTransportAdmin && !isDriver && (
                <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
                    <div className="text-4xl mb-4">🔓</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Account Pending Verification</h2>
                    <p className="text-gray-500 max-w-md mx-auto">
                        Your account doesn't have any specific dashboard roles assigned. Please contact the administrator.
                    </p>
                </div>
            )}
        </div>
    );
}
