import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templateApi, TemplateSection } from '../services/template.api';

const TEMPLATE_LIST_KEY = ['assessment', 'templates', 'list'];
const TEMPLATE_DETAIL_KEY = ['assessment', 'templates', 'detail'];

export function useTemplatesList(filters: { subjectId?: string; page: number; limit: number }) {
    return useQuery({
        queryKey: [...TEMPLATE_LIST_KEY, filters],
        queryFn: () => templateApi.listTemplates(filters),
        placeholderData: (prev) => prev
    });
}

export function useTemplateDetail(id: string | undefined) {
    return useQuery({
        queryKey: [...TEMPLATE_DETAIL_KEY, id],
        queryFn: () => templateApi.getTemplateById(id!),
        enabled: !!id
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: templateApi.createTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATE_LIST_KEY });
        }
    });
}

export function useUpdateTemplate(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => templateApi.updateTemplate(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATE_LIST_KEY });
            queryClient.invalidateQueries({ queryKey: [...TEMPLATE_DETAIL_KEY, id] });
        }
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: templateApi.deleteTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATE_LIST_KEY });
        }
    });
}

export function useUpdateTemplateSections(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sections: Omit<TemplateSection, 'id' | 'template_id'>[]) =>
            templateApi.updateTemplateSections(id, sections),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATE_LIST_KEY });
            queryClient.invalidateQueries({ queryKey: [...TEMPLATE_DETAIL_KEY, id] });
        }
    });
}

export function usePublishTemplate(id: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => templateApi.publishTemplate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATE_LIST_KEY });
            queryClient.invalidateQueries({ queryKey: [...TEMPLATE_DETAIL_KEY, id] });
        }
    });
}

export function useCloneTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: templateApi.cloneTemplate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEMPLATE_LIST_KEY });
        }
    });
}
