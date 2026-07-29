import { BaseService } from '../../../admission/services/BaseService';
import { TemplateRepository } from '../repositories/template.repository';
import { BlueprintRepository } from '../../blueprint-builder/repositories/BlueprintRepository';

export interface ValidationReport {
    success: boolean;
    errors: string[];
    warnings: string[];
}

export class TemplateValidationService extends BaseService {
    private readonly repo = new TemplateRepository();
    private readonly bpRepo = new BlueprintRepository();

    public async validateTemplate(templateId: string, schoolId: string, correlationId?: string): Promise<ValidationReport> {
        this.logInfo(`Running verification pipeline on template: ${templateId}`, correlationId);

        const errors: string[] = [];
        const warnings: string[] = [];

        const template = await this.repo.findTemplateById(templateId, schoolId);
        if (!template) throw new Error('Template context not found.');

        // 1. Missing Sections check
        if (!template.sections || template.sections.length === 0) {
            errors.push('Section rule mismatch: At least one section layout structure is required.');
        }

        // 2. Blueprint Compatibility check
        if (template.blueprint_id) {
            const blueprint = await this.bpRepo.findBlueprintById(template.blueprint_id, schoolId);
            if (blueprint) {
                // Verify Marks match
                let calculatedMarks = 0;
                for (const sec of template.sections || []) {
                    calculatedMarks += Number(sec.total_questions) * Number(sec.points_per_question);
                }

                if (Math.abs(calculatedMarks - Number(blueprint.total_marks)) > 0.01) {
                    errors.push(`Marks mismatch: Template sections total ${calculatedMarks} marks, but blueprint target is ${blueprint.total_marks} marks.`);
                }
            } else {
                warnings.push('Linked blueprint rules could not be loaded.');
            }
        } else {
            warnings.push('No blueprint linked to this rendering template.');
        }

        // 3. Header Completeness check
        const header = template.header;
        if (!header) {
            warnings.push('Header layout rules are not configured.');
        } else {
            const hasAnyHeader = Object.values(header).some(v => v === true);
            if (!hasAnyHeader) {
                warnings.push('Header builder: All institutional credentials and student metadata fields are disabled.');
            }
        }

        // 4. Footer Completeness check
        const footer = template.footer;
        if (!footer) {
            warnings.push('Footer layout rules are not configured.');
        } else {
            if (!footer.page_number) {
                warnings.push('Footer builder: Page numbering index is disabled.');
            }
        }

        return {
            success: errors.length === 0,
            errors,
            warnings
        };
    }
}
export default TemplateValidationService;
