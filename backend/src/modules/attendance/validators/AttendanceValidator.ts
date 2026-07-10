import { 
    createSessionSchema,
    markAttendanceSchema,
    transitionWorkflowSchema,
    submitLeaveSchema,
    CreateSessionDto,
    MarkAttendanceDto,
    TransitionWorkflowDto,
    SubmitLeaveDto
} from '../dto/AttendanceDTO';
import { ValidationError } from '../../admission/errors/ValidationError';

export class AttendanceValidator {
    public static validateCreateSession(payload: any): CreateSessionDto {
        const res = createSessionSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Create session payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateMarkAttendance(payload: any): MarkAttendanceDto {
        const res = markAttendanceSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Mark attendance payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateTransitionWorkflow(payload: any): TransitionWorkflowDto {
        const res = transitionWorkflowSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Workflow payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateSubmitLeave(payload: any): SubmitLeaveDto {
        const res = submitLeaveSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Leave payload check failed', res.error.format() as any);
        return res.data;
    }
}
export default AttendanceValidator;
