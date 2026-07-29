import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class QuestionFolderRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_folders');
    }

    public async findBySchool(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId)
            .eq('is_deleted', false)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    public async findById(id: string, schoolId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .eq('school_id', schoolId)
            .eq('is_deleted', false)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async create(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({ ...payload, school_id: schoolId })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async update(id: string, schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async softDelete(id: string, schoolId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .update({
                is_deleted: true,
                deleted_at: new Date().toISOString(),
                deleted_by: userId
            })
            .eq('id', id)
            .eq('school_id', schoolId);

        if (error) throw error;
    }

    public async getFolderStats(schoolId: string): Promise<any[]> {
        // Query counts of active questions grouped by folder_id
        const { data, error } = await supabase
            .from('assessment_question_bank')
            .select('folder_id, difficulty, status')
            .eq('school_id', schoolId)
            .eq('is_deleted', false);

        if (error) throw error;
        return data || [];
    }
}
export default QuestionFolderRepository;
