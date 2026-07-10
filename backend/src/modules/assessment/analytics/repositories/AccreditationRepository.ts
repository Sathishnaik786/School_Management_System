import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class AccreditationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_accreditation_reports');
    }

    public async saveReport(schoolId: string, payload: any, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                report_type: payload.report_type,
                attainment_metrics_json: payload.attainment_metrics_json,
                generated_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AccreditationRepository;
