import { BaseService } from '../../../admission/services/BaseService';
import { PaperExportRepository } from '../repositories/PaperExportRepository';
import { EventBus } from '../../../../workflows/event-bus.service';

export class PaperExportService extends BaseService {
    private readonly exportRepo = new PaperExportRepository();

    public async triggerExport(
        paperId: string,
        format: 'PDF' | 'DOCX' | 'HTML' | 'ZIP',
        type: 'candidate' | 'moderator' | 'answer_key',
        userId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Triggering paper export for: ${paperId} in format: ${format}`, correlationId);

        // Simulation output filePath path mapping
        const mockFilePath = `/exports/paper_${paperId}_${type}.${format.toLowerCase()}`;

        const log = await this.exportRepo.saveExportLog(paperId, format, type, mockFilePath, userId);

        await EventBus.publish('PaperExported', { paperId, format, type, userId });

        return log;
    }
}
export default PaperExportService;
