import { apiClient } from '../../lib/api-client';
import { supabase } from '../../lib/supabase';
import { Admission, AdmissionFeeSnapshot } from './admission.types';

export const admissionApi = {
    getAdmissionFees: async (admissionId: string) => {
        const { data, error } = await supabase
            .from('admission_fees')
            .select('*')
            .eq('admission_id', admissionId)
            .order('snapshot_category', { ascending: true });

        if (error) throw error;
        return data as AdmissionFeeSnapshot[];
    },
    create: (data: Partial<Admission>) =>
        apiClient.post<Admission>('/admissions', data),

    publicApply: (data: any) =>
        apiClient.post<any>('/admissions/public-apply', data),

    update: (id: string, data: Partial<Admission>) =>
        apiClient.put<Admission>(`/admissions/${id}`, data),

    submit: (id: string) =>
        apiClient.post(`/admissions/${id}/submit`),

    list: (params?: { status?: string, school_id?: string, page?: number, limit?: number, search?: string }) =>
        apiClient.get<any>('/admissions', { params }), // Returns PaginatedResult now

    getStats: (school_id?: string) =>
        apiClient.get<any[]>('/admissions/stats', { params: { school_id } }),

    getById: (id: string) =>
        apiClient.get<Admission>(`/admissions/${id}`),

    review: (id: string, remark: string) =>
        apiClient.post(`/admissions/${id}/review`, { remark }),

    verifyDocs: (id: string, remark: string) =>
        apiClient.post(`/admissions/${id}/verify-docs`, { remark }),

    initiatePayment: (id: string, amount: number) =>
        apiClient.post(`/admissions/${id}/initiate-payment`, { amount }),

    recommend: (id: string, remark: string) =>
        apiClient.post(`/admissions/${id}/recommend`, { remark }),

    approve: (id: string, remark: string) =>
        apiClient.post(`/admissions/${id}/approve`, { remark }),

    reject: (id: string, reason: string) =>
        apiClient.post(`/admissions/${id}/reject`, { reason }),

    enrol: (id: string) =>
        apiClient.post(`/admissions/${id}/enrol`),

    submitPayment: (id: string, data: { mode: string, reference: string, proof_url?: string }) =>
        apiClient.post(`/admissions/${id}/pay`, data),

    verifyFee: (id: string, status: 'verified' | 'correction', remarks: string) =>
        apiClient.post(`/admissions/${id}/verify-fee`, { status, remarks }),

    decideLogin: (id: string, status: 'APPROVED' | 'REJECTED' | 'BLOCKED', reason: string) =>
        apiClient.post(`/admissions/${id}/decide-login`, { status, reason }),

    uploadDoc: (id: string, type: string, url: string) =>
        apiClient.post(`/admissions/${id}/documents`, { type, url }),

    billing: (id: string, fee_structure_ids: string[]) =>
        apiClient.post(`/admissions/${id}/billing`, { fee_structure_ids }),

    getFeeStructures: () =>
        apiClient.get<any[]>('/fees/structures'),
};
