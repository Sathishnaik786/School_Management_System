import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class BlueprintRuleRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_blueprint_rules');
    }

    public async findBySectionIds(sectionIds: string[]): Promise<any[]> {
        if (!sectionIds || sectionIds.length === 0) return [];
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .in('section_id', sectionIds);

        if (error) throw error;
        return data || [];
    }

    public async insertBulk(rules: any[]): Promise<any[]> {
        if (!rules || rules.length === 0) return [];
        const { data, error } = await supabase
            .from(this.tableName)
            .insert(rules)
            .select();

        if (error) throw error;
        return data || [];
    }
}
export default BlueprintRuleRepository;
