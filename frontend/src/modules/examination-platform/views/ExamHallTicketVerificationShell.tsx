import React, { useState } from 'react';
import { PageHeader } from '../shared/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound, ShieldCheck, ShieldAlert } from 'lucide-react';

export const ExamHallTicketVerificationShell: React.FC = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim() === 'VALID-123') {
      setStatus('success');
    } else {
      setStatus('failed');
    }
  };

  return (
    <div className="space-y-6 text-left max-w-xl mx-auto py-6">
      <PageHeader
        title="Verify Hall Ticket Pass"
        description="Verify registered eligibility criteria, exam seating assignments, and invigilator codes."
      />

      <Card className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-premium-md space-y-4">
        <CardContent className="p-0">
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Enter Registration / Hall Ticket Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. VALID-123"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600 focus:bg-white text-slate-800 font-semibold transition-all shadow-premium-sm"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-2.5 text-xs shadow-premium-sm">
              Verify Credentials
            </Button>
          </form>

          {status === 'success' && (
            <div className="mt-4 flex gap-3 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-emerald-800 text-xs font-semibold leading-relaxed">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-700 mb-0.5">Hall Ticket Verified</p>
                <p>Eligible: Entrance Assessment AY 2025. Seating Code: Room 204B.</p>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="mt-4 flex gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-800 text-xs font-semibold leading-relaxed">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold uppercase tracking-wider text-[10px] text-rose-700 mb-0.5">Verification Failed</p>
                <p>No valid candidates match that barcode or code input. Please contact the admissions desk.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExamHallTicketVerificationShell;
