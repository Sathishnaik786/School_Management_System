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

export function WorkspaceDashboard() {
    const { user } = useAuth();
    const roles = user?.roles?.map(r => r.toUpperCase()) || [];

    // Dispatch dashboard component based on role
    if (roles.includes('PARENT') || roles.includes('STUDENT')) {
        return <ParentDashboard />;
    }
    if (roles.includes('RECEPTIONIST') || roles.includes('FRONT_DESK')) {
        return <ReceptionistDashboard />;
    }
    if (roles.includes('COUNSELOR') || roles.includes('COUNSELLOR')) {
        return <CounselorDashboard />;
    }
    if (roles.includes('ADMISSION_OFFICER')) {
        return <AdmissionOfficerDashboard />;
    }
    if (roles.includes('EXAM_CELL') || roles.includes('EXAM_CELL_ADMIN')) {
        return <ExamCellDashboard />;
    }
    if (roles.includes('PRINCIPAL') || roles.includes('HOI') || roles.includes('HEAD_OF_INSTITUTE') || roles.includes('ADMIN') || roles.includes('SUPERADMIN')) {
        return <PrincipalDashboard />;
    }
    if (roles.includes('FINANCE_OFFICER') || roles.includes('ACCOUNTANT')) {
        return <FinanceDashboard />;
    }

    return (
        <div className="p-12 text-center max-w-md mx-auto space-y-4 bg-white border rounded-2xl shadow-sm mt-12">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-sm font-black uppercase text-gray-800">Generic Admissions Portal</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Your account does not have a specialized admissions role assigned. 
                Please contact the school system administrator to map your permissions.
            </p>
        </div>
    );
}

export default WorkspaceDashboard;
