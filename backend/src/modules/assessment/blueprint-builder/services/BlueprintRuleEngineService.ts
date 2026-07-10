import { BaseService } from '../../../admission/services/BaseService';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';
import { supabase } from '../../../../config/supabase';

export class BlueprintRuleEngineService extends BaseService {
    /**
     * Validates blueprint rules, marks consistency, distributions, and matches against the actual question bank pools.
     */
    public async validateBlueprint(schoolId: string, blueprintPayload: any, correlationId?: string): Promise<{ success: boolean; warnings: string[]; errors: string[] }> {
        this.logInfo(`Running Rule Engine validation on blueprint: ${blueprintPayload.name}`, correlationId);

        const errors: string[] = [];
        const warnings: string[] = [];

        const totalMarks = Number(blueprintPayload.total_marks || 100);
        const sections = blueprintPayload.sections || [];

        // 1. Calculate section marks sum
        let calculatedMarks = 0;
        for (const sec of sections) {
            calculatedMarks += Number(sec.total_questions) * Number(sec.points_per_question);
        }

        if (Math.abs(calculatedMarks - totalMarks) > 0.01) {
            errors.push(`Marks discrepancy: Total blueprint marks is set to ${totalMarks}, but section calculations total ${calculatedMarks}.`);
        }

        // 2. Validate difficulty distribution percentage sum (if defined)
        const difficulty = blueprintPayload.difficulty_distribution || {};
        const diffSum = Object.values(difficulty).reduce((sum: number, val: any) => sum + Number(val), 0);
        if (Object.keys(difficulty).length > 0 && Math.abs(diffSum - 100) > 0.01) {
            errors.push(`Difficulty distribution percentages must sum to 100% (currently ${diffSum}%).`);
        }

        // 3. Validate Bloom taxonomy distribution percentage sum (if defined)
        const bloom = blueprintPayload.bloom_distribution || {};
        const bloomSum = Object.values(bloom).reduce((sum: number, val: any) => sum + Number(val), 0);
        if (Object.keys(bloom).length > 0 && Math.abs(bloomSum - 100) > 0.01) {
            errors.push(`Bloom taxonomy distribution percentages must sum to 100% (currently ${bloomSum}%).`);
        }

        // 4. Match rules against Question Bank Pools to detect undersized pools
        for (const sec of sections) {
            const rules = sec.rules || [];
            
            // Build base question bank count query
            let query = supabase
                .from('assessment_question_bank')
                .select('id', { count: 'exact', head: true })
                .eq('school_id', schoolId)
                .eq('is_deleted', false)
                .eq('subject_id', blueprintPayload.subject_id);

            // Apply filter fields
            for (const r of rules) {
                if (r.filter_field === 'difficulty') {
                    query = query.eq('difficulty', r.filter_value);
                } else if (r.filter_field === 'bloom_level') {
                    query = query.eq('bloom_level', r.filter_value);
                } else if (r.filter_field === 'course_outcome') {
                    query = query.eq('course_outcome_code', r.filter_value);
                }
            }

            const { count, error } = await query;
            if (error) {
                warnings.push(`Could not query question bank pool counts for section: ${sec.section_name}`);
            } else {
                const poolCount = count || 0;
                if (poolCount < sec.total_questions) {
                    warnings.push(`Section "${sec.section_name}" requires ${sec.total_questions} questions, but only ${poolCount} matching questions exist in the active Question Bank subject pool.`);
                }
            }
        }

        return {
            success: errors.length === 0,
            errors,
            warnings
        };
    }
}
export default BlueprintRuleEngineService;
