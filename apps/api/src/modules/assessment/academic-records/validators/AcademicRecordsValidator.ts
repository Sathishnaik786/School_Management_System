import { 
    createAcademicRecordSchema,
    createTranscriptRequestSchema,
    createStandingRuleSchema,
    approveGraduationSchema,
    CreateAcademicRecordDto,
    CreateTranscriptRequestDto,
    CreateStandingRuleDto,
    ApproveGraduationDto
} from '../dto/AcademicRecordsDTO';
import { ValidationError } from '../../../admission/errors/ValidationError';

export class AcademicRecordsValidator {
    public static validateAcademicRecord(payload: any): CreateAcademicRecordDto {
        const res = createAcademicRecordSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Academic record payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateTranscriptRequest(payload: any): CreateTranscriptRequestDto {
        const res = createTranscriptRequestSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Transcript request payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateStandingRule(payload: any): CreateStandingRuleDto {
        const res = createStandingRuleSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Standing rule payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateGraduationApproval(payload: any): ApproveGraduationDto {
        const res = approveGraduationSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Graduation approval payload check failed', res.error.format() as any);
        return res.data;
    }
}
export default AcademicRecordsValidator;
