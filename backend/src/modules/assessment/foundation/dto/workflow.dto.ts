import { z } from 'zod';

export const createWorkflowStepSchema = z.object({
    step_name: z.string().min(1, 'Step name is required'),
    role_required: z.string().min(1, 'Role required is required'),
    sort_order: z.number().int().min(1, 'Sort order must be greater than or equal to 1')
});

export const createWorkflowTransitionSchema = z.object({
    from_status: z.string().min(1, 'From status is required'),
    to_status: z.string().min(1, 'To status is required'),
    rule_condition: z.string().nullable().optional()
});

export const createWorkflowSchema = z.object({
    name: z.string().min(1, 'Workflow name is required'),
    description: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    steps: z.array(createWorkflowStepSchema).min(1, 'At least one step is required'),
    transitions: z.array(createWorkflowTransitionSchema).optional()
});

export const updateWorkflowSchema = z.object({
    name: z.string().min(1, 'Workflow name is required').optional(),
    description: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    steps: z.array(createWorkflowStepSchema).optional(),
    transitions: z.array(createWorkflowTransitionSchema).optional()
});

export type CreateWorkflowDto = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowDto = z.infer<typeof updateWorkflowSchema>;
