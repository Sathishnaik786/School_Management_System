import { BaseService } from '../../../admission/services/BaseService';
import { PromotionRepository } from '../repositories/PromotionRepository';
import { supabase } from '../../../../config/supabase';

export class PromotionEngine extends BaseService {
    private readonly repo = new PromotionRepository();

    public async processStudentPromotion(
        studentId: string,
        academicYearId: string,
        gpa: number,
        backlogsCount: number,
        userId?: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Running promotion parameters checking for student: ${studentId}`, correlationId);

        let decision: 'PASS' | 'PROMOTED' | 'PROMOTED WITH BACKLOG' | 'COMPARTMENT' | 'REPEAT' | 'WITHHELD' = 'PASS';
        let remarks = 'Promotion rules matched successfully. ';

        if (backlogsCount > 0 && backlogsCount <= 2) {
            decision = 'PROMOTED WITH BACKLOG';
            remarks += `Promoted to next grade with ${backlogsCount} backlog papers pending.`;
        } else if (backlogsCount > 2) {
            decision = 'REPEAT';
            remarks += `Repeat year requested due to ${backlogsCount} backlog papers.`;
        } else if (gpa < 5.00) {
            decision = 'COMPARTMENT';
            remarks += 'GPA falls below baseline threshold.';
        }

        return this.repo.savePromotionDecision(studentId, academicYearId, decision, remarks, userId);
    }
}
export default PromotionEngine;
