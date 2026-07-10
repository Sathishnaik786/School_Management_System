import { 
    blueprintCreateDTOSchema, 
    blueprintUpdateDTOSchema, 
    blueprintSearchDTOSchema, 
    blueprintWorkflowDTOSchema, 
    blueprintCloneDTOSchema,
    BlueprintCreateDTO,
    BlueprintUpdateDTO,
    BlueprintSearchDTO,
    BlueprintWorkflowDTO,
    BlueprintCloneDTO
} from '../dto/BlueprintDTO';
import { ValidationError } from '../../../../modules/admission/errors/ValidationError';

export class BlueprintValidator {
    public static validateCreate(payload: any): BlueprintCreateDTO {
        const res = blueprintCreateDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Blueprint creation schema validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateUpdate(payload: any): BlueprintUpdateDTO {
        const res = blueprintUpdateDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Blueprint update schema validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateSearch(payload: any): BlueprintSearchDTO {
        const res = blueprintSearchDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Blueprint search validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateWorkflow(payload: any): BlueprintWorkflowDTO {
        const res = blueprintWorkflowDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Blueprint workflow transition validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateClone(payload: any): BlueprintCloneDTO {
        const res = blueprintCloneDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Blueprint clone validation failed', res.error.format() as any);
        }
        return res.data;
    }
}
export default BlueprintValidator;
