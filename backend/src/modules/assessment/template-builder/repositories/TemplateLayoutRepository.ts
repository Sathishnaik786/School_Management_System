import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class TemplateLayoutRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_template_layout_rules');
    }

    public async findByTemplateId(templateId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('template_id', templateId);

        if (error) throw error;
        return data || [];
    }

    public async saveLayoutRules(templateId: string, rules: any[]): Promise<any[]> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('template_id', templateId);

        if (delError) throw delError;

        if (!rules || rules.length === 0) return [];

        const payload = rules.map(r => ({
            template_id: templateId,
            property: r.property,
            value: String(r.value)
        }));

        const { data, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default TemplateLayoutRepository;
