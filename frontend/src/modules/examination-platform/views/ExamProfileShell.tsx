import React from 'react';
import { PageHeader } from '../shared/components/PageHeader';
import { useAuth } from '../../../context/AuthContext';
import { useExamContext } from '../providers/ExamProvider';
import { InfoCard } from '../shared/components/InfoCard';

export const ExamProfileShell: React.FC = () => {
  const { user } = useAuth();
  const { activeRole } = useExamContext();

  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Candidate Profile"
        description="Verify your registration records and institutional access scopes below."
      />

      <InfoCard
        title="Identity Verification Required"
        description="Your credentials must match your national ID inputs during entrance checks. If details are incorrect, contact the Exam Cell."
        variant="info"
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Full Candidate Name</span>
            <p className="text-sm font-bold text-slate-800">{user?.full_name || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Registered Email ID</span>
            <p className="text-sm font-bold text-slate-800">{user?.email || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Portal Role</span>
            <p className="text-sm font-bold text-blue-600 capitalize">{activeRole}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Account Access Levels</span>
            <p className="text-xs font-semibold text-slate-600 truncate">
              {user?.roles?.join(', ') || 'Standard Candidate'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamProfileShell;
