import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class PaperStatisticsService extends BaseService {
    public async getMetrics(schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Resolving generation analytics for school: ${schoolId}`, correlationId);

        const { data, error } = await supabase
            .from('assessment_generated_papers')
            .select('status')
            .eq('school_id', schoolId)
            .eq('is_deleted', false);

        if (error) throw error;

        const total = data.length;
        const generated = data.filter(p => p.status === 'GENERATED').length;
        const published = data.filter(p => p.status === 'PUBLISHED').length;

        // Locks check count
        const { count: locksCount } = await supabase
            .from('assessment_generation_locks')
            .select('*', { count: 'exact', head: true })
            .gt('expires_at', new Date().toISOString());

        return {
            totalPapers: total,
            statusDistribution: {
                GENERATED: generated,
                PUBLISHED: published
            },
            activeLocks: locksCount || 0
        };
    }
}
export default PaperStatisticsService;
