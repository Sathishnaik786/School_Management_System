import React, { useState, useMemo, useEffect } from 'react';
import { Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { ExportMenu } from '../../../common/reports/ExportMenu';
import { useLeadSearch } from '../../hooks/useLeadSearch';
import { useConvertEnquiry, useCreateEnquiry } from '../../hooks/useInquiry';
import { useLeadAssignment } from '../../hooks/useLeadAssignment';
import { useInquiryWorkspace } from '../../hooks/useInquiryWorkspace';
import { useAuth } from '../../../../context/AuthContext';
import { findDuplicates } from '../../utils/duplicate.detector';
import {
    filterBySection,
    leadToExportRow,
    type WorkspaceSection,
} from '../../utils/lead.mapper';
import type { Lead } from '../../types/admission.types';
import { LoadingSkeleton } from '../../../dashboard/components/feedback/LoadingSkeleton';
import { ErrorState } from '../../../dashboard/components/feedback/ErrorState';
import { EmptyState } from '../../../dashboard/components/feedback/EmptyState';
import { InquiryKPIs } from './InquiryKPIs';
import { LeadCard } from './LeadCard';
import { LeadDuplicateAlert } from './LeadDuplicateAlert';

const SECTIONS: { id: WorkspaceSection; label: string }[] = [
    { id: 'walkins', label: 'New Walk-ins' },
    { id: 'online', label: 'Online Inquiries' },
    { id: 'assigned', label: 'Assigned' },
    { id: 'unassigned', label: 'Unassigned' },
    { id: 'followups', label: "Today's Follow-ups" },
    { id: 'converted', label: 'Converted' },
    { id: 'archived', label: 'Archived' },
];

interface InquiryWorkspaceProps {
    mode?: 'workspace' | 'assignment';
    openCreateOnMount?: boolean;
    initialSection?: WorkspaceSection;
}

export function InquiryWorkspace({
    mode = 'workspace',
    openCreateOnMount = false,
    initialSection,
}: InquiryWorkspaceProps) {
    const { user } = useAuth();
    const counselorId = user?.id ?? '';
    const [activeSection, setActiveSection] = useState<WorkspaceSection>(
        initialSection ?? (mode === 'assignment' ? 'unassigned' : 'walkins'),
    );
    const [isCreateOpen, setIsCreateOpen] = useState(openCreateOnMount);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        student_name: '',
        parent_name: '',
        email: '',
        phone: '',
        grade_applied_for: 'Grade 1',
        source: 'Walk-in',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const { leads, inquiries, metrics, allRecords, isLoading, error, refetch, canManageLeads, buckets, todayLeadIds } =
        useInquiryWorkspace();
    const { query, setQuery, results: searchResults } = useLeadSearch(
        leads.length ? leads : inquiries,
    );
    const convertMutation = useConvertEnquiry();
    const createMutation = useCreateEnquiry();
    const { assign, isAssigning } = useLeadAssignment();

    const sectionLeads = useMemo(() => {
        const pool = searchResults.length || query ? searchResults : (leads.length ? leads : inquiries as Lead[]);
        return filterBySection(activeSection, inquiries, leads.length ? leads : inquiries as Lead[], todayLeadIds);
    }, [activeSection, inquiries, leads, todayLeadIds, searchResults, query]);

    const displayLeads = query ? sectionLeads.filter(l => searchResults.some(r => r.id === l.id)) : sectionLeads;

    const duplicates = useMemo(
        () =>
            isCreateOpen
                ? findDuplicates(
                      {
                          phone: formData.phone,
                          email: formData.email,
                          parent_name: formData.parent_name,
                          student_name: formData.student_name,
                      },
                      allRecords,
                  )
                : [],
        [isCreateOpen, formData, allRecords],
    );

    const exportData = useMemo(
        () => (leads.length ? leads : inquiries as Lead[]).map(leadToExportRow),
        [leads, inquiries],
    );

    useEffect(() => {
        if (openCreateOnMount) {
            setIsCreateOpen(true);
        }
    }, [openCreateOnMount]);

    useEffect(() => {
        if (initialSection) {
            setActiveSection(initialSection);
        }
    }, [initialSection]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};
        if (formData.student_name.trim().length < 2) newErrors.student_name = 'Required (min 2 chars)';
        if (formData.parent_name.trim().length < 2) newErrors.parent_name = 'Required (min 2 chars)';
        if (!/^\+?[0-9]{10,15}$/.test(formData.phone.trim())) newErrors.phone = 'Invalid phone';
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        try {
            await createMutation.mutateAsync({
                student_name: formData.student_name.trim(),
                parent_name: formData.parent_name.trim(),
                parent_email: formData.email.trim(),
                parent_phone: formData.phone.trim(),
                grade_applied_for: formData.grade_applied_for,
                source: formData.source,
            });
            setIsCreateOpen(false);
            setFormData({
                student_name: '',
                parent_name: '',
                email: '',
                phone: '',
                grade_applied_for: 'Grade 1',
                source: 'Walk-in',
            });
        } catch (err: unknown) {
            console.error(err);
        }
    };

    const handleAssign = async (leadId: string) => {
        if (!counselorId) return;
        await assign(leadId, counselorId);
    };

    if (isLoading) {
        return (
            <div className="space-y-6 pb-6">
                <LoadingSkeleton type="kpi" count={3} />
                <LoadingSkeleton type="list" count={4} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6 pb-6">
                <ErrorState
                    title="Unable to Load Inquiry Workspace"
                    message="We could not retrieve inquiry data. Check your connection and permissions, then try again."
                    onRetry={() => void refetch()}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        {mode === 'assignment' ? 'Counselor Assignment Desk' : 'Enterprise Inquiry Workspace'}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {mode === 'assignment'
                            ? 'Assign counselors, reassign, and manage lead queues.'
                            : 'Operational CRM console — walk-ins through conversion.'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                    </Button>
                    <ExportMenu
                        title="Inquiry Report"
                        data={exportData}
                        columns={Object.keys(exportData[0] ?? { Student: '' })}
                    />
                    {mode === 'workspace' && (
                        <Button onClick={() => setIsCreateOpen(true)} className="bg-primary text-white gap-1.5">
                            <Plus className="w-4 h-4" /> Add Inquiry
                        </Button>
                    )}
                </div>
            </div>

            {mode === 'workspace' && <InquiryKPIs metrics={metrics} />}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search student, parent, phone, email, inquiry #, program, counselor, status…"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
            </div>

            <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
                {SECTIONS.filter(s => mode !== 'assignment' || ['unassigned', 'assigned', 'followups'].includes(s.id)).map(
                    section => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id)}
                            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                                activeSection === section.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-400'
                            }`}
                        >
                            {section.label}
                            {section.id === 'followups' && buckets.today.length > 0 && (
                                <span className="ml-1 text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                    {buckets.today.length}
                                </span>
                            )}
                        </button>
                    ),
                )}
            </div>

            {displayLeads.length === 0 ? (
                <EmptyState
                    title="No Records in This Section"
                    message={
                        mode === 'workspace'
                            ? 'There are no inquiries matching this filter. Use Add Inquiry to register a new walk-in or online enquiry.'
                            : 'No leads are waiting for assignment in this section.'
                    }
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {displayLeads.map(lead => (
                        <LeadCard
                            key={lead.id}
                            lead={lead as Lead}
                            onConvert={id => convertMutation.mutate(id)}
                            onAssign={mode === 'assignment' ? handleAssign : id => handleAssign(id)}
                            showAssign={mode === 'assignment' || activeSection === 'unassigned'}
                            counselorId={counselorId}
                            isConverting={convertMutation.isPending}
                            isAssigning={isAssigning}
                            defaultExpanded={selectedLeadId === lead.id}
                        />
                    ))}
                </div>
            )}

            {isCreateOpen && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-card rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-sm font-black text-gray-900">New Inquiry</h2>
                        {duplicates.length > 0 && (
                            <LeadDuplicateAlert
                                matches={duplicates}
                                onOpenExisting={id => {
                                    setSelectedLeadId(id);
                                    setIsCreateOpen(false);
                                    setActiveSection('online');
                                }}
                            />
                        )}
                        <form onSubmit={handleCreate} className="space-y-3">
                            {(['student_name', 'parent_name'] as const).map(field => (
                                <div key={field}>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">
                                        {field === 'student_name' ? 'Student Name' : 'Parent Name'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData[field]}
                                        onChange={e => setFormData({ ...formData, [field]: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-xl text-xs ${errors[field] ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                    {errors[field] && <p className="text-[10px] text-red-500 mt-1">{errors[field]}</p>}
                                </div>
                            ))}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-3 py-2 border rounded-xl text-xs ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button type="button" variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending} className="bg-primary text-white">
                                    Create
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default InquiryWorkspace;
