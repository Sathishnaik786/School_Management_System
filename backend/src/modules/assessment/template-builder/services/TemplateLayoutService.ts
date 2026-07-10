import { BaseService } from '../../../admission/services/BaseService';
import { TemplateLayoutRepository } from '../repositories/TemplateLayoutRepository';
import { TemplateHeaderRepository } from '../repositories/TemplateHeaderRepository';
import { TemplateFooterRepository } from '../repositories/TemplateFooterRepository';
import { TemplateInstructionRepository } from '../repositories/TemplateInstructionRepository';

export class TemplateLayoutService extends BaseService {
    private readonly layoutRepo = new TemplateLayoutRepository();
    private readonly headerRepo = new TemplateHeaderRepository();
    private readonly footerRepo = new TemplateFooterRepository();
    private readonly instRepo = new TemplateInstructionRepository();

    public async saveLayoutRules(templateId: string, rules: any[]): Promise<any[]> {
        return this.layoutRepo.saveLayoutRules(templateId, rules);
    }

    public async saveHeader(templateId: string, header: any): Promise<any> {
        return this.headerRepo.saveHeader(templateId, header);
    }

    public async saveFooter(templateId: string, footer: any): Promise<any> {
        return this.footerRepo.saveFooter(templateId, footer);
    }

    public async saveInstructions(templateId: string, instructionsText: string): Promise<any> {
        return this.instRepo.saveInstructions(templateId, instructionsText);
    }
}
export default TemplateLayoutService;
