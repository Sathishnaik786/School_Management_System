import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class BlueprintVersionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_blueprint_versions');
    }

    public async findVersions(blueprintId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('blueprint_id', blueprintId)
            .order('version', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    public async createVersion(blueprintId: string, version: number, snapshot: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                blueprint_id: blueprintId,
                version,
                schema_snapshot: snapshot
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default BlueprintVersionRepository;
