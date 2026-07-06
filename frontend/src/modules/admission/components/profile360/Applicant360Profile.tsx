import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
    User, ShieldAlert, PhoneCall, Award, DollarSign, MessageSquare, ClipboardList, Info, FileText, History as HistoryIcon
} from 'lucide-react';
import { scoreTierLabel } from '../../utils/lead.score';
import { admissionApi } from '../../admission.api';
import { useEnrollment, useEnrollmentStatus } from '../../hooks/useEnrollment';
import { mapStatusToEnterpriseLabel } from '../../utils/statusMapper';
import { toast } from 'sonner';
import { AdmissionEngine, ADMISSION_EVENTS } from '../../core/AdmissionEngine';
import { Button } from '../../../../components/ui/button';

// Visual Workflow Ribbon component
function WorkflowRibbon({ status }: { status: string }) {
    const stages = [
        { label: 'Application Created', statuses: ['draft', 'submitted'] },
        { label: 'Review', statuses: ['under_review'] },
        { label: 'Documents', statuses: ['docs_pending', 'docs_verified', 'document_verified'] },
        { label: 'Interview', statuses: ['interview', 'interview_completed'] },
        { label: 'Exam', statuses: ['exam', 'exam_completed'] },
        { label: 'Merit', statuses: ['merit_generated', 'merit'] },
        { label: 'Fees', statuses: ['fee_pending', 'fee_verified'] },
        { label: 'Approval', statuses: ['approved', 'approved_pending', 'review_pending'] },
        { label: 'Offer', statuses: ['offered'] },
        { label: 'Enrollment', statuses: ['enrollment_pending'] },
        { label: 'ERP Student', statuses: ['enrolled'] }
    ];

    const currentIdx = stages.findIndex(s => {
        const key = s.statuses.includes(status.toLowerCase().trim()) ||
            s.label.toLowerCase() === status.toLowerCase().trim();
        return key;
    });
    const resolvedIdx = currentIdx !== -1 ? currentIdx : 0;

    return (
        <div className="bg-white dark:bg-card p-4 border border-gray-150 dark:border-border/60 rounded-2xl shadow-sm overflow-x-auto">
            <div className="flex items-center gap-2 min-w-[1000px] justify-between">
                {stages.map((stage, i) => {
                    const isCompleted = i < resolvedIdx;
                    const isCurrent = i === resolvedIdx;
                    const isPending = i > resolvedIdx;

                    let bgStyle = 'bg-gray-50 text-gray-400 border-gray-200';
                    if (isCompleted) {
                        bgStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    } else if (isCurrent) {
                        bgStyle = 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-2 ring-indigo-100 animate-pulse';
                    }

                    return (
                        <React.Fragment key={stage.label}>
                            <div className={`flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl border flex-1 text-center ${bgStyle}`}>
                                <span className="text-[9px] font-black uppercase tracking-wider">
                                    {isCompleted ? '✓ Done' : isCurrent ? '● Active' : '○ Pending'}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-wide truncate">{stage.label}</span>
                            </div>
                            {i < stages.length - 1 && (
                                <span className="text-gray-300 font-bold">→</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}

const STAFF_TABS = [
    'Overview',
    'CRM',
    'Documents',
    'Interview',
    'Exam',
    'Review',
    'Fees',
    'Approval',
    'Enrollment',
    'Timeline',
    'Communication',
    'Audit',
    'History'
] as const;

const PARENT_TABS = ['Overview', 'Timeline', 'Documents', 'Interview', 'Exam', 'Fees'] as const;
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
    initialTab = 'Overview',
}: Applicant360ProfileProps) {
    const tabs = readOnlyMode ? PARENT_TABS : STAFF_TABS;
    const resolvedTab = tabs.includes(initialTab as typeof PARENT_TABS[number]) ? initialTab : 'Overview';
    const [activeTab, setActiveTab] = useState<ProfileTab>(resolvedTab);

    // Interactive Action states
    const [sigName, setSigName] = useState('');
    const [appNotes, setAppNotes] = useState('');
    const [isActionSubmitting, setIsActionSubmitting] = useState(false);

    // Dynamic Audit / History states
    const [auditEntries, setAuditEntries] = useState<any[]>([]);
    const [historyEntries, setHistoryEntries] = useState<any[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Enrollment / Handoff section states
    const [selectedSection, setSelectedSection] = useState('A');
    const [rollInput, setRollInput] = useState('');

    const queryClient = useQueryClient();
    const { data: enrollmentStatus, refetch: refetchEnrollment } = useEnrollmentStatus(applicationId);
    const { enroll, confirm, isEnrolling, isConfirming } = useEnrollment();

    const displayProgress = progress?.progressPercent ?? applicant.progressPercent;

    const fetchLogs = async () => {
        if (!applicationId) return;
        try {
            setLogsLoading(true);
            const audits = await admissionApi.getAuditLogs(applicationId);
            const history = await admissionApi.getStatusHistory(applicationId);
            setAuditEntries(audits);
            setHistoryEntries(history);
        } catch (e) {
            console.error('Failed to load logs', e);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'Audit' || activeTab === 'History') {
            fetchLogs();
        }
    }, [applicationId, activeTab]);

    // Principal Action handles
    const handlePrincipalAction = async (action: 'approve' | 'reject') => {
        if (!appNotes) return toast.warning('Please enter approval/rejection notes first');
        if (action === 'approve' && !sigName) return toast.warning('Principal digital signature name required');

        try {
            setIsActionSubmitting(true);
            if (action === 'approve') {
                await admissionApi.approve(applicationId, appNotes);
                toast.success('Application successfully approved');
            } else {
                await admissionApi.reject(applicationId, appNotes);
                toast.success('Application rejected');
            }
            refetchEnrollment();
            fetchLogs();
            AdmissionEngine.dispatch(queryClient, ADMISSION_EVENTS.QUEUE_REFRESH);
        } catch (err) {
            toast.error('Workflow transition failed');
        } finally {
            setIsActionSubmitting(false);
        }
    };

    const handleOfferAction = async (action: 'generate' | 'send' | 'accept' | 'reject') => {
        try {
            setIsActionSubmitting(true);
            if (action === 'generate') {
                await admissionApi.generateOffer({ application_id: applicationId });
                toast.success('Offer letter generated successfully');
            } else if (action === 'send') {
                await admissionApi.sendOffer({ application_id: applicationId });
                toast.success('Offer letter released to parent');
            } else if (action === 'accept') {
                await admissionApi.acceptOffer({ application_id: applicationId });
                toast.success('Offer accepted');
            } else if (action === 'reject') {
                await admissionApi.rejectOffer({ application_id: applicationId });
                toast.success('Offer rejected');
            }
            refetchEnrollment();
            fetchLogs();
            AdmissionEngine.dispatch(queryClient, ADMISSION_EVENTS.QUEUE_REFRESH);
        } catch {
            toast.error('Offer action failed');
        } finally {
            setIsActionSubmitting(false);
        }
    };

    // Provision / Handoff handles
    const handleProvisionAction = async (type: 'confirm' | 'enroll') => {
        try {
            if (type === 'confirm') {
                await confirm({ applicationId });
                toast.success('Candidate academic details confirmed');
            } else {
                if (!rollInput) return toast.warning('Please enter a Section / Roll Number first');
                await enroll({ applicationId });
                toast.success('Student successfully provisioned to ERP Student Master!');
            }
            refetchEnrollment();
            fetchLogs();
            AdmissionEngine.dispatch(queryClient, ADMISSION_EVENTS.QUEUE_REFRESH);
        } catch (err: any) {
            toast.error(err?.message || 'Provisioning error occurred');
        }
    };

    return (
        <div className="space-y-6">
            <ProfileHeader applicant={applicant} />
            <WorkflowRibbon status={applicant.status} />

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
                        {activeTab === 'Overview' && (
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

                        {activeTab === 'Timeline' && (
                            applicant.timelineNodes.length > 0 ? (
                                <TimelineEngine nodes={applicant.timelineNodes} />
                            ) : readOnlyMode ? (
                                <p className="text-xs text-gray-400">Timeline will appear as your application progresses.</p>
                            ) : (
                                <LeadTimeline entries={applicant.auditLogs} />
                            )
                        )}

                        {!readOnlyMode && activeTab === 'CRM' && (
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

                        {activeTab === 'Documents' && (
                            <Applicant360DocumentsPanel applicationId={applicationId} progress={progress} readOnlyMode={readOnlyMode} />
                        )}

                        {!readOnlyMode && activeTab === 'Review' && (
                            <Applicant360ReviewPanel applicationId={applicationId} />
                        )}

                        {activeTab === 'Interview' && (
                            <Applicant360InterviewPanel applicationId={applicationId} readOnlyMode={readOnlyMode} />
                        )}

                        {activeTab === 'Exam' && (
                            <Applicant360ExamPanel applicationId={applicationId} readOnlyMode={readOnlyMode} />
                        )}

                        {activeTab === 'Fees' && (
                            <Applicant360FeesPanel applicationId={applicationId} readOnlyMode={readOnlyMode} />
                        )}

                        {activeTab === 'Approval' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <ShieldAlert className="w-4 h-4 text-indigo-500" /> Principal Decision & Offer Release
                                </h3>

                                <div className="space-y-3 p-4 border rounded-xl bg-gray-50/50">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Approval Notes</label>
                                        <textarea
                                            value={appNotes}
                                            onChange={e => setAppNotes(e.target.value)}
                                            placeholder="Enter approval criteria, merit list details, or principal feedback..."
                                            className="w-full text-xs border rounded-lg p-2 min-h-[80px]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Digital Signature</label>
                                        <input
                                            type="text"
                                            value={sigName}
                                            onChange={e => setSigName(e.target.value)}
                                            placeholder="Type full name to sign"
                                            className="w-full text-xs border rounded-lg p-2"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                                            disabled={isActionSubmitting}
                                            onClick={() => handlePrincipalAction('approve')}
                                        >
                                            Approve Application
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="text-xs"
                                            disabled={isActionSubmitting}
                                            onClick={() => handlePrincipalAction('reject')}
                                        >
                                            Reject Application
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4 border rounded-xl bg-white">
                                    <h4 className="text-xs font-black uppercase text-gray-700">Offer Letter Actions</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isActionSubmitting}
                                            onClick={() => handleOfferAction('generate')}
                                            className="text-xs"
                                        >
                                            Generate Offer Letter
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isActionSubmitting}
                                            onClick={() => handleOfferAction('send')}
                                            className="text-xs"
                                        >
                                            Release Offer
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isActionSubmitting}
                                            onClick={() => handleOfferAction('accept')}
                                            className="text-xs"
                                        >
                                            Accept Offer
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={isActionSubmitting}
                                            onClick={() => handleOfferAction('reject')}
                                            className="text-xs text-rose-600 hover:bg-rose-50"
                                        >
                                            Reject Offer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'Enrollment' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-indigo-500" /> ERP SIS Student Handoff
                                </h3>

                                <div className="p-4 border rounded-xl bg-gray-50/50 space-y-4 text-xs">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Academic Section</label>
                                            <select
                                                value={selectedSection}
                                                onChange={e => setSelectedSection(e.target.value)}
                                                className="w-full border rounded-lg p-2 bg-white"
                                            >
                                                <option value="A">Section A</option>
                                                <option value="B">Section B</option>
                                                <option value="C">Section C</option>
                                                <option value="D">Section D</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Admission / Roll No</label>
                                            <input
                                                type="text"
                                                value={rollInput}
                                                onChange={e => setRollInput(e.target.value)}
                                                placeholder="e.g. ADM-2026-0041"
                                                className="w-full border rounded-lg p-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t pt-3 flex flex-wrap gap-2">
                                        <Button
                                            size="sm"
                                            disabled={isConfirming}
                                            onClick={() => handleProvisionAction('confirm')}
                                            className="bg-indigo-600 text-xs"
                                        >
                                            {isConfirming ? 'Confirming...' : 'Confirm Candidate Details'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={isEnrolling}
                                            onClick={() => handleProvisionAction('enroll')}
                                            className="bg-emerald-600 text-xs"
                                        >
                                            {isEnrolling ? 'Provisioning...' : 'Finalize Handoff & Enroll'}
                                        </Button>
                                    </div>

                                    {enrollmentStatus && (
                                        <div className="p-3 bg-white border rounded-xl space-y-1">
                                            <p className="font-bold text-gray-800">ERP Student Status Check</p>
                                            <p className="text-gray-500">Student ID: <span className="font-bold text-indigo-600">{enrollmentStatus.studentId || 'Not Yet Provisioned'}</span></p>
                                            <p className="text-gray-500">Admission Number: <span className="font-bold text-indigo-600">{enrollmentStatus.admissionNumber || '—'}</span></p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!readOnlyMode && activeTab === 'Communication' && (
                            <CommunicationCenter
                                recipientId={applicationId}
                                recipientName={applicant.name}
                                recipientEmail={applicant.email}
                                recipientPhone={applicant.phone}
                            />
                        )}

                        {!readOnlyMode && activeTab === 'Audit' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-indigo-500" /> Live Audit Logs (PostgreSQL)
                                </h3>
                                {logsLoading ? (
                                    <p className="text-xs text-gray-400 animate-pulse">Loading live audits...</p>
                                ) : auditEntries.length === 0 ? (
                                    <p className="text-xs text-gray-400">No audit events recorded yet.</p>
                                ) : (
                                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                                        {auditEntries.map((log: any, idx: number) => (
                                            <div key={idx} className="p-3 border rounded-xl bg-gray-50/50 text-xs space-y-1">
                                                <div className="flex items-center justify-between font-bold">
                                                    <span className="text-indigo-600">{log.action}</span>
                                                    <span className="text-gray-400 text-[10px]">{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                                <p className="text-gray-600 font-medium">{log.remarks || 'No remarks listed'}</p>
                                                <p className="text-[10px] text-gray-400 uppercase font-black">Performed by ID: {log.user_id || 'SYSTEM'}</p>
                                                {log.ip_address && <p className="text-[9px] text-gray-400 font-bold">IP: {log.ip_address} • Agent: {log.user_agent?.slice(0, 50)}...</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {!readOnlyMode && activeTab === 'History' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <HistoryIcon className="w-4 h-4 text-indigo-500" /> Status Transitions History
                                </h3>
                                {logsLoading ? (
                                    <p className="text-xs text-gray-400 animate-pulse">Loading transitions...</p>
                                ) : historyEntries.length === 0 ? (
                                    <p className="text-xs text-gray-400">No transitions recorded yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {historyEntries.map((hist: any, idx: number) => (
                                            <div key={idx} className="p-3 border rounded-xl bg-white text-xs flex items-start justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-black">{hist.old_status || 'INIT'}</span>
                                                        <span className="text-gray-400">→</span>
                                                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-black">{hist.new_status}</span>
                                                    </div>
                                                    <p className="text-gray-600 font-medium mt-1">{hist.reason || 'Workflow state transition'}</p>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Event: {hist.event_name || 'WorkflowUpdate'} • By: {hist.changed_by || 'SYSTEM'}</p>
                                                </div>
                                                <span className="text-[10px] text-gray-400 font-bold shrink-0">{new Date(hist.created_at).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
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
