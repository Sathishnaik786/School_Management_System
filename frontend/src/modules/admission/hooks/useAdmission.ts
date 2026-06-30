import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { admissionApi } from '../admission.api';
import { QUERY_KEYS } from '../../../lib/queryKeys';

export function useInquiries(params?: any, options?: any) {
    return useQuery({
        queryKey: ['admissions', 'inquiries', params],
        queryFn: () => admissionApi.getEnquiries(params).then(res => res.data),
        ...options
    });
}

export function useEnquiryDetails(id: string) {
    return useQuery({
        queryKey: ['admissions', 'inquiry', id],
        queryFn: () => admissionApi.getEnquiryById(id).then(res => res.data),
        enabled: !!id,
    });
}

export function useCreateEnquiry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.createEnquiry,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'inquiries'] });
        },
    });
}

export function useUpdateEnquiry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => admissionApi.updateEnquiry(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'inquiries'] });
            queryClient.invalidateQueries({ queryKey: ['admissions', 'inquiry', variables.id] });
        },
    });
}

export function useConvertEnquiry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => admissionApi.convertEnquiry(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'inquiries'] });
            queryClient.invalidateQueries({ queryKey: ['admissions', 'leads'] });
        },
    });
}

export function useLeads(params?: any, options?: any) {
    return useQuery({
        queryKey: ['admissions', 'leads', params],
        queryFn: () => admissionApi.getLeads(params).then(res => res.data),
        ...options
    });
}

export function useLeadDetails(id: string) {
    return useQuery({
        queryKey: ['admissions', 'lead', id],
        queryFn: () => admissionApi.getLeadById(id).then(res => res.data),
        enabled: !!id,
    });
}

export function useAssignLead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, counselorId }: { id: string; counselorId: string }) =>
            admissionApi.assignLead(id, counselorId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'leads'] });
            queryClient.invalidateQueries({ queryKey: ['admissions', 'lead', variables.id] });
        },
    });
}

export function useFollowups(params?: any) {
    return useQuery({
        queryKey: ['admissions', 'followups', params],
        queryFn: () => admissionApi.getFollowups(params).then(res => res.data),
    });
}

export function useCreateFollowup() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.createFollowup,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'followups'] });
        },
    });
}

export function useVisitors(params?: any) {
    return useQuery({
        queryKey: ['admissions', 'visitors', params],
        queryFn: () => admissionApi.getVisitors(params).then(res => res.data),
    });
}

export function useCreateVisitor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.createVisitor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'visitors'] });
        },
    });
}

export function useExamResults(applicationId: string) {
    return useQuery({
        queryKey: ['admissions', 'exam-results', applicationId],
        queryFn: () => admissionApi.getExamResults(applicationId).then(res => res.data),
        enabled: !!applicationId,
    });
}

export function useRecordExamMarks() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.recordExamMarks,
        onSuccess: (_, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'exam-results', variables.applicationId] });
        },
    });
}

export function useInterviewSchedule(data: any) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.scheduleInterview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
        },
    });
}

export function useMeritList(applicationId: string) {
    return useQuery({
        queryKey: ['admissions', 'merit-list', applicationId],
        queryFn: () => admissionApi.getMeritList(applicationId).then(res => res.data),
        enabled: !!applicationId,
    });
}

export function useGenerateMeritList() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.generateMeritList,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
        },
    });
}

export function useFeesSummary(applicationId: string) {
    return useQuery({
        queryKey: ['admissions', 'fees-summary', applicationId],
        queryFn: () => admissionApi.getFeesSummary(applicationId).then(res => res.data),
        enabled: !!applicationId,
    });
}

export function useCollectPayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.collectPayment,
        onSuccess: (_, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'fees-summary', variables.applicationId] });
        },
    });
}

export function useEnrollmentStatus(applicationId: string) {
    return useQuery({
        queryKey: ['admissions', 'enrollment-status', applicationId],
        queryFn: () => admissionApi.getEnrollmentStatus(applicationId).then(res => res.data),
        enabled: !!applicationId,
    });
}

export function useEnrollStudent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: admissionApi.enrollStudent,
        onSuccess: (_, variables: any) => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'enrollment-status', variables.applicationId] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STUDENT.ALL });
        },
    });
}
