import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class EvaluationAnalyticsService extends BaseService {
    public async getDashboardMetrics(schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Resolving dashboard metrics for school: ${schoolId}`, correlationId);

        const { data: sessions, error } = await supabase
            .from('assessment_evaluation_sessions')
            .select('status')
            .eq('school_id', schoolId);

        if (error) throw error;

        const total = sessions?.length || 0;
        const finalized = sessions?.filter(s => s.status === 'FINALIZED' || s.status === 'LOCKED').length || 0;
        const pending = total - finalized;

        return {
            totalScripts: total,
            finalizedScripts: finalized,
            pendingScripts: pending,
            completionRatePct: total > 0 ? (finalized / total) * 100.00 : 0.00
        };
    }
}
export default EvaluationAnalyticsService;
