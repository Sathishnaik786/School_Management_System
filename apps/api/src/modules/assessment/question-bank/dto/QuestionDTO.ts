import { z } from 'zod';

export const questionOptionDTO = z.object({
    id: z.string().uuid().optional(),
    option_text: z.string().min(1, 'Option text cannot be empty'),
    is_correct: z.boolean().default(false)
});

export const questionCreateDTOSchema = z.object({
    academic_year_id: z.string().uuid('Academic Year is required'),
    campus_id: z.string().uuid().optional().nullable(),
    program_id: z.string().uuid().optional().nullable(),
    department_id: z.string().uuid().optional().nullable(),
    folder_id: z.string().uuid().optional().nullable(),
    subject_id: z.string().uuid('Subject ID is required'),
    
    question_text: z.string().min(1, 'Question text cannot be empty'),
    question_type: z.string().min(1, 'Question type is required'),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
    bloom_level: z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE']).default('REMEMBER'),
    points: z.number().min(0).default(1.0),
    negative_marks: z.number().min(0).default(0.0),
    explanation: z.string().optional().nullable(),
    
    course_outcome_code: z.string().optional().nullable(),
    program_outcome_code: z.string().optional().nullable(),
    lesson_id: z.string().uuid().optional().nullable(),
    
    taxonomy_tags: z.array(z.string()).default([]),
    options: z.array(questionOptionDTO).default([])
});

export const questionUpdateDTOSchema = questionCreateDTOSchema.partial();

export const questionSearchDTOSchema = z.object({
    folderId: z.string().uuid().optional().nullable(),
    subjectId: z.string().uuid().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    bloomLevel: z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE']).optional(),
    status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']).optional(),
    questionType: z.string().optional(),
    creatorId: z.string().uuid().optional(),
    language: z.string().optional(),
    search: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.string().default('created_at'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
});

export const questionFolderDTOSchema = z.object({
    name: z.string().min(1, 'Folder name cannot be empty'),
    parent_id: z.string().uuid().optional().nullable()
});

export const questionAssetDTOSchema = z.object({
    file_name: z.string().min(1),
    file_path: z.string().min(1),
    mime_type: z.string().min(1),
    file_size: z.number().int().min(1)
});

export const questionWorkflowDTOSchema = z.object({
    workflow_definition_id: z.string().uuid('Workflow definition ID is required'),
    target_status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED']),
    transition_reason: z.string().optional()
});

export const questionVersionDTOSchema = z.object({
    version: z.number().int().min(1),
    description: z.string().optional()
});

export const questionImportDTOSchema = z.object({
    academicYearId: z.string().uuid(),
    subjectId: z.string().uuid(),
    folderId: z.string().uuid().optional().nullable(),
    csv: z.string().min(1, 'CSV content is required')
});

export const questionBulkMoveSchema = z.object({
    questionIds: z.array(z.string().uuid()).min(1, 'At least one question is required'),
    targetFolderId: z.string().uuid().nullable()
});

export const questionBulkCopySchema = z.object({
    questionIds: z.array(z.string().uuid()).min(1, 'At least one question is required'),
    targetFolderId: z.string().uuid().nullable()
});

export type QuestionCreateDTO = z.infer<typeof questionCreateDTOSchema>;
export type QuestionUpdateDTO = z.infer<typeof questionUpdateDTOSchema>;
export type QuestionSearchDTO = z.infer<typeof questionSearchDTOSchema>;
export type QuestionFolderDTO = z.infer<typeof questionFolderDTOSchema>;
export type QuestionAssetDTO = z.infer<typeof questionAssetDTOSchema>;
export type QuestionWorkflowDTO = z.infer<typeof questionWorkflowDTOSchema>;
export type QuestionVersionDTO = z.infer<typeof questionVersionDTOSchema>;
export type QuestionImportDTO = z.infer<typeof questionImportDTOSchema>;
export type QuestionBulkMoveDTO = z.infer<typeof questionBulkMoveSchema>;
export type QuestionBulkCopyDTO = z.infer<typeof questionBulkCopySchema>;
export type QuestionOptionDTO = z.infer<typeof questionOptionDTO>;
