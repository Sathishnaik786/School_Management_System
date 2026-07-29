import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';

export class GraduationEligibilityEngine extends BaseService {
    public async verifyClearances(
        studentId: string,
        correlationId?: string
    ): Promise<boolean> {
        this.logInfo(`Running graduation clearance checklists check for student: ${studentId}`, correlationId);

        // Fetch clearance NOC checkmarks list
        const { data: clearances, error } = await supabase
            .from('graduation_clearance_items')
            .select('*')
            .eq('student_id', studentId);

        if (error) throw error;

        const expectedTypes = ['Library', 'Finance', 'Hostel', 'Transport', 'Department', 'ExamCell', 'Placement', 'Alumni'];
        const clearedTypes = (clearances || [])
            .filter(c => c.status === 'CLEARED')
            .map(c => c.clearance_type);

        const isFullyCleared = expectedTypes.every(t => clearedTypes.includes(t));
        return isFullyCleared;
    }
}
export default GraduationEligibilityEngine;
