import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class GenerationJobRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_generation_jobs');
    }

    public async listJobs(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    public async createJob(schoolId: string, blueprintId: string, templateId: string, userId?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                blueprint_id: blueprintId,
                template_id: templateId,
                status: 'PENDING',
                created_by: userId || null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async updateJobStatus(jobId: string, status: string, logs: any[], errorMessage?: string): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                status,
                logs,
                error_message: errorMessage || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', jobId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default GenerationJobRepository;
