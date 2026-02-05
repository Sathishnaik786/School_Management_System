export type AdmissionStatus = 'draft' | 'submitted' | 'under_review' | 'docs_verified' | 'payment_pending' | 'payment_submitted' | 'payment_verified' | 'payment_correction' | 'recommended' | 'approved' | 'rejected' | 'enrolled';

export interface AdmissionDocument {
    id: string;
    admission_id: string;
    document_type: string;
    file_url: string;
    uploaded_at: string;
}

export interface AdmissionAuditLog {
    id: string;
    admission_id: string;
    action: string;
    performed_by: string;
    remarks: string;
    created_at: string;
    users?: {
        full_name: string;
    };
}

export interface AdmissionFeeSnapshot {
    id: string;
    admission_id: string;
    fee_structure_id: string;
    snapshot_name: string;
    snapshot_amount: number;
    snapshot_category: string;
    is_mandatory: boolean;
    payment_status: 'ENABLED' | 'PAID' | 'VOIDED';
    enabled_at: string;
    created_at: string;
}

export interface Admission {
    id: string;
    school_id: string;
    academic_year_id: string;
    applicant_user_id: string;

    student_name: string;
    date_of_birth: string;
    gender: 'Male' | 'Female' | 'Other';
    grade_applied_for: string;

    parent_name?: string;
    parent_email?: string;
    parent_phone?: string;
    address?: string;
    previous_school?: string;
    last_grade_completed?: string;

    status: AdmissionStatus;

    remark_by_officer?: string;
    remark_by_hoi?: string;

    submitted_at?: string;
    recommended_at?: string;
    approved_at?: string;
    rejected_at?: string;
    rejection_reason?: string;

    payment_enabled?: boolean;
    payment_amount?: number;
    payment_mode?: string;
    payment_reference?: string;
    payment_proof?: string;
    payment_date?: string;
    payment_verified?: boolean;
    remark_by_finance?: string;

    created_at: string;
    updated_at: string;

    academic_years?: {
        year_label: string;
    };
    admission_documents?: AdmissionDocument[];
    admission_audit_logs?: AdmissionAuditLog[];
    admission_fees?: AdmissionFeeSnapshot[];
    applicant?: {
        id: string;
        full_name: string;
        email: string;
        login_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
    };
}
