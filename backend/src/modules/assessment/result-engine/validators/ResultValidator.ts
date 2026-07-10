import { 
    createSessionSchema, 
    calculateResultsSchema, 
    transitionWorkflowSchema, 
    publishResultsSchema, 
    promotionDecisionSchema, 
    signResultsSchema,
    CreateSessionDto,
    CalculateResultsDto,
    TransitionWorkflowDto,
    PublishResultsDto,
    PromotionDecisionDto,
    SignResultsDto
} from '../dto/ResultDTO';
import { ValidationError } from '../../../admission/errors/ValidationError';

export class ResultValidator {
    public static validateCreateSession(payload: any): CreateSessionDto {
        const res = createSessionSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Create Session payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateCalculate(payload: any): CalculateResultsDto {
        const res = calculateResultsSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Calculate results payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateWorkflow(payload: any): TransitionWorkflowDto {
        const res = transitionWorkflowSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Workflow status checks failed', res.error.format() as any);
        return res.data;
    }

    public static validatePublish(payload: any): PublishResultsDto {
        const res = publishResultsSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Publish result targets failed', res.error.format() as any);
        return res.data;
    }

    public static validatePromotion(payload: any): PromotionDecisionDto {
        const res = promotionDecisionSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Promotion decision parameters failed', res.error.format() as any);
        return res.data;
    }

    public static validateSign(payload: any): SignResultsDto {
        const res = signResultsSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Digital signature parameters failed', res.error.format() as any);
        return res.data;
    }
}
export default ResultValidator;
