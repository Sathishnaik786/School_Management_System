import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { AdmissionEngine, ADMISSION_STALE_TIME } from '../core/AdmissionEngine';
import { admissionEventBus, ADMISSION_EVENTS } from '../core/AdmissionEvents';
import { mapLeads, mapInquiries, computeLeadMetrics, normalizeApiList } from '../utils/lead.mapper';
import { mapFollowups } from '../utils/followup.mapper';
import type { Lead, AdmissionInquiry, LeadMetrics } from '../types/admission.types';

export function useLeadsQuery(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: AdmissionEngine.cacheKeys.lead.lists(params),
        queryFn: () => admissionApi.getLeads(params).then(res => res.data),
        enabled: options?.enabled ?? true,
        staleTime: ADMISSION_STALE_TIME,
    });
}

export function useInquiriesQuery(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
    return useQuery({
        queryKey: AdmissionEngine.cacheKeys.inquiry.lists(params),
        queryFn: () => admissionApi.getEnquiries(params).then(res => res.data),
        enabled: options?.enabled ?? true,
        staleTime: ADMISSION_STALE_TIME,
    });
}

/** Normalized leads with scoring applied */
export function useLeads(params?: Record<string, unknown>, options?: { enabled?: boolean }) {
    const leadsQuery = useLeadsQuery(params, options);
    const followupsQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.followups(params),
        queryFn: () => admissionApi.getFollowups(params).then(res => res.data),
        enabled: options?.enabled ?? true,
        staleTime: ADMISSION_STALE_TIME,
    });

    const leads = useMemo(
        () => mapLeads(leadsQuery.data, followupsQuery.data),
        [leadsQuery.data, followupsQuery.data],
    );

    return {
        leads,
        raw: leadsQuery.data,
        isLoading: leadsQuery.isLoading || followupsQuery.isLoading,
        error: leadsQuery.error ?? followupsQuery.error,
        refetch: () => Promise.all([leadsQuery.refetch(), followupsQuery.refetch()]),
    };
}

/** Combined CRM data for workspace dashboards */
export function useLeadDashboard(params?: Record<string, unknown>) {
    const { leads, isLoading: leadsLoading, refetch: refetchLeads } = useLeads(params);
    const inquiriesQuery = useInquiriesQuery(params);
    const followupsQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.followups(params),
        queryFn: () => admissionApi.getFollowups(params).then(res => res.data),
        staleTime: ADMISSION_STALE_TIME,
    });
    const visitorsQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.visitors(params),
        queryFn: () => admissionApi.getVisitors(params).then(res => res.data),
        staleTime: ADMISSION_STALE_TIME,
    });
    const statsQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.stats(),
        queryFn: () => admissionApi.getStats().then(res => res.data).catch(() => null),
        staleTime: ADMISSION_STALE_TIME,
    });

    const inquiries = useMemo(() => mapInquiries(inquiriesQuery.data), [inquiriesQuery.data]);
    const followups = useMemo(() => mapFollowups(followupsQuery.data), [followupsQuery.data]);
    const visitors = useMemo(
        () => normalizeApiList<Record<string, unknown>>(visitorsQuery.data),
        [visitorsQuery.data],
    );

    const metrics: LeadMetrics = useMemo(
        () =>
            computeLeadMetrics(
                inquiries,
                leads,
                followups as unknown as Record<string, unknown>[],
                visitors,
                statsQuery.data as Record<string, unknown> | null,
            ),
        [inquiries, leads, followups, visitors, statsQuery.data],
    );

    const allRecords: AdmissionInquiry[] = useMemo(() => {
        const merged = new Map<string, AdmissionInquiry>();
        inquiries.forEach(i => merged.set(i.id, i));
        leads.forEach(l => merged.set(l.id, l));
        return Array.from(merged.values());
    }, [inquiries, leads]);

    useEffect(() => {
        const refresh = () => {
            void refetchLeads();
            void inquiriesQuery.refetch();
            void followupsQuery.refetch();
            void visitorsQuery.refetch();
            void statsQuery.refetch();
        };
        const unsubs = [
            ADMISSION_EVENTS.INQUIRY_CREATED,
            ADMISSION_EVENTS.INQUIRY_UPDATED,
            ADMISSION_EVENTS.INQUIRY_CONVERTED,
            ADMISSION_EVENTS.LEAD_ASSIGNED,
            ADMISSION_EVENTS.COUNSELOR_ASSIGNED,
            ADMISSION_EVENTS.FOLLOWUP_COMPLETED,
            ADMISSION_EVENTS.DASHBOARD_REFRESH,
            ADMISSION_EVENTS.QUEUE_REFRESH,
            ADMISSION_EVENTS.APPLICATION_LIST_CHANGED,
        ].map(event => admissionEventBus.subscribe(event, refresh));
        return () => unsubs.forEach(u => u());
    }, [
        refetchLeads,
        inquiriesQuery.refetch,
        followupsQuery.refetch,
        visitorsQuery.refetch,
        statsQuery.refetch,
    ]);

    return {
        leads,
        inquiries,
        followups,
        visitors: visitorsQuery.data,
        metrics,
        allRecords,
        isLoading:
            leadsLoading ||
            inquiriesQuery.isLoading ||
            followupsQuery.isLoading ||
            visitorsQuery.isLoading,
        refetch: () =>
            Promise.all([
                refetchLeads(),
                inquiriesQuery.refetch(),
                followupsQuery.refetch(),
                visitorsQuery.refetch(),
                statsQuery.refetch(),
            ]),
    };
}
