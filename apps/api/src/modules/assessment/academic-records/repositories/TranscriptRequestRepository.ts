import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class TranscriptRequestRepository extends BaseRepository<any> {
    constructor() {
        super('transcript_requests');
    }

    public async createRequest(studentId: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                student_id: studentId,
                status: 'Requested'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async updateStatus(requestId: string, status: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ status, updated_at: new Date() })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default TranscriptRequestRepository;
