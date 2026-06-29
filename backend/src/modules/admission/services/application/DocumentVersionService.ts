import { DocumentVersionRepository } from '../../repositories/application/DocumentVersionRepository';
import { DocumentVersion } from '../../domain/DocumentVersion';

export class DocumentVersionService {
    constructor(private readonly versionRepo: DocumentVersionRepository) {}

    public async getVersions(documentId: string): Promise<DocumentVersion[]> {
        return this.versionRepo.findByDocumentId(documentId);
    }
}
