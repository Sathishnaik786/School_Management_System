import React from 'react';
import { PageHeader } from '../shared/components/PageHeader';
import { HelpCircle, Mail, Phone, ExternalLink } from 'lucide-react';
import { InfoCard } from '../shared/components/InfoCard';

export const ExamHelpShell: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <PageHeader
        title="Candidate Help & Guidelines Desk"
        description="Access platform diagnostics guides, FAQs, and institutional support resources."
      />

      <InfoCard
        title="Emergency Helpdesk Support"
        description="If you experience connection failures during active exams, immediately dial the helpline below or contact your local invigilator."
        variant="error"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none border-b border-slate-100 pb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Platform FAQs</span>
          </h4>
          <div className="space-y-4">
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800">1. What happens if my internet connection is lost?</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                The local Zustand store caches your descriptive inputs. Active countdown will continue. Reconnecting syncs cache updates.
              </p>
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-slate-800">2. How do I request extra time bounds?</h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Extra parameters are preconfigured by local registration databases. Invigilators can override active session bounds.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-premium-sm space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none border-b border-slate-100 pb-3">
            Institutional Support Contacts
          </h4>
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>Helpline: +1 (800) 555-0199</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>Email: exam-cell@edutrack.school</span>
            </div>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline pt-2"
            >
              <span>Download System Check User Manual</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHelpShell;
