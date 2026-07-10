import { z } from 'zod';

export const createSessionSchema = z.object({
    campus_id: z.string().uuid(),
    branch_id: z.string().uuid(),
    academic_year_id: z.string().uuid(),
    session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timetable_slot_id: z.string().uuid()
});

export const markAttendanceSchema = z.object({
    session_id: z.string().uuid(),
    student_id: z.string().uuid(),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'LEFT_EARLY', 'MEDICAL', 'ON_DUTY', 'SPORTS', 'FIELD_VISIT', 'ONLINE', 'HYBRID', 'EXEMPTED']),
    source: z.enum(['MANUAL', 'QR', 'RFID', 'BIOMETRIC', 'FACE_RECOGNITION', 'MOBILE_APP', 'NFC', 'API_IMPORT']).default('MANUAL')
});

export const transitionWorkflowSchema = z.object({
    session_id: z.string().uuid(),
    decision: z.enum(['PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED']),
    comments: z.string().optional()
});

export const submitLeaveSchema = z.object({
    student_id: z.string().uuid(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    leave_type: z.enum(['MEDICAL', 'SPORTS', 'DUTY', 'INTERNSHIP', 'CASUAL']),
    reason: z.string().min(1)
});

export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type MarkAttendanceDto = z.infer<typeof markAttendanceSchema>;
export type TransitionWorkflowDto = z.infer<typeof transitionWorkflowSchema>;
export type SubmitLeaveDto = z.infer<typeof submitLeaveSchema>;
