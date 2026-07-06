import React, { useMemo } from 'react';
import { ShieldCheck, AlertCircle, FileSignature } from 'lucide-react';
import KPICards from '../../components/widgets/KPICards';
import { ActionQueueWidget } from '../../components/widgets/DashboardWidgets';
import { useVerificationQueue } from '../../hooks/useVerificationQueue';
import { mapApplicationsToActionItems } from '../../utils/admissionIntegration.mapper';

export function AdmissionOfficerDashboard() {
    const { applications, summaries, isLoading } = useVerificationQueue();

    const stats = useMemo(
        () => ({
            pending: summaries.reduce((acc, s) => acc + s.pendingCount, 0),
            missing: summaries.reduce((acc, s) => acc + s.missingCount, 0),
        }),
        [summaries],
    );

    const officerKPIs = [
        { title: 'Awaiting Verification', value: stats.pending, description: 'Documents pending verification', icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
        { title: 'Missing Documents', value: stats.missing, description: 'Requires upload', icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
        { title: 'In Queue', value: applications.length, description: 'Submitted applications', icon: FileSignature, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    ];

    const actionItems = useMemo(
        () =>
            mapApplicationsToActionItems(
                applications,
                app => `Verify documents — ${app.student_name}`,
            ),
        [applications],
    );

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                Admission Desk Officer Console
            </h2>

            <KPICards cards={officerKPIs} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 p-6 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                            Document Checklist Verification Queue
                        </h3>
                        {isLoading ? (
                            <p className="text-xs text-gray-400 animate-pulse">Loading…</p>
                        ) : summaries.length === 0 ? (
                            <p className="text-xs text-gray-400 py-6 text-center">No applications in verification queue.</p>
                        ) : (
                            <div className="divide-y divide-gray-100 text-xs">
                                {summaries.slice(0, 8).map(item => (
                                    <div key={item.applicationId} className="py-3 flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <p className="font-bold text-gray-900 dark:text-gray-100">{item.studentName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                {item.applicationId.slice(0, 8)} • {item.grade ?? '—'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 font-bold">
                                                {item.verifiedCount}/{item.totalDocuments} Verified
                                            </span>
                                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-50 text-amber-600">
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <ActionQueueWidget items={actionItems} />
                </div>
            </div>
        </div>
    );
}

export default AdmissionOfficerDashboard;
