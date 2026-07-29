import { assessmentConfigurationSchema, AssessmentConfigurationDTO } from '../dto/AssessmentConfigurationDTO';
import { ValidationError } from '../../../../modules/admission/errors/ValidationError';

export class AssessmentConfigurationValidator {
    public static validate(payload: any): AssessmentConfigurationDTO {
        const result = assessmentConfigurationSchema.safeParse(payload);
        if (!result.success) {
            throw new ValidationError('Assessment configuration validation failed', result.error.format() as any);
        }
        return result.data;
    }

    public static validatePartial(payload: any): Partial<AssessmentConfigurationDTO> {
        const result = assessmentConfigurationSchema.partial().safeParse(payload);
        if (!result.success) {
            throw new ValidationError('Assessment configuration partial validation failed', result.error.format() as any);
        }
        return result.data;
    }
}
