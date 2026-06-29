import { OfferValidator } from './OfferValidator';
import { FeeValidator } from './FeeValidator';
import { PaymentValidator } from './PaymentValidator';
import { ReceiptValidator } from './ReceiptValidator';
import { ConfirmationValidator } from './ConfirmationValidator';
import { StudentProvisionValidator } from './StudentProvisionValidator';
import { EnrollmentValidator } from './EnrollmentValidator';

export class EnrollmentValidationCoordinator {
    constructor(
        private readonly offerVal: OfferValidator,
        private readonly feeVal: FeeValidator,
        private readonly paymentVal: PaymentValidator,
        private readonly receiptVal: ReceiptValidator,
        private readonly confirmationVal: ConfirmationValidator,
        private readonly provisionVal: StudentProvisionValidator,
        private readonly enrollmentVal: EnrollmentValidator
    ) {}

    /**
     * Executes sequential validation pipeline checks.
     */
    public async validatePreEnrollment(applicationId: string): Promise<void> {
        // Step 1: Offer accepted checks
        await this.offerVal.validate(applicationId);

        // Step 2: Fee assignments config checks
        await this.feeVal.validate(applicationId);

        // Step 3: Zero outstanding balance checks
        await this.paymentVal.validate(applicationId);

        // Step 4: Metadata receipts checks
        await this.receiptVal.validate(applicationId);

        // Step 5: Admission confirmation check
        await this.confirmationVal.validate(applicationId);
    }

    public async validateFullEnrollment(applicationId: string): Promise<void> {
        // Pre-checks
        await this.validatePreEnrollment(applicationId);

        // Step 6: ERP handovers completed jobs checks
        await this.provisionVal.validate(applicationId);

        // Step 7: Application status state checks
        await this.enrollmentVal.validate(applicationId);
    }
}
