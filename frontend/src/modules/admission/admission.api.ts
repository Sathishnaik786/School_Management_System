import { apiClient } from '../../lib/api-client';
import { supabase } from '../../lib/supabase';
import { Admission, AdmissionFeeSnapshot } from './admission.types';

export const admissionApi = {
    // ==========================================
    // BASIC ADMISSIONS (Parent & Staff)
    // ==========================================
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
        apiClient.get<any>('/admissions', { params }),

    getStats: (school_id?: string) =>
        apiClient.get<any>('/admissions/stats', { params: { school_id } }),

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

    // ==========================================
    // CRM / INQUIRY MANAGEMENT
    // ==========================================
    getEnquiries: (params?: any) =>
        apiClient.get('/v1/admission/crm/enquiries', { params }),

    getEnquiryById: (id: string) =>
        apiClient.get(`/v1/admission/crm/enquiries/${id}`),

    createEnquiry: (data: any) =>
        apiClient.post('/v1/admission/crm/enquiries', data),

    updateEnquiry: (id: string, data: any) =>
        apiClient.put(`/v1/admission/crm/enquiries/${id}`, data),

    deleteEnquiry: (id: string) =>
        apiClient.delete(`/v1/admission/crm/enquiries/${id}`),

    convertEnquiry: (id: string) =>
        apiClient.post(`/v1/admission/crm/enquiries/${id}/convert`),

    getLeads: (params?: any) =>
        apiClient.get('/v1/admission/crm/leads', { params }),

    getLeadById: (id: string) =>
        apiClient.get(`/v1/admission/crm/leads/${id}`),

    updateLead: (id: string, data: any) =>
        apiClient.put(`/v1/admission/crm/leads/${id}`, data),

    assignLead: (id: string, counselorId: string) =>
        apiClient.put(`/v1/admission/crm/leads/${id}/assign`, { counselorId }),

    getFollowups: (params?: any) =>
        apiClient.get('/v1/admission/crm/followups', { params }),

    createFollowup: (data: any) =>
        apiClient.post('/v1/admission/crm/followups', data),

    updateFollowup: (id: string, data: any) =>
        apiClient.put(`/v1/admission/crm/followups/${id}`, data),

    getVisitors: (params?: any) =>
        apiClient.get('/v1/admission/crm/visitors', { params }),

    createVisitor: (data: any) =>
        apiClient.post('/v1/admission/crm/visitors', data),

    updateVisitor: (id: string, data: any) =>
        apiClient.put(`/v1/admission/crm/visitors/${id}`, data),

    // ==========================================
    // EVALUATION / EXAMS / INTERVIEWS
    // ==========================================
    createExamTemplate: (data: any) =>
        apiClient.post('/v1/admission/evaluation/exam/template', data),

    scheduleExam: (data: any) =>
        apiClient.post('/v1/admission/evaluation/exam/schedule', data),

    allocateCandidate: (data: any) =>
        apiClient.post('/v1/admission/evaluation/exam/allocate', data),

    recordExamAttendance: (data: any) =>
        apiClient.post('/v1/admission/evaluation/exam/attendance', data),

    recordExamMarks: (data: any) =>
        apiClient.post('/v1/admission/evaluation/exam/result', data),

    getExamResults: (applicationId: string) =>
        apiClient.get(`/v1/admission/evaluation/exam/results/${applicationId}`),

    scheduleInterview: (data: any) =>
        apiClient.post('/v1/admission/evaluation/interview/schedule', data),

    recordInterviewScore: (data: any) =>
        apiClient.post('/v1/admission/evaluation/interview/result', data),

    generateMeritList: (data: any) =>
        apiClient.post('/v1/admission/evaluation/merit/generate', data),

    getMeritList: (applicationId: string) =>
        apiClient.get(`/v1/admission/evaluation/merit/${applicationId}`),

    generateOffer: (data: any) =>
        apiClient.post('/v1/admission/evaluation/offer/generate', data),

    sendOffer: (data: any) =>
        apiClient.post('/v1/admission/evaluation/offer/send', data),

    acceptOffer: (data: any) =>
        apiClient.post('/v1/admission/evaluation/offer/accept', data),

    rejectOffer: (data: any) =>
        apiClient.post('/v1/admission/evaluation/offer/reject', data),

    getTimeline: (applicationId: string) =>
        apiClient.get(`/v1/admission/evaluation/timeline/${applicationId}`),

    // ==========================================
    // BILLING & ENROLLMENT (Sprint 6)
    // ==========================================
    assignFeeStructure: (data: any) =>
        apiClient.post('/v1/admission/enrollment/fees/assign', data),

    getFeesSummary: (applicationId: string) =>
        apiClient.get(`/v1/admission/enrollment/fees/${applicationId}`),

    applyFeeWaiver: (data: any) =>
        apiClient.post('/v1/admission/enrollment/waivers', data),

    collectPayment: (data: any) =>
        apiClient.post('/v1/admission/enrollment/payments', data),

    verifyPayment: (data: any) =>
        apiClient.post('/v1/admission/enrollment/payments/verify', data),

    getReceipt: (paymentId: string) =>
        apiClient.get(`/v1/admission/enrollment/payments/${paymentId}/receipt`),

    confirmAdmission: (data: any) =>
        apiClient.post('/v1/admission/enrollment/confirm', data),

    enrollStudent: (data: any) =>
        apiClient.post('/v1/admission/enrollment/enroll', data),

    getEnrollmentStatus: (applicationId: string) =>
        apiClient.get(`/v1/admission/enrollment/status/${applicationId}`),
};
