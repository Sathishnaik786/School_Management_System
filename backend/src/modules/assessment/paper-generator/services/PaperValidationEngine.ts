import { BaseService } from '../../../admission/services/BaseService';
import { PaperRepository } from '../repositories/PaperRepository';
import { PaperValidationRepository } from '../repositories/PaperValidationRepository';

export interface ValidationReport {
    success: boolean;
    status: 'PASS' | 'WARNING' | 'FAIL';
    errors: string[];
    warnings: string[];
}

export class PaperValidationEngine extends BaseService {
    private readonly repo = new PaperRepository();
    private readonly valRepo = new PaperValidationRepository();

    public async validatePaper(paperId: string, schoolId: string, userId?: string, correlationId?: string): Promise<ValidationReport> {
        this.logInfo(`Running verification pipeline on generated paper: ${paperId}`, correlationId);

        const errors: string[] = [];
        const warnings: string[] = [];

        const paper = await this.repo.findPaperById(paperId, schoolId);
        if (!paper) throw new Error('Generated paper not found.');

        // 1. Check sections length
        if (!paper.sections || paper.sections.length === 0) {
            errors.push('Sections mismatch: No sections mapped to this exam paper.');
        }

        // 2. Validate questions count in each section
        let totalAssignedQuestions = 0;
        let calculatedMarks = 0;

        for (const sec of paper.sections || []) {
            const assignedCount = sec.questions?.length || 0;
            totalAssignedQuestions += assignedCount;
            calculatedMarks += Number(sec.total_questions) * Number(sec.points_per_question);

            if (assignedCount < sec.total_questions) {
                errors.push(`Section "${sec.section_name}" requires ${sec.total_questions} questions, but only ${assignedCount} questions could be assembled.`);
            }
        }

        // 3. Compare with blueprint target marks
        if (Math.abs(calculatedMarks - Number(paper.total_marks)) > 0.01) {
            errors.push(`Marks mismatch: Sections calculated total is ${calculatedMarks} marks, but target marks is ${paper.total_marks}.`);
        }

        const success = errors.length === 0;
        const status = errors.length > 0 ? 'FAIL' : warnings.length > 0 ? 'WARNING' : 'PASS';

        // Log validation history log record
        await this.valRepo.logValidation(paperId, status, errors, warnings, userId);

        return {
            success,
            status,
            errors,
            warnings
        };
    }
}
export default PaperValidationEngine;
