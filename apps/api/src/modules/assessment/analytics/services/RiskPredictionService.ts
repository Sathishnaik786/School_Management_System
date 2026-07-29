import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class RiskPredictionService extends BaseService {
    public async processStudentRiskScore(
        studentId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Running predictive dropout risk evaluation logic for student: ${studentId}`, correlationId);

        // Fetch student's GPA calculation results from Phase 12
        const { data: results, error } = await supabase
            .from('assessment_student_results')
            .select('*')
            .eq('student_id', studentId);

        if (error) throw error;

        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
        let riskScore = 0.15;
        const factors: string[] = [];

        if (!results || results.length === 0) {
            riskLevel = 'MEDIUM';
            riskScore = 0.50;
            factors.push('No academic grade cards recorded in the current semester.');
        } else {
            const meanGpa = results.reduce((acc, curr) => acc + Number(curr.gpa), 0) / results.length;
            if (meanGpa < 5.00) {
                riskLevel = 'HIGH';
                riskScore = 0.85;
                factors.push('Cumulative GPA falls below academic warning levels.');
            } else if (meanGpa < 6.50) {
                riskLevel = 'MEDIUM';
                riskScore = 0.45;
                factors.push('Marginal passing GPA averages.');
            }
        }

        const { data, error: insError } = await supabase
            .from('assessment_student_risk_scores')
            .insert({
                student_id: studentId,
                risk_level: riskLevel,
                risk_score: riskScore,
                factors
            })
            .select()
            .single();

        if (insError) throw insError;
        return data;
    }
}
export default RiskPredictionService;
