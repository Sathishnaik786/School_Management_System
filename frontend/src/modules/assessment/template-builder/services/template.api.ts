import { apiClient } from '../../../../lib/api-client';

export interface TemplateRule {
    id?: string;
    section_id?: string;
    filter_field: 'difficulty' | 'bloom_level' | 'tags' | 'course_outcome' | 'program_outcome';
    filter_value: string;
    match_operator: 'eq' | 'in' | 'like';
}

export interface TemplateSection {
    id?: string;
    template_id?: string;
    section_name: string;
    description?: string | null;
    points_per_question: number;
    negative_marks: number;
    total_questions: number;
    sort_order: number;
    rules: TemplateRule[];
}

export interface TemplateItem {
    id: string;
    school_id: string;
    subject_id: string;
    name: string;
    description?: string | null;
    version: number;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
    sections?: TemplateSection[];
}

export const templateApi = {
    async listTemplates(params: { subjectId?: string; page: number; limit: number }): Promise<{ data: TemplateItem[]; totalCount: number }> {
        const { data } = await apiClient.get('/v1/assessment/templates', { params });
        return data;
    },

    async getTemplateById(id: string): Promise<TemplateItem> {
        const { data } = await apiClient.get(`/v1/assessment/templates/${id}`);
        return data;
    },

    async createTemplate(payload: { subject_id: string; name: string; description?: string | null }): Promise<TemplateItem> {
        const { data } = await apiClient.post('/v1/assessment/templates', payload);
        return data;
    },

    async updateTemplate(id: string, payload: Partial<{ name: string; description: string | null }>): Promise<TemplateItem> {
        const { data } = await apiClient.put(`/v1/assessment/templates/${id}`, payload);
        return data;
    },

    async deleteTemplate(id: string): Promise<void> {
        await apiClient.delete(`/v1/assessment/templates/${id}`);
    },

    async updateTemplateSections(id: string, sections: Omit<TemplateSection, 'id' | 'template_id'>[]): Promise<TemplateItem> {
        const { data } = await apiClient.post(`/v1/assessment/templates/${id}/sections`, { sections });
        return data;
    },

    async publishTemplate(id: string): Promise<TemplateItem & { warnings?: string[] }> {
        const { data } = await apiClient.post(`/v1/assessment/templates/${id}/publish`);
        return data;
    },

    async cloneTemplate(id: string): Promise<TemplateItem> {
        const { data } = await apiClient.post(`/v1/assessment/templates/${id}/clone`);
        return data;
    }
};

export default templateApi;
