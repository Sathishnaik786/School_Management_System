import { 
    createTemplateSchema, 
    updateTemplateSchema, 
    templateWorkflowSchema, 
    templateCloneSchema,
    CreateTemplateDto,
    UpdateTemplateDto,
    TemplateWorkflowDto,
    TemplateCloneDto
} from '../dto/template.dto';
import { ValidationError } from '../../../../modules/admission/errors/ValidationError';

export class TemplateValidator {
    public static validateCreate(payload: any): CreateTemplateDto {
        const res = createTemplateSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Template schema validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateUpdate(payload: any): UpdateTemplateDto {
        const res = updateTemplateSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Template update schema validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateWorkflow(payload: any): TemplateWorkflowDto {
        const res = templateWorkflowSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Template status transition validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateClone(payload: any): TemplateCloneDto {
        const res = templateCloneSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Template clone parameters validation failed', res.error.format() as any);
        }
        return res.data;
    }
}
export default TemplateValidator;
