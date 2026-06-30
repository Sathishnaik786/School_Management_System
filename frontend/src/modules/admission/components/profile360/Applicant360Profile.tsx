import React, { useState } from 'react';
import ProfileHeader from './ProfileHeader';
import TimelineEngine, { TimelineNode } from '../timeline/TimelineEngine';
import SLAIndicator from '../timeline/SLAIndicator';
import { 
    FileText, User, ShieldAlert, CheckSquare, Layers, Clock, 
    Calendar, PhoneCall, Award, DollarSign, MessageSquare, ClipboardList, Info
} from 'lucide-react';

interface Applicant360ProfileProps {
    applicant: {
        id: string;
        code: string;
        name: string;
        email: string;
        phone: string;
        grade: string;
        status: string;
        submittedAt: string;
        counselor?: string;
        candidateScore?: number;
        slaRemainingHours: number;
        slaTotalHours: number;
        documentChecklist: { name: string; verified: boolean }[];
        crmLeadTemp: 'HOT' | 'WARM' | 'COLD';
        crmLeadScore: number;
        examStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'EXEMPTED';
        examScore?: number;
        interviewStatus: 'PENDING' | 'RECOMMENDED' | 'REJECTED';
        feeStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
        auditLogs: any[];
    };
    onAction?: (actionType: string, payload: any) => void;
}

export function Applicant360Profile({ applicant, onAction }: Applicant360ProfileProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'crm' | 'evaluation' | 'fees' | 'comms' | 'audits'>('overview');

    const mockComms = [
        { type: 'EMAIL', subject: 'Application Received Successfully', sender: 'System', date: '3 days ago' },
        { type: 'SMS', subject: 'Reminder: Entrance Exam scheduled for tomorrow at 10 AM', sender: 'Admissions Office', date: '2 days ago' },
        { type: 'EMAIL', subject: 'Interview Panel Call Letter', sender: 'System', date: '1 day ago' },
    ];

    const timelineNodes: TimelineNode[] = [
        { id: 'inquiry', stage: 'Inquiry Registered', role: 'Receptionist', operator: 'Front Desk', status: 'complete', timestamp: '3 days ago', slaHours: 2 },
        { id: 'submitted', stage: 'Application Submitted', role: 'Parent', operator: 'Parent Self-service', status: 'complete', timestamp: '2 days ago', slaHours: 24 },
        { id: 'docs', stage: 'Documents Verification', role: 'Admission Officer', operator: applicant.counselor || 'System', status: applicant.status === 'DOCUMENT_CHECK' ? 'current' : 'complete', timestamp: '1 day ago', slaHours: 24 },
        { id: 'exam', stage: 'Entrance Exam', role: 'Exam Cell', operator: 'Coordinator', status: ['NEW', 'UNDER_REVIEW', 'DOCUMENT_CHECK'].includes(applicant.status) ? 'upcoming' : 'complete', timestamp: '12 hours ago', slaHours: 72 },
        { id: 'interview', stage: 'Interview Panel', role: 'Counselor', operator: 'Panel', status: applicant.status === 'INTERVIEW' ? 'current' : 'upcoming', slaHours: 24 }
    ];

    return (
        <div className="space-y-6">
            <ProfileHeader applicant={applicant} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-card p-5 border border-gray-150 dark:border-border/60 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 dark:text-gray-200">
                            Process Metadata
                        </h3>

                        {/* SLA Gauge */}
                        <SLAIndicator 
                            hoursRemaining={applicant.slaRemainingHours} 
                            totalHours={applicant.slaTotalHours} 
                        />

                        {/* Counselor Info */}
                        <div className="flex items-center justify-between text-xs py-2.5 border-b border-gray-50 dark:border-border/10">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Assigned Officer</span>
                            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                {applicant.counselor || 'Unassigned'}
                            </span>
                        </div>

                        {/* CRM details */}
                        <div className="flex items-center justify-between text-xs py-2.5 border-b border-gray-50 dark:border-border/10">
                            <span className="text-gray-400 font-bold uppercase text-[10px]">Lead Temperature</span>
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                                applicant.crmLeadTemp === 'HOT' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                                {applicant.crmLeadTemp}
                            </span>
                        </div>

                        {/* Risk Flags */}
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

                        {/* Checklist Completeness */}
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

                {/* Right Tabbed Section */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Navigation Tabs */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1 text-xs">
                        {(['overview', 'timeline', 'crm', 'evaluation', 'fees', 'comms', 'audits'] as const).map(tab => (
                            <button
                                key={tab}
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

                    {/* Tab Panels */}
                    <div className="bg-white dark:bg-card border border-gray-150 dark:border-border/60 rounded-2xl p-6 shadow-sm min-h-[350px]">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                        <Info className="w-4 h-4 text-indigo-500" /> Summary Information
                                    </h3>
                                    <p className="text-xs text-gray-500 font-medium leading-relaxed mt-2">
                                        Applicant applied for {applicant.grade} with admission code {applicant.code}. 
                                        Current process state is in {applicant.status.replace('_', ' ')} phase. 
                                        Document validation shows {applicant.documentChecklist.filter(d => d.verified).length} verified checklist files.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="p-3 bg-gray-50 border rounded-xl space-y-1">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Entrance Exam</span>
                                        <span className="text-xs font-black block text-gray-800 dark:text-gray-200">
                                            {applicant.examStatus} {applicant.examScore && `(${applicant.examScore}%)`}
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
                            <TimelineEngine nodes={timelineNodes} />
                        )}

                        {activeTab === 'crm' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <PhoneCall className="w-4 h-4 text-indigo-500" /> Lead Follow-up logs
                                </h3>
                                <div className="space-y-3.5">
                                    <div className="p-3.5 bg-gray-50 border rounded-xl flex items-center justify-between">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Lead Score</span>
                                            <span className="text-lg font-black text-indigo-600">{applicant.crmLeadScore}</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 block uppercase">Temperature</span>
                                            <span className="text-xs font-black text-gray-800 dark:text-gray-200">{applicant.crmLeadTemp}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xs font-black text-gray-800 dark:text-gray-200">Callback Action Plan</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                            Schedule followups via client CRM portal using the Action Buttons on the main review desk.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'evaluation' && (
                            <div className="space-y-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-indigo-500" /> entrance exam & interview
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-4 border rounded-xl bg-gray-50/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-black text-gray-800 dark:text-gray-200">Written Entrance Exam</span>
                                            <span className="text-xs font-bold text-indigo-600">{applicant.examStatus}</span>
                                        </div>
                                        {applicant.examScore !== undefined && (
                                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                <div className="bg-indigo-500 h-full" style={{ width: `${applicant.examScore}%` }} />
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
                                    <DollarSign className="w-4 h-4 text-indigo-500" /> Payment & receipts details
                                </h3>
                                <div className="p-4 border border-dashed rounded-xl text-center space-y-2 py-8">
                                    <DollarSign className="w-8 h-8 text-gray-400 mx-auto opacity-50" />
                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Fees Status: {applicant.feeStatus}
                                    </p>
                                    <p className="text-[11px] text-gray-400 font-medium">
                                        Review details under Fees panel on the desk or prompt parent payment invoice trigger.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'comms' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <MessageSquare className="w-4 h-4 text-indigo-500" /> Communications History
                                </h3>
                                <div className="divide-y divide-gray-100">
                                    {mockComms.map((comm, idx) => (
                                        <div key={idx} className="py-3 flex items-start justify-between text-xs gap-4">
                                            <div className="space-y-1">
                                                <span className="px-1.5 py-0.2 bg-gray-100 border text-[9px] rounded text-gray-500 font-black uppercase">
                                                    {comm.type}
                                                </span>
                                                <p className="font-bold text-gray-800 dark:text-gray-200">{comm.subject}</p>
                                            </div>
                                            <span className="text-[10px] text-gray-400 shrink-0">{comm.date}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'audits' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                    <ClipboardList className="w-4 h-4 text-indigo-500" /> Audit Log events
                                </h3>
                                <div className="space-y-3 text-xs">
                                    {applicant.auditLogs?.map((log, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl space-y-1">
                                            <div className="flex items-center justify-between font-bold">
                                                <span className="text-gray-800 dark:text-gray-200">{log.action}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(log.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                By: {log.operator_name} • Remarks: {log.remarks || 'None'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Applicant360Profile;
