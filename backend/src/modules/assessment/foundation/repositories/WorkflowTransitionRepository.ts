import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class WorkflowTransitionRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_workflow_transitions');
    }

    public async findByWorkflowId(workflowId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('workflow_id', workflowId);

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

    public async createBulk(transitions: any[]): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert(transitions)
            .select();

        if (error) throw error;
        return data || [];
    }

    public async create(transition: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert(transition)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async update(id: string, transition: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update(transition)
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

    public async deleteByWorkflowId(workflowId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('workflow_id', workflowId);

        if (error) throw error;
    }
}
