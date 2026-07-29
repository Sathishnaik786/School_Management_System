import { 
    questionCreateDTOSchema, 
    questionUpdateDTOSchema, 
    questionSearchDTOSchema, 
    questionFolderDTOSchema, 
    questionAssetDTOSchema, 
    questionWorkflowDTOSchema, 
    questionImportDTOSchema,
    questionBulkMoveSchema,
    questionBulkCopySchema,
    QuestionCreateDTO,
    QuestionUpdateDTO,
    QuestionSearchDTO,
    QuestionFolderDTO,
    QuestionAssetDTO,
    QuestionWorkflowDTO,
    QuestionImportDTO,
    QuestionBulkMoveDTO,
    QuestionBulkCopyDTO
} from '../dto/QuestionDTO';
import { ValidationError } from '../../../../modules/admission/errors/ValidationError';

export class QuestionValidator {
    public static validateCreate(payload: any): QuestionCreateDTO {
        const res = questionCreateDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Question create validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateUpdate(payload: any): QuestionUpdateDTO {
        const res = questionUpdateDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Question update validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateSearch(payload: any): QuestionSearchDTO {
        const res = questionSearchDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Question search parameters validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateFolder(payload: any): QuestionFolderDTO {
        const res = questionFolderDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Folder validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateAsset(payload: any): QuestionAssetDTO {
        const res = questionAssetDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Asset registration validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateWorkflow(payload: any): QuestionWorkflowDTO {
        const res = questionWorkflowDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Workflow payload validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateImport(payload: any): QuestionImportDTO {
        const res = questionImportDTOSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Question import parameters validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateBulkMove(payload: any): QuestionBulkMoveDTO {
        const res = questionBulkMoveSchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Bulk move validation failed', res.error.format() as any);
        }
        return res.data;
    }

    public static validateBulkCopy(payload: any): QuestionBulkCopyDTO {
        const res = questionBulkCopySchema.safeParse(payload);
        if (!res.success) {
            throw new ValidationError('Bulk copy validation failed', res.error.format() as any);
        }
        return res.data;
    }
}
export default QuestionValidator;
