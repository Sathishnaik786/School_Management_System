import { z } from 'zod';

export const blueprintSectionRuleDTO = z.object({
    id: z.string().uuid().optional(),
    filter_field: z.string().min(1, 'Rule filter field cannot be empty'),
    filter_value: z.string().min(1, 'Rule filter value cannot be empty'),
    match_operator: z.string().default('eq')
});

export const blueprintSectionDTO = z.object({
    id: z.string().uuid().optional(),
    section_name: z.string().min(1, 'Section name cannot be empty'),
    description: z.string().optional().nullable(),
    points_per_question: z.number().min(0, 'Points per question must be positive'),
    negative_marks: z.number().min(0, 'Negative penalty must be positive').default(0),
    total_questions: z.number().int().min(1, 'Questions count must be greater than 0'),
    sort_order: z.number().int().min(1),
    rules: z.array(blueprintSectionRuleDTO).default([])
});

export const blueprintCreateDTOSchema = z.object({
    subject_id: z.string().uuid('Subject classification ID is required'),
    name: z.string().min(1, 'Blueprint name cannot be empty'),
    description: z.string().optional().nullable(),
    total_marks: z.number().min(1, 'Total marks must be positive').default(100.00),
    difficulty_distribution: z.record(z.number()).default({}),
    bloom_distribution: z.record(z.number()).default({}),
    outcome_mapping: z.record(z.string()).default({}),
    sections: z.array(blueprintSectionDTO).default([])
});

export const blueprintUpdateDTOSchema = blueprintCreateDTOSchema.partial();

export const blueprintSearchDTOSchema = z.object({
    subjectId: z.string().uuid().optional(),
    status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
});

export const blueprintWorkflowDTOSchema = z.object({
    workflow_definition_id: z.string().uuid().optional().nullable(),
    target_status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']),
    transition_reason: z.string().optional()
});

export const blueprintVersionDTOSchema = z.object({
    version: z.number().int().min(1)
});

export const blueprintCloneDTOSchema = z.object({
    name: z.string().min(1, 'Clone name cannot be empty')
});

export type BlueprintCreateDTO = z.infer<typeof blueprintCreateDTOSchema>;
export type BlueprintUpdateDTO = z.infer<typeof blueprintUpdateDTOSchema>;
export type BlueprintSearchDTO = z.infer<typeof blueprintSearchDTOSchema>;
export type BlueprintWorkflowDTO = z.infer<typeof blueprintWorkflowDTOSchema>;
export type BlueprintVersionDTO = z.infer<typeof blueprintVersionDTOSchema>;
export type BlueprintCloneDTO = z.infer<typeof blueprintCloneDTOSchema>;
export type BlueprintSectionDTO = z.infer<typeof blueprintSectionDTO>;
export type BlueprintSectionRuleDTO = z.infer<typeof blueprintSectionRuleDTO>;
