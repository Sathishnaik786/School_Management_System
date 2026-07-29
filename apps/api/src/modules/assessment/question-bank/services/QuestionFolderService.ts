import { BaseService } from '../../../admission/services/BaseService';
import { QuestionFolderRepository } from '../repositories/QuestionFolderRepository';
import { QuestionRepository } from '../repositories/question.repository';
import { QuestionValidator } from '../validators/QuestionValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { NotFoundError } from '../../../admission/errors/NotFoundError';
import { supabase } from '../../../../config/supabase';

export class QuestionFolderService extends BaseService {
    private readonly folderRepo = new QuestionFolderRepository();
    private readonly questionRepo = new QuestionRepository();
    private readonly audit = new AuditService();

    public async getFolders(schoolId: string, correlationId?: string): Promise<any[]> {
        return this.folderRepo.findBySchool(schoolId);
    }

    public async getFolderById(id: string, schoolId: string, correlationId?: string): Promise<any> {
        const folder = await this.folderRepo.findById(id, schoolId);
        if (!folder) {
            throw new NotFoundError(`Folder not found with ID: ${id}`);
        }
        return folder;
    }

    public async createFolder(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = QuestionValidator.validateFolder(payload);
        const created = await this.folderRepo.create(schoolId, validated);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_FOLDER_CREATE',
            entityName: 'assessment_folders',
            entityId: created.id,
            afterState: created,
            correlationId
        });

        await EventBus.publish('FolderCreated', { folderId: created.id, schoolId, userId });
        return created;
    }

    public async updateFolder(id: string, schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        await this.getFolderById(id, schoolId, correlationId);
        const validated = QuestionValidator.validateFolder(payload);
        
        const beforeState = await this.folderRepo.findById(id, schoolId);
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
        const beforeState = await this.getFolderById(id, schoolId, correlationId);
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

    public async bulkMoveQuestions(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<void> {
        const validated = QuestionValidator.validateBulkMove(payload);
        this.logInfo(`Bulk moving questions: [${validated.questionIds.join(', ')}] to folder: ${validated.targetFolderId}`, correlationId);

        if (validated.targetFolderId) {
            await this.getFolderById(validated.targetFolderId, schoolId, correlationId);
        }

        const { error } = await supabase
            .from('assessment_question_bank')
            .update({ folder_id: validated.targetFolderId, updated_at: new Date().toISOString() })
            .in('id', validated.questionIds)
            .eq('school_id', schoolId);

        if (error) throw error;

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_QUESTIONS_BULK_MOVE',
            entityName: 'assessment_question_bank',
            entityId: schoolId,
            afterState: { questionIds: validated.questionIds, targetFolderId: validated.targetFolderId },
            correlationId
        });

        for (const qId of validated.questionIds) {
            await EventBus.publish('QuestionMoved', { questionId: qId, targetFolderId: validated.targetFolderId, schoolId, userId });
        }
    }

    public async bulkCopyQuestions(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<void> {
        const validated = QuestionValidator.validateBulkCopy(payload);
        this.logInfo(`Bulk copying questions: [${validated.questionIds.join(', ')}] to folder: ${validated.targetFolderId}`, correlationId);

        if (validated.targetFolderId) {
            await this.getFolderById(validated.targetFolderId, schoolId, correlationId);
        }

        for (const qId of validated.questionIds) {
            const original = await this.questionRepo.findQuestionById(qId, schoolId);
            if (!original) continue;

            const copyPayload = {
                ...original,
                id: undefined,
                folder_id: validated.targetFolderId,
                version: 1,
                status: 'DRAFT',
                created_at: undefined,
                updated_at: undefined,
                is_deleted: false,
                options: original.options?.map((o: any) => ({
                    option_text: o.option_text,
                    is_correct: o.is_correct
                })) || []
            };

            const copied = await this.questionRepo.createQuestion(schoolId, copyPayload);
            await EventBus.publish('QuestionCreated', { questionId: copied.id, schoolId, userId });
        }
    }

    public async getStatistics(schoolId: string, correlationId?: string): Promise<any> {
        const data = await this.folderRepo.getFolderStats(schoolId);
        
        // Summarize stats
        const total = data.length;
        const draft = data.filter(q => q.status === 'DRAFT').length;
        const underReview = data.filter(q => q.status === 'UNDER_REVIEW').length;
        const approved = data.filter(q => q.status === 'APPROVED').length;
        const published = data.filter(q => q.status === 'PUBLISHED').length;
        const archived = data.filter(q => q.status === 'ARCHIVED').length;

        const difficulty = {
            EASY: data.filter(q => q.difficulty === 'EASY').length,
            MEDIUM: data.filter(q => q.difficulty === 'MEDIUM').length,
            HARD: data.filter(q => q.difficulty === 'HARD').length,
        };

        return {
            totalQuestions: total,
            statusCounts: {
                DRAFT: draft,
                UNDER_REVIEW: underReview,
                APPROVED: approved,
                PUBLISHED: published,
                ARCHIVED: archived
            },
            difficultyDistribution: difficulty
        };
    }
}
export default QuestionFolderService;
