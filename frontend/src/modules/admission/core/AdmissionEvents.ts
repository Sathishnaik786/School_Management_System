/**
 * Frontend event dispatcher for admission domain changes.
 * Triggers coordinated React Query invalidation — no websockets, no backend events.
 */

export type AdmissionEventType =
    | 'APPLICATION_UPDATED'
    | 'APPLICATION_LIST_CHANGED'
    | 'DOCUMENT_VERIFIED'
    | 'PAYMENT_VERIFIED'
    | 'OFFER_SENT'
    | 'ENROLLMENT_COMPLETED'
    | 'INQUIRY_CREATED'
    | 'INQUIRY_UPDATED'
    | 'INQUIRY_CONVERTED'
    | 'LEAD_ASSIGNED'
    | 'COUNSELOR_ASSIGNED'
    | 'FOLLOWUP_COMPLETED'
    | 'TIMELINE_REFRESH'
    | 'QUEUE_REFRESH'
    | 'DASHBOARD_REFRESH';

export interface AdmissionEventPayload {
    applicationId?: string;
    inquiryId?: string;
    leadId?: string;
    [key: string]: unknown;
}

type AdmissionEventListener = (payload?: AdmissionEventPayload) => void;

class AdmissionEventBus {
    private listeners = new Map<AdmissionEventType, Set<AdmissionEventListener>>();

    subscribe(type: AdmissionEventType, listener: AdmissionEventListener): () => void {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, new Set());
        }
        this.listeners.get(type)!.add(listener);
        return () => this.listeners.get(type)?.delete(listener);
    }

    dispatch(type: AdmissionEventType, payload?: AdmissionEventPayload): void {
        this.listeners.get(type)?.forEach(listener => listener(payload));
    }
}

export const admissionEventBus = new AdmissionEventBus();

export const ADMISSION_EVENTS = {
    APPLICATION_UPDATED: 'APPLICATION_UPDATED' as const,
    APPLICATION_LIST_CHANGED: 'APPLICATION_LIST_CHANGED' as const,
    DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED' as const,
    PAYMENT_VERIFIED: 'PAYMENT_VERIFIED' as const,
    OFFER_SENT: 'OFFER_SENT' as const,
    ENROLLMENT_COMPLETED: 'ENROLLMENT_COMPLETED' as const,
    INQUIRY_CREATED: 'INQUIRY_CREATED' as const,
    INQUIRY_UPDATED: 'INQUIRY_UPDATED' as const,
    INQUIRY_CONVERTED: 'INQUIRY_CONVERTED' as const,
    LEAD_ASSIGNED: 'LEAD_ASSIGNED' as const,
    COUNSELOR_ASSIGNED: 'COUNSELOR_ASSIGNED' as const,
    FOLLOWUP_COMPLETED: 'FOLLOWUP_COMPLETED' as const,
    TIMELINE_REFRESH: 'TIMELINE_REFRESH' as const,
    QUEUE_REFRESH: 'QUEUE_REFRESH' as const,
    DASHBOARD_REFRESH: 'DASHBOARD_REFRESH' as const,
};
