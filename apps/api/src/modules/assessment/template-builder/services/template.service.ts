import { BaseService } from '../../../admission/services/BaseService';
import { TemplateRepository } from '../repositories/template.repository';
import { TemplateLayoutRepository } from '../repositories/TemplateLayoutRepository';
import { TemplateHeaderRepository } from '../repositories/TemplateHeaderRepository';
import { TemplateFooterRepository } from '../repositories/TemplateFooterRepository';
import { TemplateInstructionRepository } from '../repositories/TemplateInstructionRepository';
import { TemplatePreviewCacheRepository } from '../repositories/TemplatePreviewCacheRepository';
import { TemplateValidator } from '../validators/TemplateValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { NotFoundError } from '../../../admission/errors/NotFoundError';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';

export class TemplateService extends BaseService {
    private readonly repo = new TemplateRepository();
    private readonly layoutRepo = new TemplateLayoutRepository();
    private readonly headerRepo = new TemplateHeaderRepository();
    private readonly footerRepo = new TemplateFooterRepository();
    private readonly instRepo = new TemplateInstructionRepository();
    private readonly cacheRepo = new TemplatePreviewCacheRepository();
    private readonly auditService = new AuditService();

    public async listTemplates(
        schoolId: string,
        filters: { subjectId?: string; blueprintId?: string; page: number; limit: number },
        correlationId?: string
    ): Promise<{ data: any[]; totalCount: number }> {
        this.logInfo(`Listing templates for school: ${schoolId}`, correlationId);
        return this.repo.listTemplates(schoolId, filters);
    }

    public async getTemplateById(templateId: string, schoolId: string, correlationId?: string): Promise<any> {
        this.logInfo(`Fetching template detail: ${templateId}`, correlationId);
        const template = await this.repo.findTemplateById(templateId, schoolId);
        if (!template) {
            throw new NotFoundError(`Assessment template not found: ${templateId}`);
        }
        return template;
    }

    public async createTemplate(
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        const validated = TemplateValidator.validateCreate(payload);
        const { header, footer, layoutRules, sections, instructions, ...headerData } = validated;

        const template = await this.repo.createTemplate(schoolId, {
            ...headerData,
            created_by: userId
        });

        // Save layout configurations
        if (layoutRules) await this.layoutRepo.saveLayoutRules(template.id, layoutRules);
        if (header) await this.headerRepo.saveHeader(template.id, header);
        if (footer) await this.footerRepo.saveFooter(template.id, footer);
        if (instructions !== undefined) await this.instRepo.saveInstructions(template.id, instructions);

        // Sections
        if (sections && sections.length > 0) {
            await this.repo.updateTemplateSections(template.id, schoolId, sections);
        }

        const fullTemplate = await this.repo.findTemplateById(template.id, schoolId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_CREATE',
            entityName: 'assessment_templates',
            entityId: template.id,
            afterState: fullTemplate,
            correlationId
        });

        await EventBus.publish('TemplateCreated', { templateId: template.id, schoolId, userId });
        return fullTemplate;
    }

    public async updateTemplate(
        templateId: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<any> {
        const validated = TemplateValidator.validateUpdate(payload);
        const current = await this.getTemplateById(templateId, schoolId, correlationId);
        
        if (current.status === 'APPROVED' || current.status === 'PUBLISHED') {
            // Fork version if approved/published
            this.logInfo(`Forking version draft for template: ${templateId}`, correlationId);
            const forkedPayload = {
                ...current,
                ...validated,
                version: current.version + 1,
                status: 'DRAFT',
                sections: validated.sections || current.sections,
                layoutRules: validated.layoutRules || current.layoutRules,
                header: validated.header || current.header,
                footer: validated.footer || current.footer,
                instructions: validated.instructions !== undefined ? validated.instructions : current.instructions
            };
            delete forkedPayload.id;
            delete forkedPayload.created_at;
            delete forkedPayload.updated_at;

            const cloned = await this.createTemplate(schoolId, userId, forkedPayload, correlationId);
            await EventBus.publish('TemplateVersionCreated', { templateId: cloned.id, version: cloned.version, schoolId, userId });
            return cloned;
        }

        // Standard update
        const { header, footer, layoutRules, sections, instructions, ...headerData } = validated;

        if (Object.keys(headerData).length > 0) {
            await this.repo.updateTemplate(templateId, schoolId, headerData);
        }

        if (layoutRules) await this.layoutRepo.saveLayoutRules(templateId, layoutRules);
        if (header) await this.headerRepo.saveHeader(templateId, header);
        if (footer) await this.footerRepo.saveFooter(templateId, footer);
        if (instructions !== undefined) await this.instRepo.saveInstructions(templateId, instructions);

        if (sections) {
            await this.repo.updateTemplateSections(templateId, schoolId, sections);
        }

        // Invalidate cache on any modifications
        await this.cacheRepo.invalidateCache(templateId);

        const updated = await this.repo.findTemplateById(templateId, schoolId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_UPDATE',
            entityName: 'assessment_templates',
            entityId: templateId,
            beforeState: current,
            afterState: updated,
            correlationId
        });

        await EventBus.publish('TemplateUpdated', { templateId, schoolId, userId });
        return updated;
    }

    public async deleteTemplate(
        templateId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<void> {
        const current = await this.getTemplateById(templateId, schoolId, correlationId);
        await this.repo.deleteTemplate(templateId, schoolId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_DELETE',
            entityName: 'assessment_templates',
            entityId: templateId,
            beforeState: current,
            afterState: { ...current, is_deleted: true },
            correlationId
        });

        await EventBus.publish('TemplateArchived', { templateId, schoolId, userId });
    }

    public async cloneTemplate(
        templateId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<any> {
        const source = await this.getTemplateById(templateId, schoolId, correlationId);
        
        const clonePayload = {
            subject_id: source.subject_id,
            blueprint_id: source.blueprint_id,
            name: `Copy of ${source.name}`,
            description: source.description,
            status: 'DRAFT',
            version: 1,
            instructions: source.instructions,
            header: source.header,
            footer: source.footer,
            layoutRules: source.layoutRules,
            sections: source.sections
        };

        return this.createTemplate(schoolId, userId, clonePayload, correlationId);
    }
}
export default TemplateService;
