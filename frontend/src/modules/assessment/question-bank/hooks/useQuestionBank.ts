import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionApi, QuestionItem } from '../services/question.api';
import { supabase } from '../../../../lib/supabase';

export function useSubjectsList() {
    return useQuery({
        queryKey: ['assessment', 'subjects', 'list'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('subjects')
                .select('id, name, code')
                .order('name');
            if (error) throw error;
            return data || [];
        },
        staleTime: 10 * 60 * 1000
    });
}

export function useActiveAcademicYear() {
    return useQuery({
        queryKey: ['assessment', 'academic-years', 'active'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('academic_years')
                .select('id, year_label')
                .eq('is_active', true)
                .limit(1)
                .maybeSingle();
            if (error) throw error;
            return data;
        },
        staleTime: 10 * 60 * 1000
    });
}

const FOLDER_QUERY_KEY = ['assessment', 'questions', 'folders'];
const QUESTION_QUERY_KEY = ['assessment', 'questions', 'list'];

export function useFoldersList() {
    return useQuery({
        queryKey: FOLDER_QUERY_KEY,
        queryFn: questionApi.listFolders,
        staleTime: 5 * 60 * 1000
    });
}

export function useCreateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: questionApi.createFolder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
        }
    });
}

export function useUpdateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) => questionApi.updateFolder(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
        }
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: questionApi.deleteFolder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
        }
    });
}

export function useQuestionsList(filters: {
    folderId?: string | null;
    subjectId?: string;
    difficulty?: string;
    bloomLevel?: string;
    status?: string;
    search?: string;
    page: number;
    limit: number;
}) {
    return useQuery({
        queryKey: [QUESTION_QUERY_KEY, filters],
        queryFn: () => questionApi.listQuestions(filters),
        staleTime: 1 * 60 * 1000
    });
}

export function useQuestionDetail(id: string) {
    return useQuery({
        queryKey: ['assessment', 'questions', 'detail', id],
        queryFn: () => questionApi.getQuestionById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: questionApi.createQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEY });
        }
    });
}

export function useUpdateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<QuestionItem> }) =>
            questionApi.updateQuestion(id, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEY });
            queryClient.setQueryData(['assessment', 'questions', 'detail', variables.id], data);
        }
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: questionApi.deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEY });
        }
    });
}

export function useImportQuestions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: questionApi.importQuestions,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUESTION_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: FOLDER_QUERY_KEY });
        }
    });
}
