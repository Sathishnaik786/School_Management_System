import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class TemplateRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_templates');
    }

    /**
     * Lists templates with optional subject filters and pagination.
     */
    public async listTemplates(
        schoolId: string,
        filters: { subjectId?: string; page: number; limit: number }
    ): Promise<{ data: any[]; totalCount: number }> {
        let query = supabase
            .from(this.tableName)
            .select('*', { count: 'exact' })
            .eq('school_id', schoolId)
            .eq('is_deleted', false);

        if (filters.subjectId) {
            query = query.eq('subject_id', filters.subjectId);
        }

        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;
        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, error, count } = await query;
        if (error) throw error;

        return {
            data: data || [],
            totalCount: count || 0
        };
    }

    /**
     * Resolves a template including sections and section rules.
     */
    public async findTemplateById(templateId: string, schoolId: string): Promise<any | null> {
        const { data: template, error: tError } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('id', templateId)
            .eq('school_id', schoolId)
            .eq('is_deleted', false)
            .maybeSingle();

        if (tError) throw tError;
        if (!template) return null;

        const { data: sections, error: sError } = await supabase
            .from('assessment_template_sections')
            .select('*')
            .eq('template_id', templateId)
            .order('sort_order', { ascending: true });

        if (sError) throw sError;

        const sectionIds = (sections || []).map(s => s.id);
        let rules: any[] = [];
        if (sectionIds.length > 0) {
            const { data: rulesData, error: rError } = await supabase
                .from('assessment_template_rules')
                .select('*')
                .in('section_id', sectionIds);

            if (rError) throw rError;
            rules = rulesData || [];
        }

        const enrichedSections = (sections || []).map(sec => ({
            ...sec,
            rules: rules.filter(r => r.section_id === sec.id)
        }));

        return {
            ...template,
            sections: enrichedSections
        };
    }

    /**
     * Creates a draft template header.
     */
    public async createTemplate(schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                ...payload,
                school_id: schoolId,
                status: 'DRAFT',
                version: 1
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Updates template details.
     */
    public async updateTemplate(templateId: string, schoolId: string, payload: any): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .update({
                ...payload,
                updated_at: new Date().toISOString()
            })
            .eq('id', templateId)
            .eq('school_id', schoolId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Soft deletes a template.
     */
    public async deleteTemplate(templateId: string, schoolId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .update({
                is_deleted: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', templateId)
            .eq('school_id', schoolId);

        if (error) throw error;
    }

    /**
     * Transactional replace of template sections and rules.
     */
    public async updateTemplateSections(templateId: string, schoolId: string, sections: any[]): Promise<any> {
        // Verify template belongs to school
        const { data: template, error: checkError } = await supabase
            .from(this.tableName)
            .select('id')
            .eq('id', templateId)
            .eq('school_id', schoolId)
            .maybeSingle();

        if (checkError) throw checkError;
        if (!template) throw new Error('Template not found or unauthorized.');

        // 1. Delete all current rules for sections belonging to this template
        const { data: existingSecs, error: getSecsErr } = await supabase
            .from('assessment_template_sections')
            .select('id')
            .eq('template_id', templateId);

        if (getSecsErr) throw getSecsErr;
        const existingSecIds = (existingSecs || []).map(s => s.id);
        if (existingSecIds.length > 0) {
            const { error: delRulesErr } = await supabase
                .from('assessment_template_rules')
                .delete()
                .in('section_id', existingSecIds);

            if (delRulesErr) throw delRulesErr;
        }

        // 2. Delete existing sections
        const { error: delSecsErr } = await supabase
            .from('assessment_template_sections')
            .delete()
            .eq('template_id', templateId);

        if (delSecsErr) throw delSecsErr;

        // 3. Insert new sections and rules sequentially
        for (const sec of sections) {
            const { rules, ...sectionData } = sec;
            const { data: newSec, error: insSecErr } = await supabase
                .from('assessment_template_sections')
                .insert({
                    ...sectionData,
                    template_id: templateId
                })
                .select()
                .single();

            if (insSecErr) throw insSecErr;

            if (rules && rules.length > 0) {
                const rulesPayload = rules.map((r: any) => ({
                    section_id: newSec.id,
                    filter_field: r.filter_field,
                    filter_value: r.filter_value,
                    match_operator: r.match_operator || 'eq'
                }));
                const { error: insRulesErr } = await supabase
                    .from('assessment_template_rules')
                    .insert(rulesPayload);

                if (insRulesErr) throw insRulesErr;
            }
        }

        return this.findTemplateById(templateId, schoolId);
    }

    /**
     * Publishes a template, setting its status to PUBLISHED and saving a snapshot.
     */
    public async publishTemplate(
        templateId: string,
        schoolId: string,
        version: number,
        schemaSnapshot: any
    ): Promise<any> {
        // 1. Save snapshot in assessment_template_versions
        const { error: snapError } = await supabase
            .from('assessment_template_versions')
            .insert({
                template_id: templateId,
                version,
                schema_snapshot: schemaSnapshot
            });

        if (snapError) throw snapError;

        // 2. Update status of template to PUBLISHED
        const { data, error: updateError } = await supabase
            .from(this.tableName)
            .update({
                status: 'PUBLISHED',
                updated_at: new Date().toISOString()
            })
            .eq('id', templateId)
            .eq('school_id', schoolId)
            .select()
            .single();

        if (updateError) throw updateError;
        return data;
    }
}
export default TemplateRepository;
