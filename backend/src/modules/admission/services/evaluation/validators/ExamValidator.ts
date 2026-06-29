import { ApplicationValidator } from './ApplicationValidator';
import { DocumentValidator } from './DocumentValidator';

export class ExamValidator {
    constructor(
        private readonly appVal: ApplicationValidator,
        private readonly docVal: DocumentValidator
    ) {}

    public async validate(applicationId: string): Promise<void> {
        // Enforce baseline application rules
        await this.appVal.validate(applicationId);
        // Enforce approved documents checks
        await this.docVal.validate(applicationId);
    }
}
