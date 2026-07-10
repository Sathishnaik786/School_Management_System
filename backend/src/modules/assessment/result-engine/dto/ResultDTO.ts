import { z } from 'zod';

export const createSessionSchema = z.object({
    academic_year_id: z.string().uuid('Academic Year must be a valid UUID'),
    term_id: z.string().uuid('Term must be a valid UUID')
});

export const calculateResultsSchema = z.object({
    session_id: z.string().uuid('Session ID must be a valid UUID')
});

export const transitionWorkflowSchema = z.object({
    target_status: z.enum(['DRAFT', 'CALCULATED', 'UNDER_VERIFICATION', 'APPROVED', 'PUBLISHED', 'LOCKED']),
    comments: z.string().optional().nullable()
});

export const publishResultsSchema = z.object({
    target_portal: z.enum(['STUDENT_PORTAL', 'PARENT_PORTAL', 'PUBLIC_WEBSITE', 'MOBILE_APP'])
});

export const promotionDecisionSchema = z.object({
    student_id: z.string().uuid(),
    academic_year_id: z.string().uuid(),
    decision: z.enum([
        'PASS', 'PROMOTED', 'PROMOTED WITH BACKLOG', 'COMPARTMENT', 'REPEAT', 
        'WITHHELD', 'MALPRACTICE', 'TRANSFERRED', 'INCOMPLETE'
    ]),
    remarks: z.string().optional().nullable()
});

export const signResultsSchema = z.object({
    principal_signature: z.string().optional().nullable(),
    coe_signature: z.string().optional().nullable(),
    director_signature: z.string().optional().nullable()
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type CalculateResultsDto = z.infer<typeof calculateResultsSchema>;
export type TransitionWorkflowDto = z.infer<typeof transitionWorkflowSchema>;
export type PublishResultsDto = z.infer<typeof publishResultsSchema>;
export type PromotionDecisionDto = z.infer<typeof promotionDecisionSchema>;
export type SignResultsDto = z.infer<typeof signResultsSchema>;
