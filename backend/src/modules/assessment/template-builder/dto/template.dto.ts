import { z } from 'zod';

export const templateRuleSchema = z.object({
    filter_field: z.enum(['difficulty', 'bloom_level', 'tags', 'course_outcome', 'program_outcome']),
    filter_value: z.string().min(1, 'Filter value is required'),
    match_operator: z.enum(['eq', 'in', 'like']).default('eq')
});

export const templateSectionSchema = z.object({
    section_name: z.string().min(1, 'Section name is required'),
    description: z.string().optional().nullable(),
    points_per_question: z.number().min(0, 'Points cannot be negative').default(1.00),
    negative_marks: z.number().min(0, 'Negative marks cannot be negative').default(0.00),
    total_questions: z.number().int().min(1, 'Total questions must be at least 1'),
    sort_order: z.number().int().min(1, 'Sort order must be at least 1'),
    rules: z.array(templateRuleSchema).default([])
});

export const createTemplateSchema = z.object({
    subject_id: z.string().uuid('Subject must be a valid UUID'),
    name: z.string().min(1, 'Template name is required'),
    description: z.string().optional().nullable(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT')
});

export const updateTemplateSchema = createTemplateSchema.partial();

export const updateTemplateSectionsSchema = z.object({
    sections: z.array(templateSectionSchema).min(1, 'At least one section is required')
});

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;
export type TemplateSectionDto = z.infer<typeof templateSectionSchema>;
export type UpdateTemplateSectionsDto = z.infer<typeof updateTemplateSectionsSchema>;
