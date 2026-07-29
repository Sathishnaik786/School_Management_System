import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';
import { createHash } from 'crypto';

export class AcademicSnapshotService extends BaseService {
    public async captureSnapshot(academicRecordId: string, payload: any): Promise<any> {
        const jsonStr = JSON.stringify(payload);
        const signedHash = createHash('sha256').update(jsonStr).digest('hex');

        const { data, error } = await supabase
            .from('student_academic_record_snapshots')
            .insert({
                academic_record_id: academicRecordId,
                snapshot_json: payload,
                snapshot_hash: signedHash
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AcademicSnapshotService;
