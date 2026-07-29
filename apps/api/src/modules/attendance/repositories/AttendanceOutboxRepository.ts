import { supabase } from '../../../config/supabase';
import { BaseRepository } from '../../admission/repositories/BaseRepository';

export class AttendanceOutboxRepository extends BaseRepository<any> {
    constructor() {
        super('attendance_event_outbox');
    }

    public async queueEvent(eventName: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                event_name: eventName,
                payload,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default AttendanceOutboxRepository;
