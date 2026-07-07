import { supabase } from '../../../config/supabase';
import { FeeStructureRepository } from '../repositories/FeeStructureRepository';
import { FeePreviewResponseDto } from '../dto/FeePreviewDto';
import { ApplicantNotFoundException, ClassMappingException, StructureNotFoundException } from '../errors/FinanceExceptions';

export class FeeStructureService {
    /**
     * Generates a preview of the fee structure for a given application ID.
     */
    public static async getFeePreview(applicationId: string): Promise<FeePreviewResponseDto> {
        // 1. Fetch applicant info from admissions table
        const { data: app, error: appErr } = await supabase
            .from('admissions')
            .select('school_id, academic_year_id, grade_applied_for')
            .eq('id', applicationId)
            .single();

        if (appErr || !app) {
            throw new ApplicantNotFoundException(`Applicant application not found: ${applicationId}`);
        }

        // 2. Fetch class ID matching grade_applied_for
        const { data: cls, error: clsErr } = await supabase
            .from('classes')
            .select('id')
            .eq('school_id', app.school_id)
            .eq('academic_year_id', app.academic_year_id)
            .ilike('name', app.grade_applied_for)
            .limit(1);

        if (clsErr || !cls || cls.length === 0) {
            throw new ClassMappingException(`No active class found mapping to grade "${app.grade_applied_for}" for school and academic year.`);
        }

        const classId = cls[0].id;
        const todayStr = new Date().toISOString().split('T')[0];

        // 3. Retrieve structure aggregate from repository
        const aggregate = await FeeStructureRepository.getStructureAggregate({
            classId,
            academicYearId: app.academic_year_id,
            date: todayStr
        });

        if (!aggregate) {
            throw new StructureNotFoundException(`No active fee structure configured for class matching "${app.grade_applied_for}" in this academic year.`);
        }

        // 4. Resolve legacy structure ID for backward compatibility mapping on client side
        let legacyStructureId: string | null = null;
        try {
            const { data: legStruct } = await supabase
                .from('admission_fee_structures')
                .select('id')
                .eq('school_id', app.school_id)
                .eq('academic_year_id', app.academic_year_id)
                .eq('grade', app.grade_applied_for)
                .limit(1)
                .maybeSingle();

            if (legStruct) {
                legacyStructureId = legStruct.id;
            }
        } catch (err) {
            console.warn('[FeeStructureService] Non-blocking warning resolving legacy structure mapping:', err);
        }

        const totalAmount = aggregate.components.reduce((sum, c) => sum + Number(c.amount), 0);

        // 5. Construct & return DTO response
        return {
            applicationId,
            classId,
            academicYearId: app.academic_year_id,
            legacyStructureId,
            structure: {
                id: aggregate.structure.id,
                name: aggregate.structure.name,
                version: aggregate.structure.version,
                effectiveFrom: aggregate.structure.effective_from,
                effectiveTo: aggregate.structure.effective_to,
                academicYearId: aggregate.structure.academic_year_id
            },
            components: aggregate.components.map(c => ({
                id: c.id,
                name: c.name,
                category: c.category,
                amount: Number(c.amount),
                isMandatory: c.is_mandatory
            })),
            installments: aggregate.installments.map(i => ({
                id: i.id,
                term: i.term,
                dueDate: i.due_date,
                percentage: i.percentage ? Number(i.percentage) : null,
                fixedAmount: i.fixed_amount ? Number(i.fixed_amount) : null
            })),
            totalAmount,
            currency: 'INR'
        };
    }
}
