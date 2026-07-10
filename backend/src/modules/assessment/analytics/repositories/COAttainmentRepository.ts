import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class COAttainmentRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_co_attainment');
    }

    public async saveCoAttainment(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                subject_id: payload.subject_id,
                co_code: payload.co_code,
                attainment_target_pct: payload.attainment_target_pct,
                actual_attainment_pct: payload.actual_attainment_pct,
                status: payload.status
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default COAttainmentRepository;
