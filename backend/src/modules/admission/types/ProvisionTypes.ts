export interface ProvisionStepReport {
    stepName: string;
    status: 'COMPLETED' | 'FAILED' | 'SKIPPED';
    message?: string;
}

export interface StudentProvisionReport {
    applicationId: string;
    admissionNumber: string;
    studentId: string | null;
    success: boolean;
    steps: ProvisionStepReport[];
    error?: string;
}
