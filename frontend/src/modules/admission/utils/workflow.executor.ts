import { admissionApi } from '../admission.api';
import type { AdmissionWorkflowActionPayload } from '../types';
import type { WorkflowActionType } from '../hooks/useWorkflow';

/** Shared workflow execution — single source for useWorkflow and usePipeline */
export async function executeWorkflowAction(
    applicationId: string,
    action: WorkflowActionType,
    payload: AdmissionWorkflowActionPayload = {},
) {
    const remark = payload.remark ?? payload.reason ?? '';

    switch (action) {
        case 'review':
            return admissionApi.review(applicationId, remark);
        case 'verify':
            return admissionApi.verifyDocs(applicationId, remark);
        case 'billing':
            return admissionApi.billing(applicationId, payload.fee_ids ?? []);
        case 'initiate_payment':
            return admissionApi.initiatePayment(applicationId, payload.amount ?? 0);
        case 'verify_fee':
            return admissionApi.verifyFee(
                applicationId,
                payload.status === 'correction' ? 'correction' : 'verified',
                remark,
            );
        case 'recommend':
            return admissionApi.recommend(applicationId, remark);
        case 'approve':
            return admissionApi.approve(applicationId, remark);
        case 'enrol':
            return admissionApi.enrol(applicationId);
        case 'reject':
            return admissionApi.reject(applicationId, remark);
        case 'decide_login':
            return admissionApi.decideLogin(
                applicationId,
                payload.status as 'APPROVED' | 'REJECTED' | 'BLOCKED',
                remark,
            );
        case 'submit_payment':
            return admissionApi.submitPayment(applicationId, {
                mode: payload.mode ?? '',
                reference: payload.reference ?? '',
                proof_url: payload.proof_url,
            });
        default:
            throw new Error(`Unknown workflow action: ${action}`);
    }
}

export function workflowActionToEvent(action: WorkflowActionType) {
    if (action === 'verify') return 'DOCUMENT_VERIFIED' as const;
    if (action === 'verify_fee') return 'PAYMENT_VERIFIED' as const;
    if (action === 'enrol') return 'ENROLLMENT_COMPLETED' as const;
    return 'APPLICATION_UPDATED' as const;
}
