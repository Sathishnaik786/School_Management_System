import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class BlueprintRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_blueprints');
    }

    public async listBlueprints(
        schoolId: string,
        filters: { subjectId?: string; status?: string; page: number; limit: number }
    ): Promise<{ data: any[]; totalCount: number }> {
        let query = supabase
            .from(this.tableName)
            .select('*', { count: 'exact' })
            .eq('school_id', schoolId);

        if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
        if (filters.status) query = query.eq('status', filters.status);

        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, error, count } = await query;
        if (error) throw error;

        return {
            data: data || [],
            totalCount: count || 0
        };
    }

    public async findBlueprintById(blueprintId: string, schoolId: string): Promise<any | null> {
        const { data: blueprint, error: bError } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', blueprintId)
            .eq('school_id', schoolId)
            .maybeSingle();

        if (bError) throw bError;
        if (!blueprint) return null;

        const { data: sections, error: sError } = await supabase
            .from('assessment_blueprint_sections')
            .select('*')
            .eq('blueprint_id', blueprintId)
            .order('sort_order', { ascending: true });

        if (sError) throw sError;

        const sectionIds = (sections || []).map(s => s.id);
        let rules: any[] = [];
        if (sectionIds.length > 0) {
            const { data: rulesData, error: rError } = await supabase
                .from('assessment_blueprint_rules')
                .select('*')
                .in('section_id', sectionIds);

            if (rError) throw rError;
            rules = rulesData || [];
        }

        const enrichedSections = (sections || []).map(sec => ({
            ...sec,
            rules: rules.filter(r => r.section_id === sec.id)
        }));

        return {
            ...blueprint,
            sections: enrichedSections
        };
    }

    public async createBlueprint(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                ...payload,
                school_id: schoolId,
                status: 'DRAFT',
                version: 1
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async updateBlueprint(blueprintId: string, schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...payload,
                updated_at: new Date().toISOString()
            })
            .eq('id', blueprintId)
            .eq('school_id', schoolId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async deleteBlueprint(blueprintId: string, schoolId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', blueprintId)
            .eq('school_id', schoolId);

        if (error) throw error;
    }
}
export default BlueprintRepository;
