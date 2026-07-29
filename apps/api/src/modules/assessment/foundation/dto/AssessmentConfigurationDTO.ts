import { z } from 'zod';

export const assessmentConfigurationSchema = z.object({
    id: z.string().uuid().optional(),
    school_id: z.string().uuid(),
    max_upload_size_mb: z.number().int().min(1).max(100).default(10),
    autosave_interval_secs: z.number().int().min(5).max(60).default(10),
    default_heartbeat_secs: z.number().int().min(10).max(120).default(30),
    timezone: z.string().default('UTC'),
    grading_scale: z.array(z.any()).default([]),
    retention_telemetry_days: z.number().int().min(30).default(90),
    retention_attempts_years: z.number().int().min(1).default(7),
    
    // Extended fields stored in the settings JSONB field
    settings: z.object({
        assessmentTypes: z.array(z.string()).default(['QUIZ', 'EXAM', 'ASSIGNMENT']),
        durationMinutes: z.number().int().min(0).default(60),
        passingMarks: z.number().min(0).default(40),
        negativeMarking: z.boolean().default(false),
        negativeMarkingValue: z.number().min(0).default(0),
        autoSave: z.boolean().default(true),
        shuffleQuestions: z.boolean().default(false),
        shuffleOptions: z.boolean().default(false),
        browserLock: z.boolean().default(false),
        fullscreenEnforcement: z.boolean().default(false),
        resumePolicy: z.enum(['ALLOW_ANYTIME', 'ALLOW_WITH_PROCTOR_APPROVAL', 'DISALLOW']).default('ALLOW_ANYTIME'),
        attemptLimit: z.number().int().min(1).default(1),
        proctoring: z.object({
            enabled: z.boolean().default(false),
            webcam: z.boolean().default(false),
            microphone: z.boolean().default(false),
            screenShare: z.boolean().default(false),
            aiVerification: z.boolean().default(false),
        }).default({
            enabled: false,
            webcam: false,
            microphone: false,
            screenShare: false,
            aiVerification: false,
        }),
        publishingRules: z.object({
            autoPublish: z.boolean().default(false),
            releaseGradesImmediately: z.boolean().default(false),
        }).default({
            autoPublish: false,
            releaseGradesImmediately: false,
        }),
        notifications: z.object({
            emailOnScheduled: z.boolean().default(true),
            emailOnGraded: z.boolean().default(true),
        }).default({
            emailOnScheduled: true,
            emailOnGraded: true,
        }),
        lateSubmission: z.object({
            allowed: z.boolean().default(true),
            gracePeriodMinutes: z.number().int().min(0).default(15),
            penaltyPercentagePerMinute: z.number().min(0).default(0),
        }).default({
            allowed: true,
            gracePeriodMinutes: 15,
            penaltyPercentagePerMinute: 0,
        }),
        evaluationType: z.enum(['AUTO', 'MANUAL', 'HYBRID']).default('AUTO'),
        resultVisibility: z.enum(['IMMEDIATE', 'AFTER_PUBLISH', 'HIDDEN']).default('AFTER_PUBLISH'),
        version: z.number().int().min(1).default(1),
        status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    }).default({
        assessmentTypes: ['QUIZ', 'EXAM', 'ASSIGNMENT'],
        durationMinutes: 60,
        passingMarks: 40,
        negativeMarking: false,
        negativeMarkingValue: 0,
        autoSave: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        browserLock: false,
        fullscreenEnforcement: false,
        resumePolicy: 'ALLOW_ANYTIME',
        attemptLimit: 1,
        proctoring: { enabled: false, webcam: false, microphone: false, screenShare: false, aiVerification: false },
        publishingRules: { autoPublish: false, releaseGradesImmediately: false },
        notifications: { emailOnScheduled: true, emailOnGraded: true },
        lateSubmission: { allowed: true, gracePeriodMinutes: 15, penaltyPercentagePerMinute: 0 },
        evaluationType: 'AUTO',
        resultVisibility: 'AFTER_PUBLISH',
        version: 1,
        status: 'ACTIVE'
    }),
});

export type AssessmentConfigurationDTO = z.infer<typeof assessmentConfigurationSchema>;
