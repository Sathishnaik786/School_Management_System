import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from '../modules/dashboard/pages/AdminDashboard';
import { FacultyDashboard } from '../modules/dashboard/pages/FacultyDashboard';
import { ParentDashboard } from '../modules/dashboard/pages/ParentDashboard';
import { TransportAdminDashboard } from '../modules/transport/pages/TransportAdminDashboard';
import { TransportAnalytics } from '../modules/transport/pages/TransportAnalytics';
import { DriverDashboard } from '../modules/transport/pages/DriverDashboard';
import { Bus } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();

    // Determine Role Logic
    const isAdmin = user?.roles.some(r => ['ADMIN', 'HEAD_OF_INSTITUTE'].includes(r));
    const isFaculty = user?.roles.includes('FACULTY');
    const isParent = user?.roles.some(r => ['PARENT', 'STUDENT'].includes(r));
    const isTransportAdmin = user?.roles.includes('TRANSPORT_ADMIN');
    const isDriver = user?.roles.includes('BUS_DRIVER');

    return (
        <div className="space-y-6">
            {isAdmin && <AdminDashboard />}
            {isFaculty && <FacultyDashboard />}
            {isParent && <ParentDashboard />}
            {isTransportAdmin && <TransportAdminDashboard />}
            {isDriver && <DriverDashboard />}

            {!isAdmin && !isFaculty && !isParent && !isTransportAdmin && !isDriver && (
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
