import { BaseService } from '../../../admission/services/BaseService';
import { QuestionRepository } from '../repositories/question.repository';
import { createQuestionSchema, updateQuestionSchema, CreateQuestionDto, UpdateQuestionDto } from '../dto/question.dto';
import { createFolderSchema, updateFolderSchema, CreateFolderDto, UpdateFolderDto } from '../dto/folder.dto';
import { AuditService } from '../../../admission/services/AuditService';
import { ValidationError } from '../../../admission/errors/ValidationError';
import { NotFoundError } from '../../../admission/errors/NotFoundError';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';

export class QuestionService extends BaseService {
    private readonly repo: QuestionRepository;
    private readonly auditService: AuditService;

    constructor() {
        super();
        this.repo = new QuestionRepository();
        this.auditService = new AuditService();
    }

    // ==========================================
    // FOLDERS SERVICES
    // ==========================================

    public async listFolders(schoolId: string, correlationId?: string): Promise<any[]> {
        this.logInfo(`Listing question folders for school: ${schoolId}`, correlationId);
        return this.repo.listFolders(schoolId);
    }

    public async createFolder(
        schoolId: string,
        userId: string,
        payload: CreateFolderDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(createFolderSchema, payload);
        const folder = await this.repo.createFolder(schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_CREATE',
            entityName: 'assessment_folders',
            entityId: folder.id,
            afterState: folder,
            correlationId
        });

        return folder;
    }

    public async updateFolder(
        folderId: string,
        schoolId: string,
        userId: string,
        payload: UpdateFolderDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(updateFolderSchema, payload);
        const beforeState = await this.repo.findFolderById(folderId, schoolId); // Basic find check
        if (!beforeState || beforeState.school_id !== schoolId) {
            throw new NotFoundError(`Folder not found with ID: ${folderId}`);
        }

        const folder = await this.repo.updateFolder(folderId, schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_UPDATE',
            entityName: 'assessment_folders',
            entityId: folderId,
            beforeState,
            afterState: folder,
            correlationId
        });

        return folder;
    }

    public async deleteFolder(
        folderId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<void> {
        const beforeState = await this.repo.findFolderById(folderId, schoolId);
        if (!beforeState || beforeState.school_id !== schoolId) {
            throw new NotFoundError(`Folder not found with ID: ${folderId}`);
        }

        await this.repo.deleteFolder(folderId, schoolId, userId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_DELETE',
            entityName: 'assessment_folders',
            entityId: folderId,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });
    }

    // ==========================================
    // QUESTIONS SERVICES
    // ==========================================

    public async listQuestions(
        schoolId: string,
        filters: {
            folderId?: string | null;
            subjectId?: string;
            difficulty?: string;
            bloomLevel?: string;
            status?: string;
            search?: string;
            page: number;
            limit: number;
        },
        correlationId?: string
    ): Promise<{ data: any[]; totalCount: number }> {
        this.logInfo(`Listing paginated questions for school: ${schoolId}`, correlationId);
        return this.repo.listQuestions(schoolId, filters);
    }

    public async getQuestionById(questionId: string, schoolId: string, correlationId?: string): Promise<any> {
        const question = await this.repo.findQuestionById(questionId, schoolId);
        if (!question) {
            throw new NotFoundError(`Question not found with ID: ${questionId}`);
        }
        return question;
    }

    public async createQuestion(
        schoolId: string,
        userId: string,
        payload: CreateQuestionDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(createQuestionSchema, payload);

        // Deduplication warning check
        const isDuplicate = await this.repo.duplicateCheck(schoolId, validated.subject_id, validated.question_text);
        if (isDuplicate) {
            this.logInfo(`Duplicate question detected: "${validated.question_text.substring(0, 30)}..."`, correlationId);
            // We log warning but allow creation, or throw a conflict warning validation. Here we proceed but log it.
        }

        const question = await this.repo.createQuestion(schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_CREATE',
            entityName: 'assessment_question_bank',
            entityId: question.id,
            afterState: question,
            correlationId
        });

        return question;
    }

    /**
     * Updates question definition. For APPROVED questions, we fork a new draft version.
     */
    public async updateQuestion(
        questionId: string,
        schoolId: string,
        userId: string,
        payload: UpdateQuestionDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(updateQuestionSchema, payload);
        const currentQuestion = await this.getQuestionById(questionId, schoolId, correlationId);

        // Fork check: If question is APPROVED, modify splits a new DRAFT copy
        if (currentQuestion.status === 'APPROVED') {
            this.logInfo(`Question ${questionId} is APPROVED. Forking a new version.`, correlationId);
            const forkedPayload = {
                ...currentQuestion,
                ...validated,
                version: currentQuestion.version + 1,
                status: 'DRAFT',
                parent_id: questionId,
                options: validated.options || currentQuestion.options
            };
            delete forkedPayload.id;
            delete forkedPayload.created_at;
            delete forkedPayload.updated_at;

            const forkedQuestion = await this.repo.createQuestion(schoolId, forkedPayload);

            await this.auditService.logAudit({
                userId,
                action: 'ASSESSMENT_QUESTION_FORK',
                entityName: 'assessment_question_bank',
                entityId: forkedQuestion.id,
                beforeState: currentQuestion,
                afterState: forkedQuestion,
                correlationId
            });

            return forkedQuestion;
        }

        // Standard draft update in place
        const updatedQuestion = await this.repo.updateQuestion(questionId, schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_UPDATE',
            entityName: 'assessment_question_bank',
            entityId: questionId,
            beforeState: currentQuestion,
            afterState: updatedQuestion,
            correlationId
        });

        return updatedQuestion;
    }

    public async deleteQuestion(
        questionId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<void> {
        const beforeState = await this.getQuestionById(questionId, schoolId, correlationId);
        await this.repo.deleteQuestion(questionId, schoolId, userId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_DELETE',
            entityName: 'assessment_question_bank',
            entityId: questionId,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });
    }
}
