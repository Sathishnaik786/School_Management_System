import { z } from 'zod';

export const createAcademicRecordSchema = z.object({
    student_id: z.string().uuid(),
    cgpa: z.number().min(0).max(10),
    total_credits: z.number().min(0)
});

export const createTranscriptRequestSchema = z.object({
    student_id: z.string().uuid(),
    status: z.enum(['Requested', 'Fee Pending', 'Payment Complete', 'Processing', 'Generated', 'Signed', 'Dispatched', 'Delivered']).default('Requested')
});

export const createStandingRuleSchema = z.object({
    min_gpa: z.number().min(0).max(10),
    max_backlogs: z.number().min(0),
    resulting_status: z.enum(['GOOD_STANDING', 'WARNING', 'PROBATION', 'SUSPENSION', 'HONORS'])
});

export const approveGraduationSchema = z.object({
    student_id: z.string().uuid(),
    status: z.enum(['ELIGIBLE', 'UNDER_REVIEW', 'CLEARANCE_PENDING', 'APPROVED', 'GRADUATED', 'CERTIFICATE_GENERATED', 'ARCHIVED'])
});

export type CreateAcademicRecordDto = z.infer<typeof createAcademicRecordSchema>;
export type CreateTranscriptRequestDto = z.infer<typeof createTranscriptRequestSchema>;
export type CreateStandingRuleDto = z.infer<typeof createStandingRuleSchema>;
export type ApproveGraduationDto = z.infer<typeof approveGraduationSchema>;
