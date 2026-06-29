import { OfferRepository } from '../../../repositories/evaluation/OfferRepository';
import { BusinessRuleError } from '../../../errors/BusinessRuleError';

export class OfferValidator {
    constructor(private readonly offerRepo: OfferRepository) {}

    public async validate(applicationId: string): Promise<void> {
        const offer = await this.offerRepo.findByApplicationId(applicationId);
        if (!offer) {
            throw new BusinessRuleError('Admission Offer Letter has not been generated for this application');
        }

        if (offer.status !== 'ACCEPTED') {
            throw new BusinessRuleError(`Admission Offer status is "${offer.status}". Must be ACCEPTED before proceeding.`);
        }
    }
}
