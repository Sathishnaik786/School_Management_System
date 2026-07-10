import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class RankingRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_rankings');
    }

    public async saveStudentRank(sessionId: string, studentId: string, cgpa: number, rank: number): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                session_id: sessionId,
                student_id: studentId,
                cgpa,
                merit_rank: rank
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}
export default RankingRepository;
