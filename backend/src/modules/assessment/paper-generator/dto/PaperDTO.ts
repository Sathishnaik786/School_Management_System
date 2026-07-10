import { z } from 'zod';

export const createPaperSchema = z.object({
    blueprint_id: z.string().uuid('Blueprint must be a valid UUID'),
    template_id: z.string().uuid('Template must be a valid UUID'),
    subject_id: z.string().uuid('Subject must be a valid UUID'),
    name: z.string().min(1, 'Paper name is required'),
    description: z.string().optional().nullable()
});

export const updatePaperSchema = createPaperSchema.partial();

export const paperWorkflowSchema = z.object({
    target_status: z.enum(['DRAFT', 'GENERATED', 'VALIDATED', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'CANCELLED']),
    transition_reason: z.string().optional()
});

export const createGenerationJobSchema = z.object({
    blueprint_id: z.string().uuid('Blueprint must be a valid UUID'),
    template_id: z.string().uuid('Template must be a valid UUID')
});

export const exportPaperSchema = z.object({
    format: z.enum(['PDF', 'DOCX', 'HTML', 'ZIP']),
    type: z.enum(['candidate', 'moderator', 'answer_key'])
});

export type CreatePaperDto = z.infer<typeof createPaperSchema>;
export type UpdatePaperDto = z.infer<typeof updatePaperSchema>;
export type PaperWorkflowDto = z.infer<typeof paperWorkflowSchema>;
export type CreateGenerationJobDto = z.infer<typeof createGenerationJobSchema>;
export type ExportPaperDto = z.infer<typeof exportPaperSchema>;
