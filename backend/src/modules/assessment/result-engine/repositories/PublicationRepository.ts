import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PublicationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_result_publications');
    }

    public async publishResultPortal(sessionId: string, targetPortal: string, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                session_id: sessionId,
                target_portal: targetPortal,
                published_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PublicationRepository;
