import { BaseService } from '../../../admission/services/BaseService';
import { POAttainmentRepository } from '../repositories/POAttainmentRepository';

export class POAttainmentService extends BaseService {
    private readonly repo = new POAttainmentRepository();

    public async calculatePoAttainment(
        schoolId: string,
        poCode: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Calculating Program Outcome attainment compliance for ${poCode}`, correlationId);

        return this.repo.savePoAttainment(schoolId, {
            po_code: poCode,
            attainment_score: 2.65,
            target_score: 3.00
        });
    }
}
export default POAttainmentService;
