import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assessmentApi, AssessmentConfig } from '../services/assessment.api';

const CONFIG_QUERY_KEY = ['assessment', 'config'];

export function useAssessmentConfig() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: CONFIG_QUERY_KEY,
        queryFn: assessmentApi.getConfig,
        staleTime: 5 * 60 * 1000 // Cache configurations for 5 minutes
    });

    const updateMutation = useMutation({
        mutationFn: (payload: Partial<AssessmentConfig>) => assessmentApi.updateConfig(payload),
        onSuccess: (updatedData) => {
            // Update query cache immediately
            queryClient.setQueryData(CONFIG_QUERY_KEY, updatedData);
        }
    });

    return {
        config: query.data ?? null,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
        updateConfig: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending
    };
}
