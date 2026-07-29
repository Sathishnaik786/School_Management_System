import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PromotionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_promotion_decisions');
    }

    public async savePromotionDecision(studentId: string, academicYearId: string, decision: string, remarks?: string, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                student_id: studentId,
                academic_year_id: academicYearId,
                decision,
                remarks: remarks || null,
                decided_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PromotionRepository;
