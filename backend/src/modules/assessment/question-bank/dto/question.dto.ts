import { z } from 'zod';

export const questionOptionSchema = z.object({
    option_text: z.string().min(1, 'Option text is required'),
    is_correct: z.boolean().default(false)
});

export const createQuestionSchema = z.object({
    academic_year_id: z.string().uuid('Academic Year must be a valid UUID'),
    campus_id: z.string().uuid().optional().nullable(),
    program_id: z.string().uuid().optional().nullable(),
    department_id: z.string().uuid().optional().nullable(),
    folder_id: z.string().uuid().optional().nullable(),
    subject_id: z.string().uuid('Subject must be a valid UUID'),
    
    question_text: z.string().min(1, 'Question content text is required'),
    question_type: z.enum(['MCQ', 'TRUE_FALSE', 'SUBJECTIVE', 'MULTIPLE_SELECT', 'FILL_BLANKS', 'CODING', 'SQL']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
    bloom_level: z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE']).default('REMEMBER'),
    points: z.number().min(0, 'Points cannot be negative').default(1.00),
    negative_marks: z.number().min(0, 'Negative marks cannot be negative').default(0.00),
    explanation: z.string().optional().nullable(),
    
    course_outcome_code: z.string().optional().nullable(),
    program_outcome_code: z.string().optional().nullable(),
    lesson_id: z.string().uuid().optional().nullable(),
    
    taxonomy_tags: z.array(z.string()).default([]),
    status: z.enum(['DRAFT', 'UNDER_REVIEW', 'APPROVED', 'ARCHIVED']).default('DRAFT'),
    options: z.array(questionOptionSchema).default([])
});

export const updateQuestionSchema = createQuestionSchema.partial();

export type CreateQuestionDto = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionDto = z.infer<typeof updateQuestionSchema>;
