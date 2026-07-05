import type {
    AdmissionInquiry,
    Lead,
    LeadMetrics,
    LeadTimelineEntry,
} from '../types/admission.types';
import { calculateLeadScore } from './lead.score';

export function normalizeApiList<T>(data: unknown): T[] {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const obj = data as Record<string, unknown>;
    const candidates = ['data', 'items', 'enquiries', 'leads', 'followups', 'visitors', 'results'];
    for (const key of candidates) {
        const val = obj[key];
        if (Array.isArray(val)) return val as T[];
    }
    return [];
}

export function normalizeInquiry(raw: Record<string, unknown>): AdmissionInquiry {
    return {
        id: String(raw.id ?? ''),
        inquiry_number: (raw.inquiry_number ?? raw.enquiry_number ?? raw.code) as string | undefined,
        student_name: String(raw.student_name ?? raw.studentName ?? ''),
        parent_name: (raw.parent_name ?? raw.parentName) as string | undefined,
        parent_email: (raw.parent_email ?? raw.email ?? raw.parentEmail) as string | undefined,
        parent_phone: (raw.parent_phone ?? raw.phone ?? raw.parentPhone) as string | undefined,
        phone: (raw.phone ?? raw.parent_phone ?? raw.parentPhone) as string | undefined,
        email: (raw.email ?? raw.parent_email ?? raw.parentEmail) as string | undefined,
        grade_applied_for: (raw.grade_applied_for ?? raw.grade ?? raw.program) as string | undefined,
        source: (raw.source ?? raw.inquiry_source) as string | undefined,
        status: (raw.status ?? 'new') as string,
        created_at: (raw.created_at ?? raw.createdAt) as string | undefined,
        updated_at: (raw.updated_at ?? raw.updatedAt) as string | undefined,
        assigned_counselor: (raw.assigned_counselor ?? raw.counselor_name ?? raw.counselor) as string | undefined,
        assigned_counselor_id: (raw.assigned_counselor_id ?? raw.counselor_id ?? raw.counselorId) as string | undefined,
        application_id: (raw.application_id ?? raw.applicationId ?? raw.admission_id) as string | undefined,
    };
}

export function normalizeLead(raw: Record<string, unknown>): Lead {
    const inquiry = normalizeInquiry(raw);
    return {
        ...inquiry,
        next_followup_at: (raw.next_followup_at ?? raw.nextFollowupAt ?? raw.followup_date) as string | undefined,
        communication_count: Number(raw.communication_count ?? raw.communicationCount ?? 0),
        document_count: Number(raw.document_count ?? raw.documentCount ?? 0),
    };
}

export function mapInquiries(data: unknown): AdmissionInquiry[] {
    return normalizeApiList<Record<string, unknown>>(data).map(normalizeInquiry);
}

export function mapLeads(data: unknown, followups?: unknown): Lead[] {
    const followupList = normalizeApiList<Record<string, unknown>>(followups ?? []);
    return normalizeApiList<Record<string, unknown>>(data).map(raw => {
        const lead = normalizeLead(raw);
        const score = calculateLeadScore(lead, followupList);
        return { ...lead, score: score.score, priority: score.tier };
    });
}

const WALKIN_SOURCES = ['walk-in', 'walkin', 'walk in', 'visitor', 'reception'];
const ONLINE_SOURCES = ['online', 'web', 'website', 'form', 'portal'];

export function isWalkInSource(source?: string): boolean {
    if (!source) return false;
    const s = source.toLowerCase();
    return WALKIN_SOURCES.some(v => s.includes(v));
}

export function isOnlineSource(source?: string): boolean {
    if (!source) return false;
    const s = source.toLowerCase();
    return ONLINE_SOURCES.some(v => s.includes(v)) || s.includes('online');
}

export function isConverted(status?: string): boolean {
    const s = (status ?? '').toLowerCase();
    return s.includes('convert') || s === 'application_created' || s === 'enrolled';
}

export function isArchived(status?: string): boolean {
    const s = (status ?? '').toLowerCase();
    return s.includes('archiv') || s.includes('cancel') || s === 'closed' || s === 'lost';
}

export function isAssigned(lead: Lead | AdmissionInquiry): boolean {
    const counselor = lead.assigned_counselor ?? lead.assigned_counselor_id;
    return !!counselor && counselor !== 'Unassigned';
}

export function isToday(dateStr?: string): boolean {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.toDateString() === now.toDateString();
}

export function computeLeadMetrics(
    inquiries: AdmissionInquiry[],
    leads: Lead[],
    followups: Record<string, unknown>[],
    visitors: Record<string, unknown>[],
    stats?: Record<string, unknown> | null,
): LeadMetrics {
    const allInquiries = inquiries.length ? inquiries : leads;
    const walkInsToday = allInquiries.filter(i => isWalkInSource(i.source) && isToday(i.created_at)).length
        || visitors.filter(v => isToday(String(v.visit_date ?? v.created_at ?? ''))).length;
    const onlineToday = allInquiries.filter(i => isOnlineSource(i.source) && isToday(i.created_at)).length;
    const assigned = leads.filter(isAssigned).length;
    const unassigned = leads.filter(l => !isAssigned(l)).length;
    const converted = allInquiries.filter(i => isConverted(i.status)).length;
    const pending = allInquiries.filter(i => !isConverted(i.status) && !isArchived(i.status)).length;
    const total = allInquiries.length || 1;
    const conversionRate = Math.round((converted / total) * 100);
    const applicationsSubmitted = allInquiries.filter(i => i.application_id).length;

    const responseTimes: number[] = [];
    allInquiries.forEach(i => {
        if (i.created_at && i.updated_at && i.updated_at !== i.created_at) {
            const hrs = (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / 3600000;
            if (hrs >= 0) responseTimes.push(hrs);
        }
    });
    const avgResponseHours = responseTimes.length
        ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 10) / 10
        : 0;

    const followupHours: number[] = followups
        .filter(f => f.completed_at && f.created_at)
        .map(f => (new Date(String(f.completed_at)).getTime() - new Date(String(f.created_at)).getTime()) / 3600000)
        .filter(h => h >= 0);
    const avgFollowUpHours = followupHours.length
        ? Math.round((followupHours.reduce((a, b) => a + b, 0) / followupHours.length) * 10) / 10
        : 0;

    const todayFollowups = followups.filter(f => {
        const due = String(f.scheduled_at ?? f.due_date ?? f.due_at ?? '');
        return isToday(due) && String(f.status ?? '').toLowerCase() !== 'completed';
    }).length;

    const overdueFollowups = followups.filter(f => {
        const due = new Date(String(f.scheduled_at ?? f.due_date ?? f.due_at ?? ''));
        return due < new Date() && String(f.status ?? '').toLowerCase() !== 'completed';
    }).length;

    const todayVisitors = visitors.filter(v => isToday(String(v.visit_date ?? v.created_at ?? ''))).length;

    const statsObj = stats ?? {};
    return {
        walkInsToday: Number(statsObj.walk_ins_today ?? statsObj.walkInsToday ?? walkInsToday),
        onlineToday: Number(statsObj.online_today ?? statsObj.onlineToday ?? onlineToday),
        assigned: Number(statsObj.assigned ?? assigned),
        unassigned: Number(statsObj.unassigned ?? unassigned),
        pending: Number(statsObj.pending ?? pending),
        converted: Number(statsObj.converted ?? converted),
        conversionRate: Number(statsObj.conversion_rate ?? statsObj.conversionRate ?? conversionRate),
        avgFollowUpHours: Number(statsObj.avg_followup_hours ?? avgFollowUpHours),
        avgResponseHours: Number(statsObj.avg_response_hours ?? avgResponseHours),
        applicationsSubmitted: Number(statsObj.applications ?? statsObj.applicationsSubmitted ?? applicationsSubmitted),
        todayFollowups: Number(statsObj.today_followups ?? todayFollowups),
        overdueFollowups: Number(statsObj.overdue_followups ?? overdueFollowups),
        todayVisitors: Number(statsObj.today_visitors ?? todayVisitors),
    };
}

export function buildInquiryTimeline(
    inquiry: AdmissionInquiry | Lead,
    followups: Record<string, unknown>[],
    apiTimeline?: LeadTimelineEntry[],
): LeadTimelineEntry[] {
    const entries: LeadTimelineEntry[] = [];

    if (inquiry.created_at) {
        entries.push({
            id: `${inquiry.id}-created`,
            action: 'Created',
            timestamp: inquiry.created_at,
            remarks: inquiry.source ? `Source: ${inquiry.source}` : undefined,
        });
    }

    if (isAssigned(inquiry)) {
        entries.push({
            id: `${inquiry.id}-assigned`,
            action: 'Assigned',
            timestamp: inquiry.updated_at ?? inquiry.created_at ?? new Date().toISOString(),
            actor: inquiry.assigned_counselor,
        });
    }

    followups
        .filter(f => String(f.enquiry_id ?? f.lead_id) === inquiry.id)
        .forEach(f => {
            const action = String(f.status ?? '').toLowerCase() === 'completed' ? 'Called' : 'Reminder';
            entries.push({
                id: String(f.id),
                action,
                timestamp: String(f.scheduled_at ?? f.due_date ?? f.created_at ?? ''),
                actor: String(f.assigned_to ?? f.assigned_staff ?? ''),
                remarks: String(f.remarks ?? ''),
            });
        });

    if (isConverted(inquiry.status)) {
        entries.push({
            id: `${inquiry.id}-converted`,
            action: 'Converted',
            timestamp: inquiry.updated_at ?? inquiry.created_at ?? new Date().toISOString(),
        });
    }

    if (inquiry.application_id) {
        entries.push({
            id: `${inquiry.id}-application`,
            action: 'Application Submitted',
            timestamp: inquiry.updated_at ?? inquiry.created_at ?? new Date().toISOString(),
        });
    }

    if (isArchived(inquiry.status)) {
        entries.push({
            id: `${inquiry.id}-cancelled`,
            action: 'Cancelled',
            timestamp: inquiry.updated_at ?? inquiry.created_at ?? new Date().toISOString(),
        });
    }

    if (apiTimeline?.length) {
        entries.push(...apiTimeline);
    }

    return entries.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
}

export type WorkspaceSection =
    | 'walkins'
    | 'online'
    | 'assigned'
    | 'unassigned'
    | 'followups'
    | 'converted'
    | 'archived';

export function filterBySection(
    section: WorkspaceSection,
    inquiries: AdmissionInquiry[],
    leads: Lead[],
    todayFollowupLeadIds: Set<string>,
): Lead[] {
    const pool = leads.length ? leads : (inquiries as Lead[]);

    switch (section) {
        case 'walkins':
            return pool.filter(i => isWalkInSource(i.source) && !isConverted(i.status) && !isArchived(i.status));
        case 'online':
            return pool.filter(i => isOnlineSource(i.source) && !isConverted(i.status) && !isArchived(i.status));
        case 'assigned':
            return pool.filter(i => isAssigned(i) && !isConverted(i.status) && !isArchived(i.status));
        case 'unassigned':
            return pool.filter(i => !isAssigned(i) && !isConverted(i.status) && !isArchived(i.status));
        case 'followups':
            return pool.filter(i => todayFollowupLeadIds.has(i.id));
        case 'converted':
            return pool.filter(i => isConverted(i.status));
        case 'archived':
            return pool.filter(i => isArchived(i.status));
        default:
            return pool;
    }
}

export function leadToExportRow(lead: Lead): Record<string, string> {
    return {
        'Inquiry #': lead.inquiry_number ?? lead.id,
        Student: lead.student_name,
        Parent: lead.parent_name ?? '',
        Phone: lead.phone ?? lead.parent_phone ?? '',
        Email: lead.email ?? lead.parent_email ?? '',
        Program: lead.grade_applied_for ?? '',
        Source: lead.source ?? '',
        Status: lead.status ?? '',
        Counselor: lead.assigned_counselor ?? 'Unassigned',
        Priority: lead.priority ?? '',
        Created: lead.created_at ?? '',
    };
}
