import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { AdmissionEngine, ADMISSION_STALE_TIME } from '../core/AdmissionEngine';
import { buildInquiryTimeline } from '../utils/lead.mapper';
import { mapTimelineApiResponse } from '../utils/timeline.mapper';
import { mapFollowups } from '../utils/followup.mapper';
import { normalizeInquiry } from '../utils/lead.mapper';
import type { Lead, LeadTimelineEntry } from '../types/admission.types';

export function useLeadTimeline(lead?: Lead | null) {
    const applicationId = lead?.application_id;

    const timelineQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.timeline(applicationId ?? ''),
        queryFn: async () => {
            const { data } = await admissionApi.getTimeline(applicationId!);
            return mapTimelineApiResponse(data) as LeadTimelineEntry[];
        },
        enabled: !!applicationId,
        staleTime: ADMISSION_STALE_TIME,
    });

    const followupsQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.followups({ lead_id: lead?.id }),
        queryFn: () => admissionApi.getFollowups({ lead_id: lead?.id, enquiry_id: lead?.id }).then(res => res.data),
        enabled: !!lead?.id,
        staleTime: ADMISSION_STALE_TIME,
    });

    const enquiryQuery = useQuery({
        queryKey: AdmissionEngine.cacheKeys.inquiry.detail(lead?.id ?? ''),
        queryFn: () => admissionApi.getEnquiryById(lead!.id).then(res => res.data),
        enabled: !!lead?.id && !lead.application_id,
        staleTime: ADMISSION_STALE_TIME,
    });

    const timeline = useMemo(() => {
        if (!lead) return [];
        const inquiry = enquiryQuery.data
            ? normalizeInquiry(enquiryQuery.data as Record<string, unknown>)
            : lead;
        const followups = mapFollowups(followupsQuery.data) as unknown as Record<string, unknown>[];
        return buildInquiryTimeline(inquiry, followups, timelineQuery.data);
    }, [lead, enquiryQuery.data, followupsQuery.data, timelineQuery.data]);

    return {
        timeline,
        isLoading: timelineQuery.isLoading || followupsQuery.isLoading || enquiryQuery.isLoading,
        refetch: () => Promise.all([timelineQuery.refetch(), followupsQuery.refetch(), enquiryQuery.refetch()]),
    };
}
