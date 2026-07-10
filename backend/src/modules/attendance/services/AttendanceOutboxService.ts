import { BaseService } from '../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class AttendanceOutboxService extends BaseService {
    public async processPendingEvents(correlationId?: string): Promise<void> {
        this.logInfo(`Scanning event outbox register for pending logs`, correlationId);

        const { data: events, error } = await supabase
            .from('attendance_event_outbox')
            .select('*')
            .eq('status', 'PENDING');

        if (error) throw error;

        for (const evt of events || []) {
            // Mark processed
            await supabase
                .from('attendance_event_outbox')
                .update({ status: 'PROCESSED' })
                .eq('id', evt.id);
        }
    }
}
export default AttendanceOutboxService;
