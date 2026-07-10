import { BaseService } from '../../../admission/services/BaseService';
import { BlueprintAnalyticsRepository } from '../repositories/BlueprintAnalyticsRepository';

export class BlueprintAnalyticsService extends BaseService {
    private readonly analyticsRepo = new BlueprintAnalyticsRepository();

    public async getMetrics(schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Resolving blueprints metrics for school: ${schoolId}`, correlationId);
        const data = await this.analyticsRepo.getBlueprintStats(schoolId);

        const draft = data.filter(b => b.status === 'DRAFT').length;
        const review = data.filter(b => b.status === 'UNDER_REVIEW').length;
        const approved = data.filter(b => b.status === 'APPROVED').length;
        const published = data.filter(b => b.status === 'PUBLISHED').length;

        // Group by subject counts
        const subjectCounts: Record<string, number> = {};
        for (const item of data) {
            subjectCounts[item.subject_id] = (subjectCounts[item.subject_id] || 0) + 1;
        }

        return {
            totalBlueprints: data.length,
            statusDistribution: {
                DRAFT: draft,
                UNDER_REVIEW: review,
                APPROVED: approved,
                PUBLISHED: published
            },
            subjectDistribution: subjectCounts
        };
    }
}
export default BlueprintAnalyticsService;
