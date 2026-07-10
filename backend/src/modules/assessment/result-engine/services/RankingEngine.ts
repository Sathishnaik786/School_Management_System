import { BaseService } from '../../../admission/services/BaseService';
import { RankingRepository } from '../repositories/RankingRepository';
import { StudentResultRepository } from '../repositories/StudentResultRepository';

export class RankingEngine extends BaseService {
    private readonly repo = new RankingRepository();
    private readonly studentResultsRepo = new StudentResultRepository();

    public async calculateCohortRankings(
        sessionId: string,
        correlationId?: string
    ): Promise<void> {
        this.logInfo(`Running ranking engine for session cohort: ${sessionId}`, correlationId);

        const results = await this.studentResultsRepo.listResultsBySession(sessionId);
        
        // Sort students desc by CGPA
        const sorted = [...results].sort((a, b) => Number(b.cgpa) - Number(a.cgpa));

        for (let idx = 0; idx < sorted.length; idx++) {
            const item = sorted[idx];
            await this.repo.saveStudentRank(sessionId, item.student_id, item.cgpa, idx + 1);
        }
    }
}
export default RankingEngine;
