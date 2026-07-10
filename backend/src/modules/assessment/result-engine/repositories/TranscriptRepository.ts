import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class TranscriptRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_transcripts');
    }

    public async createTranscript(studentId: string, recordJson: any, isOfficial = false, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                student_id: studentId,
                academic_record_json: recordJson,
                is_official: isOfficial,
                issued_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default TranscriptRepository;
