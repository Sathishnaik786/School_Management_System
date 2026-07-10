import { z } from 'zod';

export const templateHeaderSchema = z.object({
    institution_logo: z.boolean().default(true),
    school_name: z.boolean().default(true),
    exam_name: z.boolean().default(true),
    subject: z.boolean().default(true),
    class: z.boolean().default(true),
    academic_year: z.boolean().default(true),
    exam_date: z.boolean().default(true),
    duration: z.boolean().default(true),
    max_marks: z.boolean().default(true),
    student_name: z.boolean().default(true),
    hall_ticket: z.boolean().default(true),
    signature_block: z.boolean().default(true),
    qr_code: z.boolean().default(false),
    barcode: z.boolean().default(false)
});

export const templateFooterSchema = z.object({
    invigilator_signature: z.boolean().default(true),
    chief_superintendent: z.boolean().default(true),
    generated_timestamp: z.boolean().default(true),
    page_number: z.boolean().default(true),
    confidential_watermark: z.boolean().default(false),
    qr_verification: z.boolean().default(false),
    instructions_footer: z.boolean().default(true)
});

export const templateLayoutRuleSchema = z.object({
    property: z.string().min(1),
    value: z.string().min(1)
});

export const templateRuleSchema = z.object({
    filter_field: z.enum(['difficulty', 'bloom_level', 'tags', 'course_outcome', 'program_outcome']),
    filter_value: z.string().min(1, 'Filter value is required'),
    match_operator: z.enum(['eq', 'in', 'like']).default('eq')
});

export const templateSectionSchema = z.object({
    id: z.string().uuid().optional(),
    section_name: z.string().min(1, 'Section name is required'),
    description: z.string().optional().nullable(),
    points_per_question: z.number().min(0).default(1.00),
    negative_marks: z.number().min(0).default(0.00),
    total_questions: z.number().int().min(1),
    sort_order: z.number().int().min(1),
    rules: z.array(templateRuleSchema).default([])
});

export const createTemplateSchema = z.object({
    subject_id: z.string().uuid('Subject must be a valid UUID'),
    blueprint_id: z.string().uuid('Blueprint ID must be a valid UUID').optional().nullable(),
    name: z.string().min(1, 'Template name is required'),
    description: z.string().optional().nullable(),
    instructions: z.string().optional().default(''),
    header: templateHeaderSchema.optional(),
    footer: templateFooterSchema.optional(),
    layoutRules: z.array(templateLayoutRuleSchema).optional(),
    sections: z.array(templateSectionSchema).default([])
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const templateWorkflowSchema = z.object({
    target_status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']),
    transition_reason: z.string().optional()
});

export const templateCloneSchema = z.object({
    name: z.string().min(1)
});

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;
export type TemplateSectionDto = z.infer<typeof templateSectionSchema>;
export type TemplateHeaderDto = z.infer<typeof templateHeaderSchema>;
export type TemplateFooterDto = z.infer<typeof templateFooterSchema>;
export type TemplateWorkflowDto = z.infer<typeof templateWorkflowSchema>;
export type TemplateCloneDto = z.infer<typeof templateCloneSchema>;
