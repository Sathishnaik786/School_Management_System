import { BaseService } from '../../../admission/services/BaseService';
import { PaperRepository } from '../repositories/PaperRepository';
import { PublishedPaperRepository } from '../repositories/PublishedPaperRepository';
import { PublishedSectionRepository } from '../repositories/PublishedSectionRepository';
import { PublishedQuestionRepository } from '../repositories/PublishedQuestionRepository';
import { PaperPackageRepository } from '../repositories/PaperPackageRepository';
import { createHash } from 'crypto';

export class PaperPublishingService extends BaseService {
    private readonly paperRepo = new PaperRepository();
    private readonly pubRepo = new PublishedPaperRepository();
    private readonly pubSecRepo = new PublishedSectionRepository();
    private readonly pubQRepo = new PublishedQuestionRepository();
    private readonly packageRepo = new PaperPackageRepository();

    public async publishGeneratedPaper(
        paperId: string,
        schoolId: string,
        userId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Publishing generated paper: ${paperId} as immutable aggregate`, correlationId);

        // 1. Resolve paper detail
        const paper = await this.paperRepo.findPaperById(paperId, schoolId);
        if (!paper) throw new Error('Paper not found.');

        // 2. Generate paper integrity hash
        const componentsStr = JSON.stringify({
            blueprint_id: paper.blueprint_id,
            template_id: paper.template_id,
            sections: paper.sections
        });
        const paperHash = createHash('sha256').update(componentsStr).digest('hex');

        // 3. Save published paper master
        const publishedPaper = await this.pubRepo.publishPaper(schoolId, {
            generated_paper_id: paperId,
            blueprint_id: paper.blueprint_id,
            template_id: paper.template_id,
            name: paper.name,
            description: paper.description,
            total_marks: paper.total_marks,
            paper_hash: paperHash,
            published_by: userId
        });

        // 4. Save published sections and serialize questions snapshots
        for (const sec of paper.sections || []) {
            const savedSections = await this.pubSecRepo.savePublishedSections(publishedPaper.id, [sec]);
            const newSecId = savedSections[0].id;

            // Save question snapshots
            await this.pubQRepo.savePublishedQuestions(newSecId, sec.questions || []);
        }

        // 5. Generate package artifacts checksum
        const packageChecksum = createHash('sha256').update(publishedPaper.id + paperHash).digest('hex');
        await this.packageRepo.savePackage(publishedPaper.id, {
            candidate_pdf: `/exports/candidate_${publishedPaper.id}.pdf`,
            moderator_pdf: `/exports/moderator_${publishedPaper.id}.pdf`,
            answer_key_pdf: `/exports/key_${publishedPaper.id}.pdf`,
            checksum: packageChecksum,
            metadata: {
                algorithm: 'SHA256',
                version: 1
            }
        });

        return publishedPaper;
    }
}
export default PaperPublishingService;
