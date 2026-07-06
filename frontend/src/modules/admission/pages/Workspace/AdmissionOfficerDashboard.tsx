import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Search, Filter, CheckSquare, Trash2, ShieldCheck, AlertCircle, FileSignature,
    Calendar, DollarSign, Award, Clock, ArrowRight, User, Users, CheckCircle2,
    XCircle, Download, Sparkles, History, BookOpen, AlertTriangle, Eye, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useApplicationList } from '../../hooks/useApplication';
import { mapStatusToEnterpriseLabel } from '../../utils/statusMapper';
import { AdmissionEngine, ADMISSION_EVENTS } from '../../core/AdmissionEngine';
import { scoreTierLabel } from '../../utils/lead.score';
import Applicant360Profile from '../../components/profile360/Applicant360Profile';
import { Button } from '../../../../components/ui/button';
import { useAuth } from '../../../../context/AuthContext';
import { admissionApi } from '../../admission.api';
import { useApplicationProgress } from '../../hooks/useApplicationProgress';

// Define Kanban Pipeline columns
const PIPELINE_COLUMNS = [
    'New Applications',
    'Under Review',
    'Document Verification',
    'Interview',
    'Entrance Examination',
    'Merit List',
    'Fee Verification',
    'Principal Approval',
    'Offer Released',
    'Enrollment',
    'Enrolled',
    'Rejected',
    'Cancelled'
];

const mapStatusToPipelineColumn = (status?: string): string => {
    if (!status) return 'New Applications';
    const s = status.toLowerCase().trim();
    switch (s) {
        case 'draft':
        case 'submitted':
            return 'New Applications';
        case 'under_review':
            return 'Under Review';
        case 'docs_pending':
        case 'document_verified':
        case 'docs_verified':
            return 'Document Verification';
        case 'interview':
        case 'interview_completed':
            return 'Interview';
        case 'exam':
        case 'exam_completed':
            return 'Entrance Examination';
        case 'merit_generated':
        case 'merit':
            return 'Merit List';
        case 'fee_pending':
        case 'fee_verified':
            return 'Fee Verification';
        case 'review_pending':
        case 'approved':
            return 'Principal Approval';
        case 'offered':
            return 'Offer Released';
        case 'enrollment_pending':
            return 'Enrollment';
        case 'enrolled':
            return 'Enrolled';
        case 'rejected':
            return 'Rejected';
        case 'cancelled':
            return 'Cancelled';
        default:
            return 'New Applications';
    }
};

const calculateProgressPercent = (status?: string): number => {
    if (!status) return 10;
    const s = status.toLowerCase().trim();
    switch (s) {
        case 'draft':
        case 'submitted':
            return 10;
        case 'under_review':
            return 20;
        case 'docs_pending':
            return 30;
        case 'document_verified':
        case 'docs_verified':
            return 45;
        case 'interview':
            return 60;
        case 'interview_completed':
            return 70;
        case 'exam':
        case 'exam_completed':
            return 80;
        case 'merit_generated':
        case 'merit':
            return 85;
        case 'fee_pending':
            return 90;
        case 'fee_verified':
        case 'enrollment_pending':
            return 95;
        case 'enrolled':
            return 100;
        default:
            return 100;
    }
};

const calculateNextAction = (status?: string): string => {
    if (!status) return 'Submit Application';
    const s = status.toLowerCase().trim();
    switch (s) {
        case 'draft':
            return 'Submit Application';
        case 'submitted':
            return 'Review Profile';
        case 'under_review':
        case 'docs_pending':
            return 'Verify Documents';
        case 'document_verified':
        case 'docs_verified':
            return 'Schedule Interview';
        case 'interview':
            return 'Record Interview Score';
        case 'exam':
            return 'Record Exam Marks';
        case 'merit_generated':
        case 'merit':
        case 'review_pending':
            return 'Principal Approval';
        case 'approved':
            return 'Release Offer';
        case 'offered':
            return 'Collect Fees';
        case 'fee_pending':
            return 'Collect Fees';
        case 'fee_verified':
        case 'enrollment_pending':
            return 'Enroll Student';
        case 'enrolled':
            return 'ERP Handoff Complete';
        default:
            return 'No action pending';
    }
};

interface SLAInfo {
    status: 'Within SLA' | 'Warning' | 'Critical' | 'Breached' | 'Completed';
    remainingHours: number;
}

const calculateSLA = (createdAt: string, status?: string): SLAInfo => {
    const isDone = ['enrolled', 'rejected', 'cancelled'].includes(status?.toLowerCase() || '');
    if (isDone) return { status: 'Completed', remainingHours: 0 };

    const createdTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const elapsedHours = (now - createdTime) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, 72 - elapsedHours);

    if (elapsedHours > 72) return { status: 'Breached', remainingHours };
    if (elapsedHours > 48) return { status: 'Critical', remainingHours };
    if (elapsedHours > 24) return { status: 'Warning', remainingHours };
    return { status: 'Within SLA', remainingHours };
};

export function AdmissionOfficerDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { applications, isLoading, refetch } = useApplicationList({ limit: 1000 });

    // Active state selectors
    const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
    const [activeQueue, setActiveQueue] = useState<string>('My Queue');
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

    // Search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedCounselor, setSelectedCounselor] = useState('All');
    const [selectedSla, setSelectedSla] = useState('All');
    const [selectedRisk, setSelectedRisk] = useState('All');

    // Bulk selection state
    const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

    // Load extra progress metrics when selected
    const { progress: selectedProgress, isLoading: selectedProgressLoading } = useApplicationProgress(selectedAppId || undefined);

    // Find full record of selected application
    const selectedApplication = useMemo(() => {
        return applications.find(a => a.id === selectedAppId) || null;
    }, [applications, selectedAppId]);

    // Mapped selected application view input
    const applicant360View = useMemo(() => {
        if (!selectedApplication) return null;
        const sla = calculateSLA(selectedApplication.created_at, selectedApplication.status);
        const docs = selectedApplication.admission_documents || [];
        return {
            id: selectedApplication.id,
            uiStatus: selectedApplication.status,
            name: selectedApplication.student_name,
            code: selectedApplication.id.slice(0, 8).toUpperCase(),
            email: selectedApplication.parent_email || '',
            phone: selectedApplication.parent_phone || '',
            grade: selectedApplication.grade_applied_for,
            status: mapStatusToEnterpriseLabel(selectedApplication.status),
            candidateScore: selectedApplication.payment_amount || 0,
            submittedAt: selectedApplication.submitted_at || selectedApplication.created_at,
            progressPercent: calculateProgressPercent(selectedApplication.status),
            slaRemainingHours: Math.round(sla.remainingHours),
            slaTotalHours: 72,
            counselor: selectedApplication.parent_name || 'Unassigned',
            crmLeadTemp: 'hot' as const,
            crmLeadScore: 85,
            documentChecklist: docs.map(d => ({
                name: d.document_type.replace(/_/g, ' ').toUpperCase(),
                verified: !!d.file_url,
            })),
            timelineNodes: [],
            auditLogs: (selectedApplication.admission_audit_logs || []).map(l => ({
                id: l.id,
                action: l.action,
                actor: l.performed_by,
                remarks: l.remarks,
                timestamp: l.created_at,
            })),
            examStatus: (selectedApplication.payment_verified ? 'PASSED' : 'PENDING') as any,
            examScore: 88,
            interviewStatus: (selectedApplication.payment_verified ? 'RECOMMENDED' : 'PENDING') as any,
            feeStatus: (selectedApplication.payment_verified ? 'VERIFIED' : 'PENDING') as any,
        };
    }, [selectedApplication]);

    // 14 Dynamic KPIs calculation
    const kpis = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const todayApps = applications.filter(a => new Date(a.created_at) >= startOfDay);
        const weekApps = applications.filter(a => new Date(a.created_at) >= startOfWeek);
        const pendingReview = applications.filter(a => ['submitted', 'under_review'].includes(a.status));
        const pendingDocs = applications.filter(a => (a.status as string) === 'docs_pending');
        const interviewToday = applications.filter(a => (a.status as string) === 'interview' && new Date(a.updated_at) >= startOfDay);
        const examToday = applications.filter(a => (a.status as string) === 'exam' && new Date(a.updated_at) >= startOfDay);
        const pendingFees = applications.filter(a => (a.status as string) === 'fee_pending');
        const readyForApproval = applications.filter(a => ['approved', 'review_pending'].includes(a.status));
        const readyForEnrollment = applications.filter(a => ['fee_verified', 'enrollment_pending'].includes(a.status));
        const enrolledToday = applications.filter(a => a.status === 'enrolled' && new Date(a.updated_at) >= startOfDay);
        const rejectedToday = applications.filter(a => a.status === 'rejected' && new Date(a.updated_at) >= startOfDay);

        const completed = applications.filter(a => ['enrolled', 'rejected'].includes(a.status));
        const avgProcessingHours = completed.length > 0
            ? completed.reduce((acc, a) => acc + (new Date(a.updated_at).getTime() - new Date(a.created_at).getTime()), 0) / completed.length / (1000 * 60 * 60)
            : 36;

        const pending = applications.filter(a => !['enrolled', 'rejected', 'cancelled'].includes(a.status));
        const breached = pending.filter(a => {
            const diffHours = (now.getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
            return diffHours > 72;
        });

        const avgSLA = pending.length > 0
            ? pending.reduce((acc, a) => {
                const diffHours = 72 - (now.getTime() - new Date(a.created_at).getTime()) / (1000 * 60 * 60);
                return acc + Math.max(0, diffHours);
            }, 0) / pending.length
            : 72;

        return [
            { label: 'Applications Today', value: todayApps.length, icon: FileSignature, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { label: 'Applications This Week', value: weekApps.length, icon: Calendar, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { label: 'Pending Review', value: pendingReview.length, icon: History, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { label: 'Pending Documents', value: pendingDocs.length, icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 border-purple-100' },
            { label: 'Interview Today', value: interviewToday.length, icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { label: 'Exam Today', value: examToday.length, icon: BookOpen, color: 'text-cyan-600 bg-cyan-50 border-cyan-100' },
            { label: 'Pending Fees', value: pendingFees.length, icon: DollarSign, color: 'text-rose-600 bg-rose-50 border-rose-100' },
            { label: 'Ready For Approval', value: readyForApproval.length, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { label: 'Ready For Enrollment', value: readyForEnrollment.length, icon: Award, color: 'text-lime-600 bg-lime-50 border-lime-100' },
            { label: 'Enrolled Today', value: enrolledToday.length, icon: Users, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
            { label: 'Rejected Today', value: rejectedToday.length, icon: XCircle, color: 'text-rose-600 bg-rose-100 border-rose-200' },
            { label: 'Avg Processing Time', value: `${Math.round(avgProcessingHours)}h`, icon: Clock, color: 'text-sky-600 bg-sky-50 border-sky-100' },
            { label: 'Average SLA', value: `${Math.round(avgSLA)}h`, icon: Clock, color: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
            { label: 'SLA Breached', value: breached.length, icon: AlertTriangle, color: 'text-rose-700 bg-rose-100 border-rose-300 font-bold animate-pulse' },
        ];
    }, [applications]);

    // Unique dropdown options dynamic lists
    const gradesList = useMemo(() => {
        const grades = new Set<string>();
        applications.forEach(a => { if (a.grade_applied_for) grades.add(a.grade_applied_for); });
        return ['All', ...Array.from(grades)];
    }, [applications]);

    const statusList = useMemo(() => {
        const statuses = new Set<string>();
        applications.forEach(a => { if (a.status) statuses.add(a.status); });
        return ['All', ...Array.from(statuses)];
    }, [applications]);

    const counselorsList = useMemo(() => {
        const counselors = new Set<string>();
        applications.forEach(a => { if (a.parent_name) counselors.add(a.parent_name); });
        return ['All', ...Array.from(counselors)];
    }, [applications]);

    // SLA & Risk helper computations for filtering
    const enrichedApplications = useMemo(() => {
        return applications.map(app => {
            const sla = calculateSLA(app.created_at, app.status);
            const risk = (sla.status === 'Breached' || app.status === 'payment_correction') ? 'High' : (sla.status === 'Critical' || sla.status === 'Warning') ? 'Medium' : 'Low';
            return {
                ...app,
                slaInfo: sla,
                riskTier: risk
            };
        });
    }, [applications]);

    // Filter applications
    const filteredApplications = useMemo(() => {
        return enrichedApplications.filter(app => {
            // Text Search
            const query = searchQuery.toLowerCase().trim();
            const textMatch = !query ||
                app.student_name?.toLowerCase().includes(query) ||
                app.id?.toLowerCase().includes(query) ||
                app.parent_email?.toLowerCase().includes(query) ||
                app.parent_phone?.toLowerCase().includes(query);

            const gradeMatch = selectedGrade === 'All' || app.grade_applied_for === selectedGrade;
            const statusMatch = selectedStatus === 'All' || app.status === selectedStatus;
            const counselorMatch = selectedCounselor === 'All' || app.parent_name === selectedCounselor;
            const slaMatch = selectedSla === 'All' || app.slaInfo.status === selectedSla;
            const riskMatch = selectedRisk === 'All' || app.riskTier === selectedRisk;

            // Interactive Queue filter
            let queueMatch = true;
            if (activeQueue === 'My Queue') {
                queueMatch = !app.parent_name || app.parent_name === user?.email;
            } else if (activeQueue === 'Pending Reviews') {
                queueMatch = ['submitted', 'under_review'].includes(app.status);
            } else if (activeQueue === 'Document Queue') {
                queueMatch = (app.status as string) === 'docs_pending';
            } else if (activeQueue === 'Fee Queue') {
                queueMatch = (app.status as string) === 'fee_pending';
            } else if (activeQueue === 'Enrollment Queue') {
                queueMatch = ['fee_verified', 'enrollment_pending'].includes(app.status);
            } else if (activeQueue === 'Escalated Applications') {
                queueMatch = app.status === 'payment_correction' || app.slaInfo.status === 'Breached';
            } else if (activeQueue === 'Overdue Applications') {
                queueMatch = app.slaInfo.status === 'Breached';
            } else if (activeQueue === 'Upcoming Interviews') {
                queueMatch = (app.status as string) === 'interview';
            } else if (activeQueue === 'Upcoming Exams') {
                queueMatch = (app.status as string) === 'exam';
            }

            return textMatch && gradeMatch && statusMatch && counselorMatch && slaMatch && riskMatch && queueMatch;
        });
    }, [enrichedApplications, searchQuery, selectedGrade, selectedStatus, selectedCounselor, selectedSla, selectedRisk, activeQueue, user?.email]);

    // Grouping by columns for Kanban
    const kanbanGroups = useMemo(() => {
        const groups: Record<string, typeof filteredApplications> = {};
        PIPELINE_COLUMNS.forEach(col => { groups[col] = []; });
        filteredApplications.forEach(app => {
            const col = mapStatusToPipelineColumn(app.status);
            if (groups[col]) {
                groups[col].push(app);
            } else {
                groups['New Applications'].push(app);
            }
        });
        return groups;
    }, [filteredApplications]);

    // Bulk action triggers
    const triggerBulkVerify = async () => {
        if (selectedAppIds.length === 0) return toast.warning('Select applications first');
        try {
            await Promise.all(selectedAppIds.map(id => admissionApi.verifyDocs(id, 'Bulk Verified by Officer')));
            toast.success(`Successfully verified documents for ${selectedAppIds.length} applications`);
            setSelectedAppIds([]);
            AdmissionEngine.dispatch(queryClient, ADMISSION_EVENTS.QUEUE_REFRESH);
            refetch();
        } catch {
            toast.error('Failed to run bulk verify');
        }
    };

    const triggerBulkApprove = async () => {
        if (selectedAppIds.length === 0) return toast.warning('Select applications first');
        try {
            await Promise.all(selectedAppIds.map(id => admissionApi.approve(id, 'Bulk Approved by Principal Handoff')));
            toast.success(`Successfully approved ${selectedAppIds.length} applications`);
            setSelectedAppIds([]);
            AdmissionEngine.dispatch(queryClient, ADMISSION_EVENTS.QUEUE_REFRESH);
            refetch();
        } catch {
            toast.error('Failed to run bulk approval');
        }
    };

    const triggerBulkReject = async () => {
        if (selectedAppIds.length === 0) return toast.warning('Select applications first');
        try {
            await Promise.all(selectedAppIds.map(id => admissionApi.reject(id, 'Bulk Rejected by Officer')));
            toast.success(`Successfully rejected ${selectedAppIds.length} applications`);
            setSelectedAppIds([]);
            AdmissionEngine.dispatch(queryClient, ADMISSION_EVENTS.QUEUE_REFRESH);
            refetch();
        } catch {
            toast.error('Failed to run bulk reject');
        }
    };

    const triggerExportCSV = () => {
        if (filteredApplications.length === 0) return toast.warning('No data to export');
        const headers = 'Application ID,Student Name,Grade,Status,Counselor,Created At,SLA Status\n';
        const rows = filteredApplications.map(a => 
            `"${a.id}","${a.student_name}","${a.grade_applied_for}","${a.status}","${a.parent_name || 'Unassigned'}","${a.created_at}","${a.slaInfo.status}"`
        ).join('\n');
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `applications_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        toast.success('CSV Export Completed');
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" /> Enterprise Admission Desk Console
                    </h2>
                    <p className="text-xs text-gray-400 font-bold uppercase">
                        Dynamic CRM Pipeline, Work Queues, Live SLA Monitoring, & SIS Handoff
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'kanban' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('kanban')}
                        className="text-xs"
                    >
                        Kanban Board
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="text-xs"
                    >
                        Detailed List
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { refetch(); toast.success('Queue refreshed'); }}
                        className="text-xs gap-1.5"
                    >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Dynamic 14 KPIs Dashboard */}
            <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 min-w-[1200px]">
                    {kpis.map((kpi, i) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={i} className={`p-4 rounded-2xl border flex-1 min-w-[180px] shadow-sm flex items-start gap-3 bg-white dark:bg-card ${kpi.color}`}>
                                <div className="p-2 rounded-xl bg-white/70 shadow-sm shrink-0">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase text-gray-500 truncate">{kpi.label}</p>
                                    <p className="text-xl font-black text-gray-900 mt-0.5">{kpi.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Search and Filters panel */}
            <div className="p-5 bg-white border border-gray-150 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <Filter className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-black uppercase text-gray-800 tracking-wider">Advanced filters</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search name, code..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8 text-xs border rounded-lg w-full p-2"
                        />
                    </div>
                    <select value={selectedGrade} onChange={e => setSelectedGrade(e.target.value)} className="text-xs border rounded-lg p-2 bg-white">
                        <option value="All">Grade: All</option>
                        {gradesList.filter(g => g !== 'All').map(g => (
                            <option key={g} value={g}>{g}</option>
                        ))}
                    </select>
                    <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="text-xs border rounded-lg p-2 bg-white">
                        <option value="All">Status: All</option>
                        {statusList.filter(s => s !== 'All').map(s => (
                            <option key={s} value={s}>{mapStatusToEnterpriseLabel(s)}</option>
                        ))}
                    </select>
                    <select value={selectedCounselor} onChange={e => setSelectedCounselor(e.target.value)} className="text-xs border rounded-lg p-2 bg-white">
                        <option value="All">Counselor: All</option>
                        {counselorsList.filter(c => c !== 'All').map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select value={selectedSla} onChange={e => setSelectedSla(e.target.value)} className="text-xs border rounded-lg p-2 bg-white">
                        <option value="All">SLA: All</option>
                        <option value="Within SLA">Within SLA</option>
                        <option value="Warning">Warning</option>
                        <option value="Critical">Critical</option>
                        <option value="Breached">Breached</option>
                    </select>
                    <select value={selectedRisk} onChange={e => setSelectedRisk(e.target.value)} className="text-xs border rounded-lg p-2 bg-white">
                        <option value="All">Risk: All</option>
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                    </select>
                </div>
            </div>

            {/* Main Interactive queues and pipeline area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* 10 Work Queues Sidebar */}
                <div className="space-y-3 bg-white p-4 border border-gray-150 rounded-2xl shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 px-2 pb-2 border-b flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-500" /> Operational queues
                    </h3>
                    <div className="flex flex-col gap-1">
                        {[
                            'My Queue',
                            'Pending Reviews',
                            'Document Queue',
                            'Fee Queue',
                            'Enrollment Queue',
                            'Escalated Applications',
                            'Overdue Applications',
                            'Upcoming Interviews',
                            'Upcoming Exams'
                        ].map(q => {
                            const isActive = activeQueue === q;
                            return (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setActiveQueue(q)}
                                    className={`w-full text-left text-xs px-3 py-2 rounded-xl font-bold transition-all flex items-center justify-between ${
                                        isActive
                                            ? 'bg-indigo-600 text-white shadow-sm'
                                            : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <span>{q}</span>
                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Dashboard layout pipeline / list */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Bulk operations row */}
                    {selectedAppIds.length > 0 && (
                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs flex-wrap gap-2 animate-fade-in">
                            <span className="font-bold text-indigo-900">
                                {selectedAppIds.length} application(s) selected
                            </span>
                            <div className="flex items-center gap-2">
                                <Button size="sm" onClick={triggerBulkVerify} className="text-xs bg-indigo-600 hover:bg-indigo-700">
                                    Bulk Verify Docs
                                </Button>
                                <Button size="sm" onClick={triggerBulkApprove} className="text-xs bg-emerald-600 hover:bg-emerald-700">
                                    Bulk Approve
                                </Button>
                                <Button size="sm" variant="destructive" onClick={triggerBulkReject} className="text-xs">
                                    Bulk Reject
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setSelectedAppIds([])} className="text-xs bg-white text-gray-600">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                            Showing {filteredApplications.length} Application(s)
                        </span>
                        <Button variant="outline" size="sm" onClick={triggerExportCSV} className="text-[10px] uppercase font-bold tracking-wider gap-1">
                            <Download className="w-3.5 h-3.5" /> Bulk Export
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="py-16 text-center text-sm text-gray-400 animate-pulse">Loading admissions data pipeline…</div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="py-16 text-center border-2 border-dashed rounded-2xl bg-gray-50/50">
                            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs text-gray-400 font-bold">No applications matching current filters.</p>
                        </div>
                    ) : viewMode === 'kanban' ? (
                        /* Kanban board representation */
                        <div className="overflow-x-auto pb-4">
                            <div className="flex gap-4 min-w-[2200px] h-[550px] items-start">
                                {PIPELINE_COLUMNS.map(col => {
                                    const colApps = kanbanGroups[col] || [];
                                    return (
                                        <div key={col} className="w-[220px] shrink-0 bg-gray-50/70 border border-gray-150 rounded-2xl p-3 h-full overflow-y-auto space-y-3">
                                            <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 py-1 z-10 border-b">
                                                <span className="text-[10px] font-black text-gray-800 uppercase truncate">{col}</span>
                                                <span className="px-1.5 py-0.5 rounded bg-gray-200 text-[9px] font-black text-gray-700">
                                                    {colApps.length}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {colApps.map(app => {
                                                    const sla = calculateSLA(app.created_at, app.status);
                                                    const nextAct = calculateNextAction(app.status);
                                                    const progressPercent = calculateProgressPercent(app.status);
                                                    const isSelected = selectedAppIds.includes(app.id);

                                                    let slaColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
                                                    if (sla.status === 'Breached') slaColor = 'bg-rose-100 text-rose-700 border-rose-200 animate-pulse';
                                                    else if (sla.status === 'Critical') slaColor = 'bg-orange-50 text-orange-600 border-orange-100';
                                                    else if (sla.status === 'Warning') slaColor = 'bg-amber-50 text-amber-600 border-amber-100';

                                                    return (
                                                        <div
                                                            key={app.id}
                                                            className="p-3 bg-white rounded-xl border border-gray-150 hover:shadow-md transition-all space-y-2.5 cursor-pointer relative"
                                                        >
                                                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={(e) => {
                                                                        e.stopPropagation();
                                                                        if (isSelected) {
                                                                            setSelectedAppIds(prev => prev.filter(id => id !== app.id));
                                                                        } else {
                                                                            setSelectedAppIds(prev => [...prev, app.id]);
                                                                        }
                                                                    }}
                                                                    className="w-3.5 h-3.5 rounded border-gray-300"
                                                                />
                                                            </div>
                                                            <div onClick={() => setSelectedAppId(app.id)} className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shrink-0 uppercase">
                                                                        {app.student_name.slice(0, 2)}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-bold text-gray-900 truncate text-[11px] hover:text-indigo-600">{app.student_name}</p>
                                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">{app.id.slice(0, 8).toUpperCase()} • {app.grade_applied_for}</p>
                                                                    </div>
                                                                </div>

                                                                {/* Progress Bar */}
                                                                <div className="space-y-0.5">
                                                                    <div className="flex justify-between text-[9px] text-gray-400 font-bold">
                                                                        <span>Progress</span>
                                                                        <span>{progressPercent}%</span>
                                                                    </div>
                                                                    <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                                                                        <div className="bg-indigo-600 h-full transition-all" style={{ width: `${progressPercent}%` }} />
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-wrap items-center gap-1">
                                                                    <span className="text-[8px] font-black uppercase px-1 rounded bg-indigo-50 text-indigo-600">
                                                                        {mapStatusToEnterpriseLabel(app.status)}
                                                                    </span>
                                                                    <span className={`text-[8px] font-black uppercase px-1 rounded border ${slaColor}`}>
                                                                        {sla.status}
                                                                    </span>
                                                                </div>

                                                                <div className="text-[9px] border-t pt-1.5 flex items-center justify-between text-gray-400 font-bold uppercase">
                                                                    <span>Next Action:</span>
                                                                    <span className="text-indigo-600 font-black">{nextAct}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Detailed List view representation */
                        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b text-[10px] font-black uppercase text-gray-500">
                                        <th className="p-3 w-8">
                                            <input
                                                type="checkbox"
                                                checked={selectedAppIds.length === filteredApplications.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAppIds(filteredApplications.map(a => a.id));
                                                    } else {
                                                        setSelectedAppIds([]);
                                                    }
                                                }}
                                                className="w-3.5 h-3.5 rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="p-3">Application</th>
                                        <th className="p-3">Student Name</th>
                                        <th className="p-3">Grade</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">SLA Status</th>
                                        <th className="p-3">Risk Tier</th>
                                        <th className="p-3">Next Action</th>
                                        <th className="p-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {filteredApplications.map(app => {
                                        const sla = calculateSLA(app.created_at, app.status);
                                        const nextAct = calculateNextAction(app.status);
                                        const isSelected = selectedAppIds.includes(app.id);

                                        let slaBadge = 'bg-emerald-50 text-emerald-600';
                                        if (sla.status === 'Breached') slaBadge = 'bg-rose-100 text-rose-700 animate-pulse font-bold';
                                        else if (sla.status === 'Critical') slaBadge = 'bg-orange-50 text-orange-600';
                                        else if (sla.status === 'Warning') slaBadge = 'bg-amber-50 text-amber-600';

                                        let riskBadge = 'bg-emerald-50 text-emerald-600';
                                        if (app.riskTier === 'High') riskBadge = 'bg-rose-100 text-rose-700 font-bold';
                                        else if (app.riskTier === 'Medium') riskBadge = 'bg-orange-50 text-orange-600';

                                        return (
                                            <tr key={app.id} className="hover:bg-gray-50/50">
                                                <td className="p-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (isSelected) {
                                                                setSelectedAppIds(prev => prev.filter(id => id !== app.id));
                                                            } else {
                                                                setSelectedAppIds(prev => [...prev, app.id]);
                                                            }
                                                        }}
                                                        className="w-3.5 h-3.5 rounded border-gray-300"
                                                    />
                                                </td>
                                                <td className="p-3 font-bold text-gray-900 uppercase">
                                                    {app.id.slice(0, 8)}
                                                </td>
                                                <td className="p-3 font-medium text-gray-900">{app.student_name}</td>
                                                <td className="p-3 text-gray-500 font-bold">{app.grade_applied_for}</td>
                                                <td className="p-3">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-50 text-indigo-600">
                                                        {mapStatusToEnterpriseLabel(app.status)}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${slaBadge}`}>
                                                        {sla.status}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${riskBadge}`}>
                                                        {app.riskTier} RISK
                                                    </span>
                                                </td>
                                                <td className="p-3 font-black text-indigo-600">{nextAct}</td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAppId(app.id)}
                                                        className="p-1.5 text-gray-400 hover:text-indigo-600"
                                                        title="View Profile"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Applicant360 Operational Workspace Overlay Details Modal */}
            {selectedAppId && applicant360View && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50 animate-fade-in">
                    <div className="w-full max-w-6xl h-full bg-gray-50 p-6 shadow-2xl flex flex-col space-y-4 overflow-y-auto animate-slide-in">
                        <div className="flex items-center justify-between border-b pb-3">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-indigo-500" /> Applicant 360° Operational Panel
                                </h2>
                                <p className="text-xs text-gray-400 font-bold uppercase">
                                    Modify documents, schedule interviews, view billing, and trigger SIS handoffs
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedAppId(null); refetch(); }}
                                className="text-xs font-bold border-gray-300"
                            >
                                Close Panel
                            </Button>
                        </div>

                        <Applicant360Profile
                            applicant={applicant360View}
                            applicationId={selectedAppId}
                            progress={selectedProgress}
                            progressLoading={selectedProgressLoading}
                            readOnlyMode={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdmissionOfficerDashboard;
