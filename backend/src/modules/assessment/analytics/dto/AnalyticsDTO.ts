import { z } from 'zod';

export const createSnapshotSchema = z.object({
    snapshot_type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'SEMESTER', 'ACADEMIC_YEAR']),
    academic_year_id: z.string().uuid(),
    payload: z.record(z.any()).default({})
});

export const generateAccreditationSchema = z.object({
    report_type: z.enum(['NBA', 'NAAC', 'ABET', 'AACSB', 'NIRF']),
    attainment_metrics_json: z.record(z.any()).default({})
});

export const saveRiskScoreSchema = z.object({
    student_id: z.string().uuid(),
    risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    risk_score: z.number().min(0).max(1),
    factors: z.array(z.string()).default([])
});

export const saveLearningGapSchema = z.object({
    student_id: z.string().uuid(),
    subject_id: z.string().uuid(),
    gap_description: z.string().min(1),
    remedial_class_recommended: z.boolean().default(false)
});

export type CreateSnapshotDto = z.infer<typeof createSnapshotSchema>;
export type GenerateAccreditationDto = z.infer<typeof generateAccreditationSchema>;
export type SaveRiskScoreDto = z.infer<typeof saveRiskScoreSchema>;
export type SaveLearningGapDto = z.infer<typeof saveLearningGapSchema>;
