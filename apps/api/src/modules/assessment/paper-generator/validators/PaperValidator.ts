import { 
    createPaperSchema, 
    updatePaperSchema, 
    paperWorkflowSchema, 
    createGenerationJobSchema,
    exportPaperSchema,
    CreatePaperDto,
    UpdatePaperDto,
    PaperWorkflowDto,
    CreateGenerationJobDto,
    ExportPaperDto
} from '../dto/PaperDTO';
import { ValidationError } from '../../../admission/errors/ValidationError';

export class PaperValidator {
    public static validateCreate(payload: any): CreatePaperDto {
        const res = createPaperSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Paper creation schema check failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateUpdate(payload: any): UpdatePaperDto {
        const res = updatePaperSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Paper update schema check failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateWorkflow(payload: any): PaperWorkflowDto {
        const res = paperWorkflowSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Paper status workflow transition validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateGenerationJob(payload: any): CreateGenerationJobDto {
        const res = createGenerationJobSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Generation job payload check failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateExport(payload: any): ExportPaperDto {
        const res = exportPaperSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Export parameters check failed', res.error.format() as any);
        }
        return res.data;
    }
}
export default PaperValidator;
