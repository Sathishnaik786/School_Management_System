import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class GraduationRepository extends BaseRepository<any> {
    constructor() {
        super('graduation_candidates');
    }

    public async saveCandidate(studentId: string, status: string): Promise<any> {
        const { data: existing } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (existing) {
            const { data, error } = await supabase
                .from(this.tableName)
                .update({
                    status,
                    updated_at: new Date()
                })
                .eq('id', existing.id)
                .select()
                .single();
            if (error) throw error;
            return data;
        } else {
            const { data, error } = await supabase
                .from(this.tableName)
                .insert({
                    student_id: studentId,
                    status
                })
                .select()
                .single();
            if (error) throw error;
            return data;
        }
    }

    public async getClearanceStatus(studentId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('graduation_clearance_items')
            .select('*')
            .eq('student_id', studentId);

        if (error) throw error;
        return data || [];
    }

    public async approveClearance(studentId: string, type: string): Promise<any> {
        const { data, error } = await supabase
            .from('graduation_clearance_items')
            .insert({
                student_id: studentId,
                clearance_type: type,
                status: 'CLEARED'
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default GraduationRepository;
