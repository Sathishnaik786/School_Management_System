import { z } from 'zod';

export const updateAssessmentConfigSchema = z.object({
    max_upload_size_mb: z.number().int().min(1).max(100).optional(),
    autosave_interval_secs: z.number().int().min(5).max(60).optional(),
    default_heartbeat_secs: z.number().int().min(10).max(120).optional(),
    timezone: z.string().min(1).optional(),
    grading_scale: z.array(z.any()).optional(),
    retention_telemetry_days: z.number().int().min(30).optional(),
    retention_attempts_years: z.number().int().min(1).optional()
});

export type UpdateAssessmentConfigDto = z.infer<typeof updateAssessmentConfigSchema>;
