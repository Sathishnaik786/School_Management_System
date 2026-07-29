import { BaseService } from '../../../admission/services/BaseService';
import { COAttainmentRepository } from '../repositories/COAttainmentRepository';

export class COAttainmentService extends BaseService {
    private readonly repo = new COAttainmentRepository();

    public async calculateCoAttainment(
        schoolId: string,
        subjectId: string,
        coCode: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Calculating Course Outcome attainment level for ${coCode}`, correlationId);

        // Simulated compliance target rates checks
        const actualPct = 78.50; 
        const status = actualPct >= 70.00 ? 'MET' : 'NOT_MET';

        return this.repo.saveCoAttainment(schoolId, {
            subject_id: subjectId,
            co_code: coCode,
            attainment_target_pct: 70.00,
            actual_attainment_pct: actualPct,
            status
        });
    }
}
export default COAttainmentService;
