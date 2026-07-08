import { apiClient } from '../../../../lib/api-client';

export interface AssessmentConfig {
    id: string;
    school_id: string;
    max_upload_size_mb: number;
    autosave_interval_secs: number;
    default_heartbeat_secs: number;
    timezone: string;
    grading_scale: any[];
    retention_telemetry_days: number;
    retention_attempts_years: number;
    created_at: string;
    updated_at: string;
}

export interface WorkflowStep {
    id?: string;
    step_name: string;
    role_required: string;
    sort_order: number;
}

export interface WorkflowTransition {
    id?: string;
    from_status: string;
    to_status: string;
    rule_condition?: string | null;
}

export interface WorkflowDefinition {
    id: string;
    school_id: string;
    name: string;
    description?: string | null;
    is_active: boolean;
    version: number;
    steps: WorkflowStep[];
    transitions: WorkflowTransition[];
    created_at: string;
    updated_at: string;
}

export const assessmentApi = {
    getConfig: async () => {
        const { data } = await apiClient.get<AssessmentConfig>('/v1/assessment/config');
        return data;
    },

    updateConfig: async (payload: Partial<AssessmentConfig>) => {
        const { data } = await apiClient.put<AssessmentConfig>('/v1/assessment/config', payload);
        return data;
    },

    listWorkflows: async () => {
        const { data } = await apiClient.get<WorkflowDefinition[]>('/v1/assessment/workflows');
        return data;
    },

    getWorkflowById: async (id: string) => {
        const { data } = await apiClient.get<WorkflowDefinition>(`/v1/assessment/workflows/${id}`);
        return data;
    },

    createWorkflow: async (payload: Omit<Partial<WorkflowDefinition>, 'id' | 'version' | 'created_at' | 'updated_at'>) => {
        const { data } = await apiClient.post<WorkflowDefinition>('/v1/assessment/workflows', payload);
        return data;
    },

    updateWorkflow: async (id: string, payload: Partial<WorkflowDefinition>) => {
        const { data } = await apiClient.put<WorkflowDefinition>(`/v1/assessment/workflows/${id}`, payload);
        return data;
    },

    deleteWorkflow: async (id: string) => {
        const { data } = await apiClient.delete<{ message: string }>(`/v1/assessment/workflows/${id}`);
        return data;
    }
};
