import { ExamRepository } from '../../repositories/evaluation/ExamRepository';
import { ApplicationRepository } from '../../repositories/application/ApplicationRepository';
import { ExamResult } from '../../domain/evaluation/ExamResult';
import { AuditService } from '../AuditService';

export class ResultService {
    constructor(
        private readonly examRepo: ExamRepository,
        private readonly appRepo: ApplicationRepository,
        private readonly auditService: AuditService
    ) {}

    public async recordMarks(
        candidateId: string,
        subjectId: string,
        marksObtained: number,
        evaluatorId: string | null,
        correlationId?: string
    ): Promise<ExamResult> {
        const candidate = await this.examRepo.findCandidateById(candidateId);
        if (!candidate) {
            throw new Error(`Candidate with ID ${candidateId} not found`);
        }

        const schedule = await this.examRepo.findScheduleById(candidate.session_id);
        if (!schedule) {
            throw new Error(`Exam schedule not found for candidate`);
        }

        const template = await this.examRepo.findTemplateById(schedule.templateId);
        if (!template) {
            throw new Error(`Exam template not found`);
        }

        // Fetch subjects definition
        const subjects = await this.examRepo.findSubjectsByTemplateId(schedule.templateId);
        const subject = subjects.find(s => s.id === subjectId);
        if (!subject) {
            throw new Error(`Subject with ID ${subjectId} not found for this exam template`);
        }

        if (marksObtained > subject.max_marks) {
            throw new Error(`Marks obtained (${marksObtained}) exceeds maximum marks (${subject.max_marks})`);
        }

        const percentage = (marksObtained / subject.max_marks) * 100;
        // Determine subject pass or fail
        const passingThresholdPercentage = (template.passingMarks / template.totalMarks) * 100;
        const pass = percentage >= passingThresholdPercentage;

        const result = new ExamResult(
            crypto.randomUUID(),
            candidateId,
            subjectId,
            marksObtained,
            percentage,
            pass,
            evaluatorId,
            new Date(),
            new Date()
        );
        await this.examRepo.saveResult(result);

        // Check if all template subjects are fully evaluated
        const recordedResults = await this.examRepo.findResultsByCandidateId(candidateId);
        if (recordedResults.length === subjects.length) {
            // Update exam status if this candidate is the last one, or just update candidate status
            // For Simplicity, log candidate marks published
            await this.appRepo.logWorkflow(
                candidate.application_id,
                'EXAM_MARKS_PUBLISHED',
                null,
                'SUBMITTED',
                evaluatorId,
                `Exam result grading published. Candidate evaluated successfully.`
            );
        }

        // Audit Trail log
        await this.auditService.logAudit({
            action: 'EXAM_MARKS_RECORDED',
            entityName: 'admission_exam_results',
            entityId: result.id,
            afterState: { marksObtained, percentage, pass },
            userId: evaluatorId,
            correlationId
        });

        return result;
    }
}
