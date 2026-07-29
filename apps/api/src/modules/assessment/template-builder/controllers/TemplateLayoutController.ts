import { Request, Response } from 'express';
import { TemplateLayoutService } from '../services/TemplateLayoutService';
import { TemplatePreviewEngine } from '../services/TemplatePreviewEngine';

export class TemplateLayoutController {
    private static layoutService = new TemplateLayoutService();
    private static previewEngine = new TemplatePreviewEngine();

    public static async saveLayout(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Template ID
            const { layoutRules, header, footer, instructions } = req.body;

            if (layoutRules) await TemplateLayoutController.layoutService.saveLayoutRules(id, layoutRules);
            if (header) await TemplateLayoutController.layoutService.saveHeader(id, header);
            if (footer) await TemplateLayoutController.layoutService.saveFooter(id, footer);
            if (instructions !== undefined) await TemplateLayoutController.layoutService.saveInstructions(id, instructions);

            return res.status(200).json({ message: 'Template layout configurations updated.' });
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to update layout.' });
        }
    }

    public static async getPreview(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Template ID
            const { format } = req.query; // 'html', 'pdf', 'mobile'
            const schoolId = (req as any).context?.user?.school_id;
            if (!schoolId) return res.status(400).json({ error: 'School context could not be resolved.' });

            const preview = await TemplateLayoutController.previewEngine.generatePreview(id, String(format || 'html'), schoolId);
            return res.status(200).json(preview);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to render template preview.' });
        }
    }
}
export default TemplateLayoutController;
