import { BaseService } from '../BaseService';
import { EnquiryRepository } from '../../repositories/crm/EnquiryRepository';
import { AdmissionEnquiry, EnquirySource } from '../../domain/AdmissionEnquiry';
import { createEnquirySchema } from '../../dto/create-enquiry.dto';
import { updateEnquirySchema } from '../../dto/update-enquiry.dto';
import { AdmissionCRMTransactionService } from './AdmissionCRMTransactionService';
import { AuditService } from '../AuditService';
import { ConflictError } from '../../errors/ConflictError';
import { NotFoundError } from '../../errors/NotFoundError';

export class EnquiryService extends BaseService {
    constructor(
        private readonly enquiryRepo: EnquiryRepository,
        private readonly transactionService: AdmissionCRMTransactionService,
        private readonly auditService: AuditService
    ) {
        super();
    }

    public async createEnquiry(schoolId: string, academicYearId: string, payload: any, correlationId?: string): Promise<AdmissionEnquiry> {
        const validated = this.validate(createEnquirySchema, payload);

        // Check for duplicates
        const dupCheck = await this.checkDuplicates({
            ...validated,
            academic_year_id: academicYearId
        });

        if (dupCheck.status === 'exact_match' && !payload.ignore_duplicate) {
            throw new ConflictError('Exact duplicate enquiry found', { matches: dupCheck.matches });
        }

        const id = crypto.randomUUID();
        const enquiry = new AdmissionEnquiry(
            id,
            schoolId,
            academicYearId,
            validated.student_name,
            validated.grade_applied_for,
            validated.parent_name,
            validated.parent_email,
            validated.parent_phone,
            validated.source as EnquirySource,
            'new',
            new Date(),
            new Date(),
            null,
            validated.date_of_birth ? new Date(validated.date_of_birth) : null,
            validated.gender || null,
            validated.current_school || null,
            validated.address || null,
            validated.remarks || null
        );

        const saved = await this.enquiryRepo.save(enquiry);

        await this.auditService.logAudit({
            userId: null,
            action: 'INSERT',
            entityName: 'admission_enquiries',
            entityId: saved.id,
            afterState: saved,
            correlationId
        });

        return saved;
    }

    public async updateEnquiry(id: string, payload: any, correlationId?: string): Promise<AdmissionEnquiry> {
        const validated = this.validate(updateEnquirySchema, payload);
        const existing = await this.enquiryRepo.findById(id);
        if (!existing) {
            throw new NotFoundError(`Enquiry with ID ${id} not found`);
        }

        const beforeState = { ...existing };

        // Map values
        const updated = new AdmissionEnquiry(
            existing.id,
            existing.schoolId,
            existing.academicYearId,
            validated.student_name !== undefined ? validated.student_name : existing.studentName,
            validated.grade_applied_for !== undefined ? validated.grade_applied_for : existing.gradeAppliedFor,
            validated.parent_name !== undefined ? validated.parent_name : existing.parentName,
            validated.parent_email !== undefined ? validated.parent_email : existing.parentEmail,
            validated.parent_phone !== undefined ? validated.parent_phone : existing.parentPhone,
            validated.source !== undefined ? validated.source as EnquirySource : existing.source,
            existing.status,
            existing.createdAt,
            new Date(),
            existing.deletedAt,
            validated.date_of_birth !== undefined ? (validated.date_of_birth ? new Date(validated.date_of_birth) : null) : existing.dateOfBirth,
            validated.gender !== undefined ? validated.gender : existing.gender,
            validated.current_school !== undefined ? validated.current_school : existing.currentSchool,
            validated.address !== undefined ? validated.address : existing.address,
            validated.remarks !== undefined ? validated.remarks : existing.remarks
        );

        const saved = await this.enquiryRepo.save(updated);

        await this.auditService.logAudit({
            userId: null,
            action: 'UPDATE',
            entityName: 'admission_enquiries',
            entityId: saved.id,
            beforeState,
            afterState: saved,
            correlationId
        });

        return saved;
    }

    public async getEnquiryById(id: string): Promise<AdmissionEnquiry> {
        const enquiry = await this.enquiryRepo.findById(id);
        if (!enquiry) {
            throw new NotFoundError(`Enquiry with ID ${id} not found`);
        }
        return enquiry;
    }

    public async deleteEnquiry(id: string, correlationId?: string): Promise<void> {
        const existing = await this.enquiryRepo.findById(id);
        if (!existing) {
            throw new NotFoundError(`Enquiry with ID ${id} not found`);
        }

        await this.enquiryRepo.softDelete(id);

        await this.auditService.logAudit({
            userId: null,
            action: 'DELETE',
            entityName: 'admission_enquiries',
            entityId: id,
            beforeState: existing,
            correlationId
        });
    }

    public async listEnquiries(
        schoolId: string,
        page: number,
        limit: number,
        filters?: Record<string, any>,
        search?: string,
        sortColumn?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<{ data: AdmissionEnquiry[]; total: number }> {
        return this.enquiryRepo.findAll(schoolId, page, limit, filters, search, sortColumn, sortOrder);
    }

    public async convertToLead(enquiryId: string, correlationId?: string): Promise<string> {
        const enquiry = await this.enquiryRepo.findById(enquiryId);
        if (!enquiry) {
            throw new NotFoundError(`Enquiry with ID ${enquiryId} not found`);
        }

        if (enquiry.status === 'converted') {
            throw new ConflictError('Enquiry is already converted to a lead');
        }

        const leadId = crypto.randomUUID();

        // Perform atomic transition via transactional query executor
        await this.transactionService.convertEnquiryToLead(enquiryId, leadId, correlationId);

        await this.auditService.logAudit({
            userId: null,
            action: 'CONVERT_ENQUIRY',
            entityName: 'admission_enquiries',
            entityId: enquiryId,
            afterState: { leadId },
            correlationId
        });

        return leadId;
    }

    public async checkDuplicates(enquiryData: any): Promise<{ status: 'no_duplicate' | 'potentials_found' | 'exact_match' | 'merge_candidate'; matches: any[] }> {
        const potentialMatches = await this.enquiryRepo.findPossibleDuplicates(
            enquiryData.student_name,
            enquiryData.parent_phone,
            enquiryData.parent_email,
            enquiryData.date_of_birth ? new Date(enquiryData.date_of_birth) : null,
            enquiryData.grade_applied_for,
            enquiryData.academic_year_id
        );

        if (potentialMatches.length === 0) {
            return { status: 'no_duplicate', matches: [] };
        }

        const matches = potentialMatches.map(m => {
            let matchType: 'exact_match' | 'potential_match' | 'merge_candidate' = 'potential_match';
            
            const dobMatches = m.dateOfBirth && enquiryData.date_of_birth && 
                new Date(m.dateOfBirth).toISOString().split('T')[0] === new Date(enquiryData.date_of_birth).toISOString().split('T')[0];
            
            const emailMatches = m.parentEmail === enquiryData.parent_email;
            const phoneMatches = m.parentPhone === enquiryData.parent_phone;
            const nameMatches = m.studentName.toLowerCase() === enquiryData.student_name.toLowerCase();

            if (nameMatches && phoneMatches && emailMatches && dobMatches) {
                matchType = 'exact_match';
            } else if (nameMatches && (phoneMatches || emailMatches)) {
                matchType = 'merge_candidate';
            }

            return { enquiry: m, matchType };
        });

        const hasExact = matches.some(m => m.matchType === 'exact_match');
        const hasMerge = matches.some(m => m.matchType === 'merge_candidate');

        let status: 'no_duplicate' | 'potentials_found' | 'exact_match' | 'merge_candidate' = 'potentials_found';
        if (hasExact) status = 'exact_match';
        else if (hasMerge) status = 'merge_candidate';

        return { status, matches };
    }
}
