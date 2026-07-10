import { 
    startEvaluationSchema, 
    evaluateQuestionSchema, 
    moderateSchema, 
    revaluationSchema, 
    createRubricSchema, 
    gradeCalculateSchema,
    StartEvaluationDto,
    EvaluateQuestionDto,
    ModerateDto,
    RevaluationDto,
    CreateRubricDto,
    GradeCalculateDto
} from '../dto/EvaluationDTO';
import { ValidationError } from '../../../admission/errors/ValidationError';

export class EvaluationValidator {
    public static validateStart(payload: any): StartEvaluationDto {
        const res = startEvaluationSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Start session check failed', res.error.format() as any);
        return res.data;
    }

    public static validateQuestionScore(payload: any): EvaluateQuestionDto {
        const res = evaluateQuestionSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Question evaluation input check failed', res.error.format() as any);
        return res.data;
    }

    public static validateModeration(payload: any): ModerateDto {
        const res = moderateSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Moderation resolution check failed', res.error.format() as any);
        return res.data;
    }

    public static validateRevaluation(payload: any): RevaluationDto {
        const res = revaluationSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Revaluation check failed', res.error.format() as any);
        return res.data;
    }

    public static validateRubric(payload: any): CreateRubricDto {
        const res = createRubricSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Rubric schema check failed', res.error.format() as any);
        return res.data;
    }

    public static validateGradeCalculation(payload: any): GradeCalculateDto {
        const res = gradeCalculateSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Grade calculation schema check failed', res.error.format() as any);
        return res.data;
    }
}
export default EvaluationValidator;
