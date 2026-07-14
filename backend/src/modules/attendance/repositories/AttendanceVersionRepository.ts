import { supabase } from '../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendanceVersionRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_record_versions');
    }

    public async getRecordVersions(recordId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('attendance_record_id', recordId)
            .order('changed_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}
export default AttendanceVersionRepository;
