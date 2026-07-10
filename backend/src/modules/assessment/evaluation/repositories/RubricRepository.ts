import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class RubricRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_rubrics');
    }

    public async listRubrics(schoolId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, criteria:assessment_rubric_criteria(*)')
            .eq('school_id', schoolId);

        if (error) throw error;
        return data || [];
    }

    public async findRubricById(rubricId: string, schoolId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*, criteria:assessment_rubric_criteria(*)')
            .eq('id', rubricId)
            .eq('school_id', schoolId)
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async createRubric(schoolId: string, payload: any): Promise<any> {
        const { data: rubric, error: rErr } = await supabase
            .from(this.tableName)
            .insert({
                school_id: schoolId,
                question_snapshot_id: payload.question_snapshot_id,
                total_score: payload.total_score,
                template_id: payload.template_id || null
            })
            .select()
            .single();

        if (rErr) throw rErr;

        if (payload.criteria && payload.criteria.length > 0) {
            const criteriaPayload = payload.criteria.map((c: any) => ({
                rubric_id: rubric.id,
                name: c.name,
                weight: c.weight,
                description: c.description || null,
                criteria_levels: c.criteria_levels || []
            }));

            const { error: cErr } = await supabase
                .from('assessment_rubric_criteria')
                .insert(criteriaPayload);

            if (cErr) throw cErr;
        }

        return this.findRubricById(rubric.id, schoolId);
    }
}
export default RubricRepository;
