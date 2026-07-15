import React from 'react';
import { Shield, ShieldAlert, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const ExamSessionShell: React.FC = () => {
  return (
    <div className="space-y-6 text-left text-slate-100 max-w-2xl mx-auto py-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/35 flex items-center justify-center text-blue-500">
          <Shield className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-display font-extrabold text-slate-100 leading-tight">Live Test Environment</h2>
          <p className="text-xs text-slate-400 font-semibold">Active Assessment: Entrance Exam AY 2025</p>
        </div>
      </div>

      <Card className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-premium-2xl space-y-4">
        <CardContent className="p-0 space-y-4 text-xs text-slate-350 leading-relaxed">
          <div className="flex gap-3 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-350 font-bold">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Tab switches and hardware escape actions will automatically terminate this live attempt.</span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none border-b border-slate-800 pb-2">
              Active Candidate Guidelines
            </h4>
            <ul className="list-disc pl-5 space-y-2 font-semibold">
              <li>Do not leave the camera frame.</li>
              <li>Calculators or notes are strictly prohibited.</li>
              <li>Timer will continue counting down even in case of window minimize.</li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-center">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest">
              <Award className="w-4 h-4 text-blue-500" />
              <span>Assessment Content Loaded Securely</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamSessionShell;
