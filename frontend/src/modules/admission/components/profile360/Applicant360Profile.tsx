import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import { TimelineEngine } from '../timeline/TimelineEngine';
import SLAIndicator from '../timeline/SLAIndicator';
import { LeadTimeline } from '../inquiry/LeadTimeline';
import { CommunicationCenter } from '../../../common/communication/CommunicationCenter';
import type { Applicant360View } from '../../utils/applicant360.mapper';
import {
    User, ShieldAlert, PhoneCall, Award, DollarSign, MessageSquare, ClipboardList, Info,
} from 'lucide-react';
import { scoreTierLabel } from '../../utils/lead.score';

interface Applicant360ProfileProps {
    applicant: Applicant360View;
    applicationId: string;
}

export function Applicant360Profile({ applicant, applicationId }: Applicant360ProfileProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'crm' | 'evaluation' | 'fees' | 'comms' | 'audits'>('overview');

    return (
        <div className="space-y-6">
            <ProfileHeader applicant={applicant} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card p-5 border border-gray-150 dark:border-border/60 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                            Process Metadata
                        </h3>

                        <SLAIndicator
                            hoursRemaining={applicant.slaRemainingHours}
                            totalHours={applicant.slaTotalHours}
                        />

                        <div className="flex items-center justify-between text-xs py-2.5 border-b border-gray-50 dark:border-border/10">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Assigned Officer</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {applicant.counselor || 'Unassigned'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-2.5 border-b border-gray-50 dark:border-border/10">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Lead Score</span>
                            <span className="px-2 py-0.5 rounded font-black text-[9px] bg-indigo-50 text-indigo-600">
                                {scoreTierLabel(applicant.crmLeadTemp)} ({applicant.crmLeadScore})
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-xs py-2.5 border-b border-gray-50 dark:border-border/10">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Process Risk</span>
                            {applicant.slaRemainingHours <= 0 ? (
                                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-black text-[9px] flex items-center gap-0.5 animate-pulse">
                                    <ShieldAlert className="w-3 h-3" /> SLA BREACH
                                </span>
                            ) : (
                                <span className="text-emerald-600 font-black text-[10px]">LOW RISK</span>
                            )}
                        </div>

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase text-[10px]">
                                <span>Checklist completeness</span>
                                <span>
                                    {applicant.documentChecklist.filter(d => d.verified).length} / {applicant.documentChecklist.length}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {applicant.documentChecklist.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 font-medium">{doc.name}</span>
                                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                            doc.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                            {doc.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1 text-xs">
                        {(['overview', 'timeline', 'crm', 'evaluation', 'fees', 'comms', 'audits'] as const).map(tab => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 rounded-xl font-bold transition-all uppercase text-[10px] tracking-wider ${
                                    activeTab === tab
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 rounded-2xl p-6 shadow-sm min-h-[350px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                        <Info className="w-4 h-4 text-indigo-500" /> Summary Information
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2">
                                        {applicant.name} applied for {applicant.grade}. Current stage: {applicant.status}.
                                        Progress: {applicant.progressPercent}%. Documents verified:{' '}
                                        {applicant.documentChecklist.filter(d => d.verified).length} of {applicant.documentChecklist.length}.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 border rounded-xl space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Entrance Exam</span>
                                        <span className="text-xs font-black block text-gray-800 dark:text-gray-200">
                                            {applicant.examStatus} {applicant.examScore !== undefined && `(${applicant.examScore}%)`}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-gray-50 border rounded-xl space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Interview Panel</span>
                                        <span className="text-xs font-black block text-gray-800 dark:text-gray-200">
                                            {applicant.interviewStatus}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-gray-50 border rounded-xl space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Fees collection</span>
                                        <span className="text-xs font-black block text-gray-800 dark:text-gray-200">
                                            {applicant.feeStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'timeline' && (
                            applicant.timelineNodes.length > 0 ? (
                                <TimelineEngine nodes={applicant.timelineNodes} />
                            ) : (
                                <LeadTimeline entries={applicant.auditLogs} />
                            )
                        )}

                        {activeTab === 'crm' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <PhoneCall className="w-4 h-4 text-indigo-500" /> Lead Intelligence
                                </h3>
                                <div className="p-3.5 bg-gray-50 border rounded-xl flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Lead Score</span>
                                        <span className="text-lg font-black text-indigo-600">{applicant.crmLeadScore}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-gray-400 block uppercase">Tier</span>
                                        <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                                            {scoreTierLabel(applicant.crmLeadTemp)}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                    Score computed from response time, documents, and application progress. CRM follow-ups are managed from the Inquiry Workspace.
                                </p>
                            </div>
                        )}

                        {activeTab === 'evaluation' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-indigo-500" /> Entrance exam & interview
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-xl bg-gray-50/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-800 dark:text-gray-200">Written Entrance Exam</span>
                                            <span className="text-xs font-bold text-indigo-600">{applicant.examStatus}</span>
                                        </div>
                                        {applicant.examScore !== undefined && (
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full" style={{ width: `${Math.min(applicant.examScore, 100)}%` }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 border rounded-xl bg-gray-50/50 flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-800 dark:text-gray-200">Panel Interview Evaluation</span>
                                        <span className="text-xs font-bold text-indigo-600">{applicant.interviewStatus}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'fees' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-indigo-500" /> Payment & receipts
                                </h3>
                                <div className="p-4 border rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Status: {applicant.feeStatus}
                                    </p>
                                    {applicant.paymentAmount !== undefined && applicant.paymentAmount > 0 && (
                                        <p className="text-xs text-gray-500">Amount: ₹{applicant.paymentAmount}</p>
                                    )}
                                    {applicant.paymentReference && (
                                        <p className="text-xs text-gray-500">Reference: {applicant.paymentReference}</p>
                                    )}
                                    {applicant.enrollmentStatus && (
                                        <p className="text-xs text-gray-500">Enrollment: {applicant.enrollmentStatus}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'comms' && (
                            <CommunicationCenter
                                recipientId={applicationId}
                                recipientName={applicant.name}
                                recipientEmail={applicant.email}
                                recipientPhone={applicant.phone}
                            />
                        )}

                        {activeTab === 'audits' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-indigo-500" /> Audit log events
                                </h3>
                                {applicant.auditLogs.length === 0 ? (
                                    <p className="text-xs text-gray-400">No audit events recorded yet.</p>
                                ) : (
                                    <LeadTimeline entries={applicant.auditLogs} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Applicant360Profile;
