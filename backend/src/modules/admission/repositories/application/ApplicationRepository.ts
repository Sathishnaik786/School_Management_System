import { BaseRepository } from '../BaseRepository';
import { IApplicationRepository } from '../interfaces/IApplicationRepository';
import { AdmissionApplication, ApplicationStatus } from '../../domain/application/AdmissionApplication';
import { ApplicationProfile } from '../../domain/application/ApplicationProfile';
import { ApplicationDeclaration } from '../../domain/application/ApplicationDeclaration';
import { supabase } from '../../../../config/supabase';

export class ApplicationRepository extends BaseRepository<AdmissionApplication> implements IApplicationRepository {
    constructor() {
        super('admission_applications');
    }

    protected toDomain(row: any): AdmissionApplication {
        return new AdmissionApplication(
            row.id,
            row.school_id,
            row.academic_year_id,
            row.lead_id,
            row.status as ApplicationStatus,
            row.version,
            row.is_current,
            row.created_by,
            row.change_reason,
            row.submitted_at ? new Date(row.submitted_at) : null,
            new Date(row.created_at),
            new Date(row.updated_at),
            row.deleted_at ? new Date(row.deleted_at) : null
        );
    }

    public async findById(id: string): Promise<AdmissionApplication | null> {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data ? this.toDomain(data) : null;
    }

    public async findAllSubmitted(schoolId: string, academicYearId: string): Promise<AdmissionApplication[]> {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('school_id', schoolId)
            .eq('academic_year_id', academicYearId)
            .eq('status', 'SUBMITTED')
            .is('deleted_at', null);

        if (error) throw error;
        return (data || []).map(row => this.toDomain(row));
    }

    public async getGradeForApplication(applicationId: string): Promise<string> {
        const app = await this.findById(applicationId);
        if (!app || !app.leadId) {
            return 'Grade 1';
        }

        const { data: lead, error: leadErr } = await supabase
            .from('admission_leads')
            .select('enquiry_id')
            .eq('id', app.leadId)
            .maybeSingle();

        if (leadErr || !lead || !lead.enquiry_id) {
            return 'Grade 1';
        }

        const { data: enquiry, error: enquiryErr } = await supabase
            .from('admission_enquiries')
            .select('grade_applied_for')
            .eq('id', lead.enquiry_id)
            .maybeSingle();

        if (enquiryErr || !enquiry) {
            return 'Grade 1';
        }

        return enquiry.grade_applied_for;
    }

    public async findCurrentByLeadId(leadId: string): Promise<AdmissionApplication | null> {
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*')
            .eq('lead_id', leadId)
            .eq('is_current', true)
            .is('deleted_at', null)
            .maybeSingle();

        if (error) throw error;
        return data ? this.toDomain(data) : null;
    }

    public async findCurrentByDetails(studentName: string, dateOfBirth: Date, academicYearId: string): Promise<AdmissionApplication | null> {
        // Look up matching details in child profiles joined to active current applications
        const dobStr = dateOfBirth.toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('admission_applications')
            .select('*, application_profiles!inner(*)')
            .eq('academic_year_id', academicYearId)
            .eq('is_current', true)
            .is('deleted_at', null)
            .eq('application_profiles.date_of_birth', dobStr)
            .maybeSingle();

        if (error) throw error;
        return data ? this.toDomain(data) : null;
    }

    public async save(application: AdmissionApplication): Promise<void> {
        const payload = {
            id: application.id,
            school_id: application.schoolId,
            academic_year_id: application.academicYearId,
            lead_id: application.leadId,
            status: application.status,
            version: application.version,
            is_current: application.isCurrent,
            created_by: application.createdBy,
            change_reason: application.changeReason,
            submitted_at: application.submittedAt?.toISOString() || null,
            updated_at: application.updatedAt.toISOString(),
            deleted_at: application.deletedAt?.toISOString() || null
        };

        const { error } = await supabase
            .from('admission_applications')
            .upsert(payload);

        if (error) throw error;
    }

    public async findTimeline(applicationId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('application_workflow')
            .select('*')
            .eq('application_id', applicationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    public async findProfile(applicationId: string): Promise<ApplicationProfile | null> {
        const { data, error } = await supabase
            .from('application_profiles')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return new ApplicationProfile(
            data.id,
            data.application_id,
            new Date(data.date_of_birth),
            data.gender,
            data.blood_group,
            data.nationality,
            data.religion,
            data.category,
            data.aadhaar,
            data.photo_url,
            data.allergies,
            data.medical_conditions,
            data.emergency_notes,
            new Date(data.created_at),
            new Date(data.updated_at)
        );
    }

    public async saveProfile(profile: ApplicationProfile): Promise<void> {
        const payload = {
            id: profile.id,
            application_id: profile.applicationId,
            date_of_birth: profile.dateOfBirth.toISOString().split('T')[0],
            gender: profile.gender,
            blood_group: profile.bloodGroup,
            nationality: profile.nationality,
            religion: profile.religion,
            category: profile.category,
            aadhaar: profile.aadhaar,
            photo_url: profile.photoUrl,
            allergies: profile.allergies,
            medical_conditions: profile.medicalConditions,
            emergency_notes: profile.emergencyNotes,
            updated_at: profile.updatedAt.toISOString()
        };

        const { error } = await supabase
            .from('application_profiles')
            .upsert(payload);

        if (error) throw error;
    }

    public async findParents(applicationId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('application_parents')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data || null;
    }

    public async saveParents(applicationId: string, parentsData: any): Promise<void> {
        const payload = {
            application_id: applicationId,
            ...parentsData,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('application_parents')
            .upsert(payload);

        if (error) throw error;
    }

    public async findPreviousEducation(applicationId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('application_previous_education')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data || null;
    }

    public async savePreviousEducation(applicationId: string, eduData: any): Promise<void> {
        const payload = {
            application_id: applicationId,
            ...eduData,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('application_previous_education')
            .upsert(payload);

        if (error) throw error;
    }

    public async findPreferences(applicationId: string): Promise<any | null> {
        const { data, error } = await supabase
            .from('application_preferences')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        return data || null;
    }

    public async savePreferences(applicationId: string, prefData: any): Promise<void> {
        const payload = {
            application_id: applicationId,
            ...prefData,
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('application_preferences')
            .upsert(payload);

        if (error) throw error;
    }

    public async findDeclaration(applicationId: string): Promise<ApplicationDeclaration | null> {
        const { data, error } = await supabase
            .from('application_declarations')
            .select('*')
            .eq('application_id', applicationId)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return new ApplicationDeclaration(
            data.id,
            data.application_id,
            data.agreed_to_terms,
            data.parent_signature,
            data.date_signed ? new Date(data.date_signed) : null,
            new Date(data.created_at),
            new Date(data.updated_at)
        );
    }

    public async saveDeclaration(declaration: ApplicationDeclaration): Promise<void> {
        const payload = {
            id: declaration.id,
            application_id: declaration.applicationId,
            agreed_to_terms: declaration.agreedToTerms,
            parent_signature: declaration.parentSignature,
            date_signed: declaration.dateSigned ? declaration.dateSigned.toISOString().split('T')[0] : null,
            updated_at: declaration.updatedAt.toISOString()
        };

        const { error } = await supabase
            .from('application_declarations')
            .upsert(payload);

        if (error) throw error;
    }

    public async logWorkflow(
        applicationId: string, 
        action: string, 
        fromStatus: string | null, 
        toStatus: string, 
        performedBy: string | null, 
        notes?: string | null
    ): Promise<void> {
        const { error } = await supabase
            .from('application_workflow')
            .insert({
                application_id: applicationId,
                action,
                from_status: fromStatus,
                to_status: toStatus,
                performed_by: performedBy,
                notes
            });

        if (error) throw error;
    }

    public async getAgeRule(grade: string): Promise<{ min_age: number, max_age: number } | null> {
        const { data, error } = await supabase
            .from('admission_age_rules')
            .select('min_age, max_age')
            .eq('grade', grade)
            .maybeSingle();

        if (error) throw error;
        return data || null;
    }

    public async getWorkflowRule(fromStatus: string, toStatus: string, role: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('workflow_rules')
            .select('allowed')
            .eq('from_status', fromStatus)
            .eq('to_status', toStatus)
            .eq('role', role)
            .maybeSingle();

        if (error) throw error;
        return data ? data.allowed : false;
    }
}
