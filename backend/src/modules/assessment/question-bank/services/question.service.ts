import { BaseService } from '../../../admission/services/BaseService';
import { QuestionRepository } from '../repositories/question.repository';
import { QuestionOptionRepository } from '../repositories/QuestionOptionRepository';
import { QuestionFolderRepository } from '../repositories/QuestionFolderRepository';
import { QuestionValidator } from '../validators/QuestionValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { NotFoundError } from '../../../admission/errors/NotFoundError';

export class QuestionService extends BaseService {
    private readonly repo = new QuestionRepository();
    private readonly optionRepo = new QuestionOptionRepository();
    private readonly folderRepo = new QuestionFolderRepository();
    private readonly audit = new AuditService();

    // ==========================================
    // FOLDERS DELEGATION
    // ==========================================
    public async listFolders(schoolId: string, correlationId?: string): Promise<any[]> {
        return this.folderRepo.findBySchool(schoolId);
    }

    public async createFolder(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = QuestionValidator.validateFolder(payload);
        const folder = await this.folderRepo.create(schoolId, validated);
        
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_CREATE',
            entityName: 'assessment_folders',
            entityId: folder.id,
            afterState: folder,
            correlationId
        });

        await EventBus.publish('FolderCreated', { folderId: folder.id, schoolId, userId });
        return folder;
    }

    public async updateFolder(id: string, schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = QuestionValidator.validateFolder(payload);
        const beforeState = await this.folderRepo.findById(id, schoolId);
        if (!beforeState) throw new NotFoundError(`Folder not found with ID: ${id}`);

        const updated = await this.folderRepo.update(id, schoolId, validated);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_UPDATE',
            entityName: 'assessment_folders',
            entityId: id,
            beforeState,
            afterState: updated,
            correlationId
        });

        return updated;
    }

    public async deleteFolder(id: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        const beforeState = await this.folderRepo.findById(id, schoolId);
        if (!beforeState) throw new NotFoundError(`Folder not found with ID: ${id}`);

        await this.folderRepo.softDelete(id, schoolId, userId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_DELETE',
            entityName: 'assessment_folders',
            entityId: id,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });
    }

    // ==========================================
    // QUESTIONS CRUD
    // ==========================================
    public async listQuestions(schoolId: string, filters: any, correlationId?: string): Promise<any> {
        return this.repo.listQuestions(schoolId, filters);
    }

    public async getQuestionById(id: string, schoolId: string, correlationId?: string): Promise<any> {
        const question = await this.repo.findQuestionById(id, schoolId);
        if (!question) throw new NotFoundError(`Question not found with ID: ${id}`);
        return question;
    }

    public async createQuestion(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = QuestionValidator.validateCreate(payload);

        // Deduplication warning check
        const isDuplicate = await this.repo.duplicateCheck(schoolId, validated.subject_id, validated.question_text);
        if (isDuplicate) {
            this.logInfo(`Duplicate warning: matching question found for subject: ${validated.subject_id}`, correlationId);
        }

        const question = await this.repo.createQuestion(schoolId, {
            ...validated,
            version: 1,
            status: 'DRAFT',
            created_by: userId
        });

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_CREATE',
            entityName: 'assessment_question_bank',
            entityId: question.id,
            afterState: question,
            correlationId
        });

        await EventBus.publish('QuestionCreated', { questionId: question.id, schoolId, userId });
        return question;
    }

    public async updateQuestion(id: string, schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = QuestionValidator.validateUpdate(payload);
        const current = await this.getQuestionById(id, schoolId, correlationId);

        // Fork if approved or published
        if (current.status === 'APPROVED' || current.status === 'PUBLISHED') {
            this.logInfo(`Forking new draft version for question: ${id}`, correlationId);
            const forkedPayload = {
                ...current,
                ...validated,
                version: current.version + 1,
                status: 'DRAFT',
                parent_id: current.parent_id || current.id,
                options: validated.options || current.options
            };
            delete forkedPayload.id;
            delete forkedPayload.created_at;
            delete forkedPayload.updated_at;

            const forked = await this.repo.createQuestion(schoolId, forkedPayload);

            await this.audit.logAudit({
                userId,
                action: 'ASSESSMENT_QUESTION_FORK',
                entityName: 'assessment_question_bank',
                entityId: forked.id,
                beforeState: current,
                afterState: forked,
                correlationId
            });

            await EventBus.publish('QuestionVersionCreated', { questionId: forked.id, version: forked.version, schoolId, userId });
            return forked;
        }

        // Standard update
        const updated = await this.repo.updateQuestion(id, schoolId, validated);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_UPDATE',
            entityName: 'assessment_question_bank',
            entityId: id,
            beforeState: current,
            afterState: updated,
            correlationId
        });

        await EventBus.publish('QuestionUpdated', { questionId: id, schoolId, userId });
        return updated;
    }

    public async deleteQuestion(id: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        const beforeState = await this.getQuestionById(id, schoolId, correlationId);
        await this.repo.deleteQuestion(id, schoolId, userId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTION_DELETE',
            entityName: 'assessment_question_bank',
            entityId: id,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });

        await EventBus.publish('QuestionDeleted', { questionId: id, schoolId, userId });
    }
}
export default QuestionService;
