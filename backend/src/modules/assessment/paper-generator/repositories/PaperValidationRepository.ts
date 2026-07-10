import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class PaperValidationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generated_validation_logs');
    }

    public async logValidation(
        paperId: string,
        status: 'PASS' | 'WARNING' | 'FAIL',
        errors: string[],
        warnings: string[],
        userId?: string
    ): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                paper_id: paperId,
                validation_status: status,
                errors,
                warnings,
                validated_by: userId || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default PaperValidationRepository;
