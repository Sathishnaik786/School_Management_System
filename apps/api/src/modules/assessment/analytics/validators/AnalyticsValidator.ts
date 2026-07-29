import { 
    createSnapshotSchema, 
    generateAccreditationSchema, 
    saveRiskScoreSchema, 
    saveLearningGapSchema,
    CreateSnapshotDto,
    GenerateAccreditationDto,
    SaveRiskScoreDto,
    SaveLearningGapDto
} from '../dto/AnalyticsDTO';
import { ValidationError } from '../../../admission/errors/ValidationError';

export class AnalyticsValidator {
    public static validateSnapshot(payload: any): CreateSnapshotDto {
        const res = createSnapshotSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Snapshot payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateAccreditation(payload: any): GenerateAccreditationDto {
        const res = generateAccreditationSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Accreditation payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateRiskScore(payload: any): SaveRiskScoreDto {
        const res = saveRiskScoreSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Risk score payload check failed', res.error.format() as any);
        return res.data;
    }

    public static validateLearningGap(payload: any): SaveLearningGapDto {
        const res = saveLearningGapSchema.safeParse(payload);
        if (!res.success) throw new ValidationError('Learning gap payload check failed', res.error.format() as any);
        return res.data;
    }
}
export default AnalyticsValidator;
