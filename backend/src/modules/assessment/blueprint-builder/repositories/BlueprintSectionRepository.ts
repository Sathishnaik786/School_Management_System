import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class BlueprintSectionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_blueprint_sections');
    }

    public async findByBlueprintId(blueprintId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('blueprint_id', blueprintId)
            .order('sort_order', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    public async deleteByBlueprintId(blueprintId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('blueprint_id', blueprintId);

        if (error) throw error;
    }
}
export default BlueprintSectionRepository;
