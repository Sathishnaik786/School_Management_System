import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class TemplateInstructionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_template_instructions');
    }

    public async findByTemplateId(templateId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('template_id', templateId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async saveInstructions(templateId: string, instructionsText: string): Promise<any> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('template_id', templateId);

        if (delError) throw delError;

        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                template_id: templateId,
                instructions_text: instructionsText
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default TemplateInstructionRepository;
