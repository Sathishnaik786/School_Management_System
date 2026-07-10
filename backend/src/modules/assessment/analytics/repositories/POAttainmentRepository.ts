import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class POAttainmentRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_po_attainment');
    }

    public async savePoAttainment(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                po_code: payload.po_code,
                attainment_score: payload.attainment_score,
                target_score: payload.target_score
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default POAttainmentRepository;
