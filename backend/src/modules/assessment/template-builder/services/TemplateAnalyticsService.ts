import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class TemplateAnalyticsService extends BaseService {
    public async getMetrics(schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Resolving template builder metrics for school: ${schoolId}`, correlationId);

        const { data, error } = await supabase
            .from('assessment_templates')
            .select('status, subject_id')
            .eq('school_id', schoolId)
            .eq('is_deleted', false);

        if (error) throw error;

        const draft = data.filter(t => t.status === 'DRAFT').length;
        const review = data.filter(t => t.status === 'UNDER_REVIEW').length;
        const approved = data.filter(t => t.status === 'APPROVED').length;
        const published = data.filter(t => t.status === 'PUBLISHED').length;

        return {
            totalTemplates: data.length,
            statusDistribution: {
                DRAFT: draft,
                UNDER_REVIEW: review,
                APPROVED: approved,
                PUBLISHED: published
            }
        };
    }
}
export default TemplateAnalyticsService;
