import { BaseService } from '../../../admission/services/BaseService';
import { EvaluationRepository } from '../repositories/EvaluationRepository';
import { supabase } from '../../../../config/supabase';

export class EvaluationService extends BaseService {
    private readonly repo = new EvaluationRepository();

    public async startEvaluationSession(
        schoolId: string,
        userId: string,
        payload: { published_paper_id: string; attempt_id: string; assignment_id?: string },
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Starting evaluation session for attempt: ${payload.attempt_id}`, correlationId);

        // Check if there is an active lock for this attempt
        const { data: activeLock } = await supabase
            .from('assessment_evaluation_locks')
            .select('*')
            .eq('evaluation_session_id', payload.attempt_id)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (activeLock && activeLock.evaluator_id !== userId) {
            throw new Error('This attempt script is currently locked by another evaluator.');
        }

        // Create new session
        const session = await this.repo.createSession(schoolId, {
            assignment_id: payload.assignment_id || null,
            published_paper_id: payload.published_paper_id,
            attempt_id: payload.attempt_id,
            evaluator_id: userId,
            status: 'UNDER_EVALUATION'
        });

        // Set evaluation lock for 30 minutes
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);

        await supabase
            .from('assessment_evaluation_locks')
            .insert({
                evaluation_session_id: session.id,
                evaluator_id: userId,
                expires_at: expiresAt.toISOString()
            });

        return session;
    }

    public async evaluateQuestion(
        sessionId: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Scoring question: ${payload.question_snapshot_id} in session: ${sessionId}`, correlationId);

        const session = await this.repo.findSessionById(sessionId, schoolId);
        if (!session) throw new Error('Evaluation session not found.');
        if (session.status === 'LOCKED') throw new Error('Cannot edit scored items on a locked session.');

        const res = await this.repo.saveQuestionEvaluation(sessionId, payload, userId);

        // Audit Trail log
        await supabase
            .from('assessment_evaluation_logs')
            .insert({
                session_id: sessionId,
                action: 'QUESTION_EVALUATED',
                before_state: {},
                after_state: { question_snapshot_id: payload.question_snapshot_id, awarded_marks: payload.awarded_marks },
                evaluator_id: userId
            });

        return res;
    }
}
export default EvaluationService;
