import { BaseService } from '../../../admission/services/BaseService';
import { QuestionAssetRepository } from '../repositories/QuestionAssetRepository';
import { QuestionValidator } from '../validators/QuestionValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';

export class QuestionAssetService extends BaseService {
    private readonly assetRepo = new QuestionAssetRepository();
    private readonly audit = new AuditService();

    public async uploadAsset(
        schoolId: string,
        userId: string,
        file: { file_name: string; file_path: string; mime_type: string; file_size: number },
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Registering asset attachment: ${file.file_name}`, correlationId);
        const validated = QuestionValidator.validateAsset(file);

        const asset = await this.assetRepo.registerAsset(schoolId, validated);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_ASSET_UPLOAD',
            entityName: 'assessment_assets',
            entityId: asset.id,
            afterState: asset,
            correlationId
        });

        await EventBus.publish('QuestionAssetUploaded', { assetId: asset.id, schoolId, userId });
        return asset;
    }

    public async linkAsset(questionId: string, assetId: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        this.logInfo(`Linking asset: ${assetId} to question: ${questionId}`, correlationId);
        await this.assetRepo.linkAssetToQuestion(questionId, assetId);
    }

    public async unlinkAsset(questionId: string, assetId: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        this.logInfo(`Unlinking asset: ${assetId} from question: ${questionId}`, correlationId);
        await this.assetRepo.unlinkAssetFromQuestion(questionId, assetId);
    }

    public async getQuestionAssets(questionId: string, correlationId?: string): Promise<any[]> {
        return this.assetRepo.findAssetsByQuestion(questionId);
    }

    public async deleteAsset(assetId: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        this.logInfo(`Deleting asset registry: ${assetId}`, correlationId);
        await this.assetRepo.deleteAsset(assetId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_ASSET_DELETE',
            entityName: 'assessment_assets',
            entityId: assetId,
            afterState: { id: assetId, status: 'DELETED' },
            correlationId
        });
    }
}
export default QuestionAssetService;
