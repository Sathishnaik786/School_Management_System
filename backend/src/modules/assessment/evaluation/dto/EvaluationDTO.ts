import { z } from 'zod';

export const startEvaluationSchema = z.object({
    assignment_id: z.string().uuid('Assignment ID must be a valid UUID').optional(),
    published_paper_id: z.string().uuid('Published Paper ID must be a valid UUID'),
    attempt_id: z.string().uuid('Attempt ID must be a valid UUID')
});

export const evaluateQuestionSchema = z.object({
    question_snapshot_id: z.string().uuid('Question Snapshot ID must be a valid UUID'),
    awarded_marks: z.number().min(0, 'Awarded marks cannot be negative'),
    maximum_marks: z.number().gt(0, 'Maximum marks must be greater than zero'),
    remarks: z.string().optional().nullable(),
    annotations: z.array(
        z.object({
            type: z.enum(['Highlight', 'Rectangle', 'Circle', 'Arrow', 'Strike', 'Underline', 'Sticky Note', 'Text Comment', 'Drawing', 'Freehand Pen']),
            coordinates: z.record(z.any()),
            comment_text: z.string().optional().nullable()
        })
    ).optional()
});

export const moderateSchema = z.object({
    moderator_marks: z.number().min(0, 'Marks cannot be negative'),
    status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']),
    remarks: z.string().optional().nullable()
});

export const revaluationSchema = z.object({
    attempt_id: z.string().uuid(),
    student_id: z.string().uuid(),
    reason: z.string().min(1, 'Reason is required')
});

export const createRubricSchema = z.object({
    question_snapshot_id: z.string().uuid(),
    total_score: z.number().default(100),
    template_id: z.string().uuid().optional().nullable(),
    criteria: z.array(
        z.object({
            name: z.string().min(1, 'Name is required'),
            weight: z.number().gt(0),
            description: z.string().optional().nullable(),
            criteria_levels: z.array(z.any()).default([])
        })
    )
});

export const gradeCalculateSchema = z.object({
    attempt_id: z.string().uuid(),
    raw_marks: z.number().min(0),
    scaled_marks: z.number().min(0),
    grace_marks: z.number().min(0).default(0),
    grade_label: z.string().min(1),
    grade_point: z.number().min(0),
    credits: z.number().int().min(0)
});

export type StartEvaluationDto = z.infer<typeof startEvaluationSchema>;
export type EvaluateQuestionDto = z.infer<typeof evaluateQuestionSchema>;
export type ModerateDto = z.infer<typeof moderateSchema>;
export type RevaluationDto = z.infer<typeof revaluationSchema>;
export type CreateRubricDto = z.infer<typeof createRubricSchema>;
export type GradeCalculateDto = z.infer<typeof gradeCalculateSchema>;
