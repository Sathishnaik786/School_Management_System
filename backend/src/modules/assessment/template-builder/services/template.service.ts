import { BaseService } from '../../../admission/services/BaseService';
import { TemplateRepository } from '../repositories/template.repository';
import { createTemplateSchema, updateTemplateSchema, updateTemplateSectionsSchema, CreateTemplateDto, UpdateTemplateDto, UpdateTemplateSectionsDto } from '../dto/template.dto';
import { AuditService } from '../../../admission/services/AuditService';
import { ValidationError } from '../../../admission/errors/ValidationError';
import { NotFoundError } from '../../../admission/errors/NotFoundError';
import { BusinessRuleError } from '../../../admission/errors/BusinessRuleError';
import { supabase } from '../../../../config/supabase';

export class TemplateService extends BaseService {
    private readonly repo: TemplateRepository;
    private readonly auditService: AuditService;

    constructor() {
        super();
        this.repo = new TemplateRepository();
        this.auditService = new AuditService();
    }

    public async listTemplates(
        schoolId: string,
        filters: { subjectId?: string; page: number; limit: number },
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
        payload: CreateTemplateDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(createTemplateSchema, payload);
        const template = await this.repo.createTemplate(schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_CREATE',
            entityName: 'assessment_templates',
            entityId: template.id,
            afterState: template,
            correlationId
        });

        return template;
    }

    public async updateTemplate(
        templateId: string,
        schoolId: string,
        userId: string,
        payload: UpdateTemplateDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(updateTemplateSchema, payload);
        const current = await this.getTemplateById(templateId, schoolId, correlationId);
        
        if (current.status !== 'DRAFT') {
            throw new BusinessRuleError('Cannot modify templates that are already published.');
        }

        const template = await this.repo.updateTemplate(templateId, schoolId, validated);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_UPDATE',
            entityName: 'assessment_templates',
            entityId: templateId,
            beforeState: current,
            afterState: template,
            correlationId
        });

        return template;
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
    }

    /**
     * Updates sections and dynamic rules associated with a template.
     */
    public async updateTemplateSections(
        templateId: string,
        schoolId: string,
        userId: string,
        payload: UpdateTemplateSectionsDto,
        correlationId?: string
    ): Promise<any> {
        const validated = this.validate(updateTemplateSectionsSchema, payload);
        const current = await this.getTemplateById(templateId, schoolId, correlationId);

        if (current.status !== 'DRAFT') {
            throw new BusinessRuleError('Cannot modify sections of a published template.');
        }

        const updated = await this.repo.updateTemplateSections(templateId, schoolId, validated.sections);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_SECTIONS_UPDATE',
            entityName: 'assessment_templates',
            entityId: templateId,
            beforeState: current,
            afterState: updated,
            correlationId
        });

        return updated;
    }

    /**
     * Publishes a template, saving its immutable snapshot after verifying question rule counts.
     */
    public async publishTemplate(
        templateId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<any> {
        const template = await this.getTemplateById(templateId, schoolId, correlationId);

        if (template.status === 'PUBLISHED') {
            throw new BusinessRuleError('Template is already published.');
        }

        if (!template.sections || template.sections.length === 0) {
            throw new BusinessRuleError('Cannot publish template without any sections configured.');
        }

        // 1. Dynamic Rule Verification: Count available matched questions in Question Bank
        const warnings: string[] = [];
        for (const sec of template.sections) {
            let query = supabase
                .from('assessment_question_bank')
                .select('id', { count: 'exact', head: true })
                .eq('school_id', schoolId)
                .eq('subject_id', template.subject_id)
                .eq('status', 'APPROVED')
                .eq('is_deleted', false);

            // Apply section filters rules
            if (sec.rules && sec.rules.length > 0) {
                for (const rule of sec.rules) {
                    if (rule.filter_field === 'difficulty') {
                        query = query.eq('difficulty', rule.filter_value);
                    } else if (rule.filter_field === 'bloom_level') {
                        query = query.eq('bloom_level', rule.filter_value);
                    } else if (rule.filter_field === 'course_outcome') {
                        query = query.eq('course_outcome_code', rule.filter_value);
                    } else if (rule.filter_field === 'program_outcome') {
                        query = query.eq('program_outcome_code', rule.filter_value);
                    }
                }
            }

            const { count, error } = await query;
            if (error) throw error;

            const matchedCount = count || 0;
            if (matchedCount < sec.total_questions) {
                warnings.push(
                    `Section "${sec.section_name}" requires ${sec.total_questions} questions, but only ${matchedCount} are approved in the Question Bank.`
                );
            }
        }

        // If there are warnings, we log them but proceed (warnings are returned to client for review)
        if (warnings.length > 0) {
            this.logInfo(`Publish warning generated: ${warnings.join(' | ')}`, correlationId);
        }

        // 2. Perform publishing snapshot
        const publishedTemplate = await this.repo.publishTemplate(
            templateId,
            schoolId,
            template.version,
            { sections: template.sections } // Schema snapshot
        );

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_PUBLISH',
            entityName: 'assessment_templates',
            entityId: templateId,
            beforeState: template,
            afterState: { ...publishedTemplate, warnings },
            correlationId
        });

        return {
            ...publishedTemplate,
            warnings
        };
    }

    /**
     * Clones an existing template as a new version or draft.
     */
    public async cloneTemplate(
        templateId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<any> {
        const source = await this.getTemplateById(templateId, schoolId, correlationId);
        
        // Create cloned header
        const clonePayload = {
            subject_id: source.subject_id,
            name: `Copy of ${source.name}`,
            description: source.description,
            status: 'DRAFT',
            version: source.status === 'PUBLISHED' ? source.version + 1 : source.version
        };

        const clonedHeader = await this.repo.createTemplate(schoolId, clonePayload);

        // Copy sections and rules
        if (source.sections && source.sections.length > 0) {
            const sectionsPayload = source.sections.map((sec: any) => ({
                section_name: sec.section_name,
                description: sec.description,
                points_per_question: sec.points_per_question,
                negative_marks: sec.negative_marks,
                total_questions: sec.total_questions,
                sort_order: sec.sort_order,
                rules: sec.rules.map((r: any) => ({
                    filter_field: r.filter_field,
                    filter_value: r.filter_value,
                    match_operator: r.match_operator
                }))
            }));
            await this.repo.updateTemplateSections(clonedHeader.id, schoolId, sectionsPayload);
        }

        const fullyCloned = await this.getTemplateById(clonedHeader.id, schoolId, correlationId);

        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_TEMPLATE_CLONE',
            entityName: 'assessment_templates',
            entityId: clonedHeader.id,
            beforeState: source,
            afterState: fullyCloned,
            correlationId
        });

        return fullyCloned;
    }
}
export default TemplateService;
