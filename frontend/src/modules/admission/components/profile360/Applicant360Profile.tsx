import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import { TimelineEngine } from '../timeline/TimelineEngine';
import SLAIndicator from '../timeline/SLAIndicator';
import { LeadTimeline } from '../inquiry/LeadTimeline';
import { CommunicationCenter } from '../../../common/communication/CommunicationCenter';
import { Applicant360DocumentsPanel } from './Applicant360DocumentsPanel';
import { ApplicationProgressPanel } from './ApplicationProgressPanel';
import { Applicant360InterviewPanel } from './Applicant360InterviewPanel';
import { Applicant360ExamPanel } from './Applicant360ExamPanel';
import { Applicant360FeesPanel } from './Applicant360FeesPanel';
import { Applicant360ReviewPanel } from './Applicant360ReviewPanel';
import type { Applicant360View } from '../../utils/applicant360.mapper';
import type { ApplicationProgressReport } from '../../hooks/useApplicationProgress';
import {
    User, ShieldAlert, PhoneCall, Award, DollarSign, MessageSquare, ClipboardList, Info, FileText,
} from 'lucide-react';
import { scoreTierLabel } from '../../utils/lead.score';

const STAFF_TABS = ['overview', 'timeline', 'crm', 'documents', 'evaluation', 'interview', 'exam', 'fees', 'comms', 'audits'] as const;
const PARENT_TABS = ['overview', 'timeline', 'documents', 'interview', 'exam', 'fees'] as const;
type ProfileTab = typeof STAFF_TABS[number];

interface Applicant360ProfileProps {
    applicant: Applicant360View;
    applicationId: string;
    progress?: ApplicationProgressReport | null;
    progressLoading?: boolean;
    readOnlyMode?: boolean;
    initialTab?: ProfileTab;
}

export function Applicant360Profile({
    applicant,
    applicationId,
    progress,
    progressLoading,
    readOnlyMode = false,
    initialTab = 'overview',
}: Applicant360ProfileProps) {
    const tabs = readOnlyMode ? PARENT_TABS : STAFF_TABS;
    const resolvedTab = tabs.includes(initialTab as typeof PARENT_TABS[number]) ? initialTab : 'overview';
    const [activeTab, setActiveTab] = useState<ProfileTab>(resolvedTab);

    const displayProgress = progress?.progressPercent ?? applicant.progressPercent;

    return (
        <div className="space-y-6">
            <ProfileHeader applicant={applicant} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="space-y-6">
                    <ApplicationProgressPanel progress={progress ?? null} isLoading={progressLoading} />

                    <div className="bg-white dark:bg-card p-5 border border-gray-150 dark:border-border/60 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                            {readOnlyMode ? 'Application Progress' : 'Process Metadata'}
                        </h3>

                        {!readOnlyMode && (
                            <>
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
                            </>
                        )}

                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase text-[10px]">
                                <span>Checklist completeness</span>
                                <span>
                                    {progress?.sections.documents.completed ?? applicant.documentChecklist.filter(d => d.verified).length} /{' '}
                                    {progress?.sections.documents.total ?? applicant.documentChecklist.length}
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
                        {tabs.map(tab => (
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
                                        Progress: {displayProgress}%. Documents verified:{' '}
                                        {progress?.sections.documents.completed ?? applicant.documentChecklist.filter(d => d.verified).length} of{' '}
                                        {progress?.sections.documents.total ?? applicant.documentChecklist.length}.
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
                            ) : readOnlyMode ? (
                                <p className="text-xs text-gray-400">Timeline will appear as your application progresses.</p>
                            ) : (
                                <LeadTimeline entries={applicant.auditLogs} />
                            )
                        )}

                        {!readOnlyMode && activeTab === 'crm' && (
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

                        {activeTab === 'documents' && (
                            <Applicant360DocumentsPanel applicationId={applicationId} progress={progress} readOnlyMode={readOnlyMode} />
                        )}

                        {!readOnlyMode && activeTab === 'evaluation' && (
                            <Applicant360ReviewPanel applicationId={applicationId} />
                        )}

                        {activeTab === 'interview' && (
                            <Applicant360InterviewPanel applicationId={applicationId} readOnlyMode={readOnlyMode} />
                        )}

                        {activeTab === 'exam' && (
                            <Applicant360ExamPanel applicationId={applicationId} readOnlyMode={readOnlyMode} />
                        )}

                        {activeTab === 'fees' && (
                            <Applicant360FeesPanel applicationId={applicationId} readOnlyMode={readOnlyMode} />
                        )}

                        {!readOnlyMode && activeTab === 'comms' && (
                            <CommunicationCenter
                                recipientId={applicationId}
                                recipientName={applicant.name}
                                recipientEmail={applicant.email}
                                recipientPhone={applicant.phone}
                            />
                        )}

                        {!readOnlyMode && activeTab === 'audits' && (
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
