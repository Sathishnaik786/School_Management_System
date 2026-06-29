import { ValidationError } from '../../../errors/ValidationError';

export class MimeValidator {
    public validate(mimeType: string, allowedMimes: string[]): void {
        if (!allowedMimes.includes(mimeType)) {
            throw new ValidationError(
                `Unsupported MIME Type: "${mimeType}". Allowed types: ${allowedMimes.join(', ')}`
            );
        }
    }
}
