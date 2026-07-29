import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class AssessmentConfigurationRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_configurations');
    }

    public async findAll(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId);
        
        if (error) throw error;
        return data || [];
    }

    public async findById(id: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async findConfigBySchool(schoolId: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId)
            .maybeSingle();

        if (error) throw error;
        if (data) return data;

        // Auto-seed defaults if not found (on demand)
        const { data: newConfig, error: insertError } = await supabase
            .from(this.tableName)
            .insert({ school_id: schoolId })
            .select()
            .single();

        if (insertError) throw insertError;
        return newConfig;
    }

    public async create(config: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert(config)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async update(id: string, config: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...config,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
