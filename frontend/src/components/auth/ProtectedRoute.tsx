import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loading } from '../ui/Loading';
import { PendingApprovalPage } from '../../pages/PendingApproval';

export const ProtectedRoute = () => {
    const { user, loading, session } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loading message="Securing session..." />
            </div>
        );
    }

    // Check Supabase session AND Backend Profile
    if (!session || !user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <LoginApprovalGate>
            <Outlet />
        </LoginApprovalGate>
    );
};

export const LoginApprovalGate = ({ children }: { children: React.ReactNode }) => {
    const { user, hasRole } = useAuth();
    const location = useLocation();

    if (!user) return null;

    // Admins always bypass the gate
    if (hasRole('ADMIN')) return <>{children}</>;

    // Define paths that are allowed for PENDING/REJECTED users
    const allowedPaths = ['/app/admissions/my', '/app/admissions/'];
    const isAllowedPath = allowedPaths.some(path => location.pathname.startsWith(path));

    if (user.login_status !== 'APPROVED' && !isAllowedPath) {
        return <PendingApprovalPage />;
    }

    return <>{children}</>;
};

interface PermissionGuardProps {
    permission: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export const PermissionGuard = ({ permission, children, fallback = null }: PermissionGuardProps) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
