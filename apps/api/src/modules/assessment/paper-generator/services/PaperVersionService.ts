import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class PaperVersionService extends BaseService {
    public async getHistory(paperId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Resolving version snapshots for paper: ${paperId}`, correlationId);

        const { data, error } = await supabase
            .from('assessment_generated_versions')
            .select('*')
            .eq('paper_id', paperId)
            .order('version', { ascending: false });

        if (error) throw error;
        return data || [];
    }
}
export default PaperVersionService;
