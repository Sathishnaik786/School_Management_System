import type { Admission, AdmissionApplication } from '../types';
import { mapUIStatus, getProgressPercentage } from '../core/AdmissionStatusMapper';

export function mapApplication(raw: Admission): AdmissionApplication {
    return {
        ...raw,
        uiStatus: mapUIStatus(raw.status),
        progressPercent: getProgressPercentage(raw.status),
    };
}

export function mapApplicationList(raw: unknown): Admission[] {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as Admission[];
    const obj = raw as { data?: Admission[]; admissions?: Admission[] };
    return obj.data ?? obj.admissions ?? [];
}

export function mapApplicationDetail(raw: unknown): Admission | null {
    if (!raw) return null;
    return raw as Admission;
}
