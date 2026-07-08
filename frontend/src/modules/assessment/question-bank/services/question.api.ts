import { apiClient } from '../../../../lib/api-client';

export interface FolderNode {
    id: string;
    school_id: string;
    parent_id: string | null;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface QuestionOption {
    id?: string;
    option_text: string;
    is_correct: boolean;
}

export interface QuestionItem {
    id: string;
    school_id: string;
    academic_year_id: string;
    folder_id: string | null;
    subject_id: string;
    question_text: string;
    question_type: 'MCQ' | 'TRUE_FALSE' | 'SUBJECTIVE' | 'MULTIPLE_SELECT' | 'FILL_BLANKS' | 'CODING' | 'SQL';
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    bloom_level: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
    points: number;
    negative_marks: number;
    explanation?: string | null;
    course_outcome_code?: string | null;
    program_outcome_code?: string | null;
    lesson_id?: string | null;
    taxonomy_tags: string[];
    version: number;
    status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'ARCHIVED';
    parent_id?: string | null;
    options: QuestionOption[];
    created_at: string;
    updated_at: string;
}

export interface ImportSummary {
    successCount: number;
    errors: { row: number; error: string }[];
}

export const questionApi = {
    // Folders
    listFolders: async () => {
        const { data } = await apiClient.get<FolderNode[]>('/v1/assessment/questions/folders');
        return data;
    },
    createFolder: async (payload: { name: string; parent_id?: string | null }) => {
        const { data } = await apiClient.post<FolderNode>('/v1/assessment/questions/folders', payload);
        return data;
    },
    updateFolder: async (id: string, payload: { name: string }) => {
        const { data } = await apiClient.put<FolderNode>(`/v1/assessment/questions/folders/${id}`, payload);
        return data;
    },
    deleteFolder: async (id: string) => {
        const { data } = await apiClient.delete<{ message: string }>(`/v1/assessment/questions/folders/${id}`);
        return data;
    },

    // Questions
    listQuestions: async (filters: {
        folderId?: string | null;
        subjectId?: string;
        difficulty?: string;
        bloomLevel?: string;
        status?: string;
        search?: string;
        page: number;
        limit: number;
    }) => {
        const { data } = await apiClient.get<{ data: QuestionItem[]; totalCount: number }>('/v1/assessment/questions', {
            params: filters
        });
        return data;
    },
    getQuestionById: async (id: string) => {
        const { data } = await apiClient.get<QuestionItem>(`/v1/assessment/questions/${id}`);
        return data;
    },
    createQuestion: async (payload: Partial<QuestionItem>) => {
        const { data } = await apiClient.post<QuestionItem>('/v1/assessment/questions', payload);
        return data;
    },
    updateQuestion: async (id: string, payload: Partial<QuestionItem>) => {
        const { data } = await apiClient.put<QuestionItem>(`/v1/assessment/questions/${id}`, payload);
        return data;
    },
    deleteQuestion: async (id: string) => {
        const { data } = await apiClient.delete<{ message: string }>(`/v1/assessment/questions/${id}`);
        return data;
    },

    // Import
    importQuestions: async (payload: FormData | { academicYearId: string; subjectId: string; folderId?: string | null; csv: string }) => {
        const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined;
        const { data } = await apiClient.post<ImportSummary>('/v1/assessment/questions/import', payload, { headers });
        return data;
    }
};
export default questionApi;
