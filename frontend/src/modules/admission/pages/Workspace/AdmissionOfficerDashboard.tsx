import React from 'react';
import { ShieldCheck, Clock, Users, FileSignature, AlertCircle } from 'lucide-react';
import KPICards from '../../components/widgets/KPICards';
import { ActionQueueWidget } from '../../components/widgets/DashboardWidgets';

export function AdmissionOfficerDashboard() {
    const officerKPIs = [
        { title: 'Awaiting Verification', value: 18, description: 'Documents pending verification', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { title: 'SLA Breaches', value: 2, description: 'Requires immediate action', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        { title: 'Verified Today', value: 24, description: 'Checklists fully completed', icon: FileSignature, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
    ];

    const mockActions = [
        { id: '1', title: 'Verify Birth Certificate', description: 'Rohan Sharma (APP00124) re-uploaded document', status: 'urgent', time: 'Just now' },
        { id: '2', title: 'Grade 10 Marksheet Check', description: 'Preeti Deshmukh (APP00142) submitted marksheets', status: 'pending', time: '2 hours ago' },
        { id: '3', title: 'Verify Signature Form', description: 'Karan Malhotra (APP00111) checklist verification completed', status: 'completed', time: '4 hours ago' }
    ] as any;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Admission Desk Officer Console
            </h2>

            <KPICards cards={officerKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Document Verification Queue */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                                Document Checklist Verification Queue
                            </h3>
                        </div>

                        <div className="divide-y divide-gray-100 text-xs">
                            {[
                                { name: 'Rohan Sharma', code: 'APP00124', grade: 'Grade 5', documents: '2/3 Verified', sla: '4 hours remaining', slaStatus: 'warning' },
                                { name: 'Karan Malhotra', code: 'APP00111', grade: 'Grade 11', documents: '0/3 Verified', sla: 'Breached', slaStatus: 'breached' },
                                { name: 'Preeti Deshmukh', code: 'APP00142', grade: 'Grade 12', documents: '1/3 Verified', sla: '18 hours remaining', slaStatus: 'normal' }
                            ].map((item, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="font-bold text-gray-900 dark:text-gray-100">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{item.code} • {item.grade}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-500 font-bold">{item.documents}</span>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                            item.slaStatus === 'breached' ? 'bg-rose-50 text-rose-600' : item.slaStatus === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                        }`}>
                                            SLA: {item.sla}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Priority Queue */}
                <div className="space-y-6">
                    <ActionQueueWidget items={mockActions} />
                </div>
            </div>
        </div>
    );
}

export default AdmissionOfficerDashboard;
