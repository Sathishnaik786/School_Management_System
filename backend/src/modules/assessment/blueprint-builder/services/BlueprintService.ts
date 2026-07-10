import { BaseService } from '../../../admission/services/BaseService';
import { BlueprintRepository } from '../repositories/BlueprintRepository';
import { BlueprintValidator } from '../validators/BlueprintValidator';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { NotFoundError } from '../../../admission/errors/NotFoundError';
import { supabase } from '../../../../config/supabase';

export class BlueprintService extends BaseService {
    private readonly repo = new BlueprintRepository();
    private readonly audit = new AuditService();

    public async listBlueprints(schoolId: string, queryFilters: any, correlationId?: string): Promise<any> {
        const filters = BlueprintValidator.validateSearch(queryFilters);
        return this.repo.listBlueprints(schoolId, filters);
    }

    public async getBlueprintById(id: string, schoolId: string, correlationId?: string): Promise<any> {
        const blueprint = await this.repo.findBlueprintById(id, schoolId);
        if (!blueprint) throw new NotFoundError(`Blueprint not found with ID: ${id}`);
        return blueprint;
    }

    public async createBlueprint(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = BlueprintValidator.validateCreate(payload);
        const { sections, ...headerData } = validated;

        const header = await this.repo.createBlueprint(schoolId, {
            ...headerData,
            created_by: userId
        });

        // Insert sections and rules sequentially
        if (sections && sections.length > 0) {
            for (const sec of sections) {
                const { rules, id: dummyId, ...sectionData } = sec;
                const { data: newSec, error: insSecErr } = await supabase
                    .from('assessment_blueprint_sections')
                    .insert({
                        ...sectionData,
                        blueprint_id: header.id
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
                        .from('assessment_blueprint_rules')
                        .insert(rulesPayload);

                    if (insRulesErr) throw insRulesErr;
                }
            }
        }

        const fullBlueprint = await this.getBlueprintById(header.id, schoolId, correlationId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_BLUEPRINT_CREATE',
            entityName: 'assessment_blueprints',
            entityId: header.id,
            afterState: fullBlueprint,
            correlationId
        });

        await EventBus.publish('BlueprintCreated', { blueprintId: header.id, schoolId, userId });
        return fullBlueprint;
    }

    public async updateBlueprint(id: string, schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = BlueprintValidator.validateUpdate(payload);
        const current = await this.getBlueprintById(id, schoolId, correlationId);

        const { sections, ...headerData } = validated;

        // Fork if approved or published
        if (current.status === 'APPROVED' || current.status === 'PUBLISHED') {
            this.logInfo(`Forking new draft version for blueprint: ${id}`, correlationId);
            const forkedHeaderPayload = {
                ...current,
                ...headerData,
                version: current.version + 1,
                status: 'DRAFT',
                parent_id: current.parent_id || current.id
            };
            delete forkedHeaderPayload.id;
            delete forkedHeaderPayload.created_at;
            delete forkedHeaderPayload.updated_at;
            delete forkedHeaderPayload.sections;

            const forked = await this.repo.createBlueprint(schoolId, forkedHeaderPayload);

            const activeSections = sections || current.sections;
            for (const sec of activeSections) {
                const { rules, id: dummyId, ...sectionData } = sec;
                const { data: newSec, error: insSecErr } = await supabase
                    .from('assessment_blueprint_sections')
                    .insert({
                        ...sectionData,
                        blueprint_id: forked.id
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
                        .from('assessment_blueprint_rules')
                        .insert(rulesPayload);

                    if (insRulesErr) throw insRulesErr;
                }
            }

            const fullForked = await this.getBlueprintById(forked.id, schoolId, correlationId);

            await this.audit.logAudit({
                userId,
                action: 'ASSESSMENT_BLUEPRINT_FORK',
                entityName: 'assessment_blueprints',
                entityId: forked.id,
                beforeState: current,
                afterState: fullForked,
                correlationId
            });

            await EventBus.publish('BlueprintVersionCreated', { blueprintId: forked.id, version: forked.version, schoolId, userId });
            return fullForked;
        }

        // Standard update
        if (Object.keys(headerData).length > 0) {
            await this.repo.updateBlueprint(id, schoolId, headerData);
        }

        if (sections !== undefined) {
            // Delete old sections/rules
            const { error: delSecErr } = await supabase
                .from('assessment_blueprint_sections')
                .delete()
                .eq('blueprint_id', id);

            if (delSecErr) throw delSecErr;

            // Re-insert new sections & rules
            for (const sec of sections) {
                const { rules, id: dummyId, ...sectionData } = sec;
                const { data: newSec, error: insSecErr } = await supabase
                    .from('assessment_blueprint_sections')
                    .insert({
                        ...sectionData,
                        blueprint_id: id
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
                        .from('assessment_blueprint_rules')
                        .insert(rulesPayload);

                    if (insRulesErr) throw insRulesErr;
                }
            }
        }

        const updated = await this.getBlueprintById(id, schoolId, correlationId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_BLUEPRINT_UPDATE',
            entityName: 'assessment_blueprints',
            entityId: id,
            beforeState: current,
            afterState: updated,
            correlationId
        });

        await EventBus.publish('BlueprintUpdated', { blueprintId: id, schoolId, userId });
        return updated;
    }

    public async deleteBlueprint(id: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        const beforeState = await this.getBlueprintById(id, schoolId, correlationId);
        await this.repo.deleteBlueprint(id, schoolId);

        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_BLUEPRINT_DELETE',
            entityName: 'assessment_blueprints',
            entityId: id,
            beforeState,
            afterState: { ...beforeState, is_deleted: true },
            correlationId
        });
    }

    public async cloneBlueprint(id: string, schoolId: string, userId: string, payload: any, correlationId?: string): Promise<any> {
        const validated = BlueprintValidator.validateClone(payload);
        const original = await this.getBlueprintById(id, schoolId, correlationId);

        const clonePayload = {
            ...original,
            id: undefined,
            name: validated.name,
            status: 'DRAFT',
            version: 1,
            created_at: undefined,
            updated_at: undefined,
            sections: original.sections?.map((sec: any) => ({
                section_name: sec.section_name,
                description: sec.description,
                points_per_question: sec.points_per_question,
                negative_marks: sec.negative_marks,
                total_questions: sec.total_questions,
                sort_order: sec.sort_order,
                rules: sec.rules?.map((r: any) => ({
                    filter_field: r.filter_field,
                    filter_value: r.filter_value,
                    match_operator: r.match_operator
                })) || []
            })) || []
        };

        return this.createBlueprint(schoolId, userId, clonePayload, correlationId);
    }
}
export default BlueprintService;
