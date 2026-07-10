import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendancePolicyRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_policies');
    }

    public async getPolicy(schoolId: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId)
            .maybeSingle();

        if (error) throw error;
        if (data) return data;

        // Default seed
        const { data: seeded, error: seedErr } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                minimum_percentage: 75.00,
                late_threshold_minutes: 15,
                condonation_limit: 5
            })
            .select()
            .single();

        if (seedErr) throw seedErr;
        return seeded;
    }
}
export default AttendancePolicyRepository;
