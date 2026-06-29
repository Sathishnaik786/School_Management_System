import { ExamRepository } from '../../../repositories/evaluation/ExamRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class InterviewValidator {
    constructor(private readonly examRepo: ExamRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const candidate = await this.examRepo.findCandidateByApplicationId(applicationId);
        if (!candidate) {
            throw new BusinessRuleError(`Candidate has not been scheduled or allocated for any entrance exam.`);
        }

        if (candidate.attendance_status === 'ABSENT') {
            throw new BusinessRuleError(`Candidate was marked ABSENT during the entrance exam session.`);
        }

        const results = await this.examRepo.findResultsByCandidateId(candidate.id);
        if (!results || results.length === 0) {
            throw new BusinessRuleError(`Entrance exam evaluation marks have not been published for this candidate yet.`);
        }
    }
}
