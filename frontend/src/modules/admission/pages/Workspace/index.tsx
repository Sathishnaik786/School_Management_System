import React from 'react';
import { useAuth } from '../../../../context/AuthContext';
import ParentDashboard from './ParentDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';
import CounselorDashboard from './CounselorDashboard';
import AdmissionOfficerDashboard from './AdmissionOfficerDashboard';
import ExamCellDashboard from './ExamCellDashboard';
import PrincipalDashboard from './PrincipalDashboard';
import FinanceDashboard from './FinanceDashboard';
import { AlertCircle } from 'lucide-react';
import { AdmissionPermissions } from '../../core/AdmissionPermissions';

const DASHBOARD_COMPONENTS: Record<string, React.ComponentType> = {
    parent: ParentDashboard,
    receptionist: ReceptionistDashboard,
    counselor: CounselorDashboard,
    admission_officer: AdmissionOfficerDashboard,
    exam_cell: ExamCellDashboard,
    principal: PrincipalDashboard,
    finance: FinanceDashboard,
};

export function WorkspaceDashboard() {
    const { user, hasPermission, hasRole } = useAuth();

    if (!user) {
        return null;
    }

    const ctx = {
        roles: user.roles ?? [],
        hasPermission,
        hasRole,
    };

    const dashboardKey = AdmissionPermissions.resolveWorkspaceDashboard(ctx);
    const DashboardComponent = DASHBOARD_COMPONENTS[dashboardKey];

    console.info('[Dashboard Resolver] Resolving Workspace Dashboard', {
        user: user.email,
        roles: user.roles,
        resolvedKey: dashboardKey,
        hasDashboardComponent: !!DashboardComponent,
        permissionsLoadedCount: user.permissions?.length ?? 0
    });

    if (DashboardComponent) {
        return <DashboardComponent />;
    }

    // Default Fallback / Error view for "generic" or unmapped roles
    const missingPermissions = [];
    if (!hasPermission('parent.dashboard.view') && !hasPermission('student.dashboard.view')) {
        missingPermissions.push('parent.dashboard.view');
    }
    if (!hasPermission('admission.enquiry.create')) {
        missingPermissions.push('admission.enquiry.create');
    }
    if (!hasPermission('admission.leads.manage')) {
        missingPermissions.push('admission.leads.manage');
    }
    if (!hasPermission('admission.review')) {
        missingPermissions.push('admission.review');
    }
    if (!hasPermission('admission.approve')) {
        missingPermissions.push('admission.approve');
    }

    console.warn('[Dashboard Resolver] Failed to resolve a specialized dashboard component. Rendering fallback warning.', {
        user: user.email,
        detectedRoles: user.roles,
        missingPermissions
    });

    return (
        <div className="p-12 text-center max-w-md mx-auto space-y-6 bg-white border rounded-2xl shadow-sm mt-12">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto animate-pulse" />
            <h3 className="text-sm font-black uppercase text-gray-800 tracking-wider">No admission role has been assigned.</h3>
            
            <div className="text-left bg-gray-50 p-4 rounded-xl border text-xs text-gray-600 space-y-2 font-mono">
                <div><span className="font-bold text-gray-800">Current User:</span> {user.email}</div>
                <div><span className="font-bold text-gray-800">Detected Role:</span> {user.roles?.join(', ') || 'None'}</div>
                <div><span className="font-bold text-gray-800">Expected Role:</span> ADMISSION_OFFICER, COUNSELOR, or RECEPTIONIST</div>
                <div><span className="font-bold text-gray-800">Permission Missing:</span> {missingPermissions.join(', ')}</div>
            </div>
            
            <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Please contact the school system administrator to map your permissions.
            </p>
        </div>
    );
}

export default WorkspaceDashboard;
