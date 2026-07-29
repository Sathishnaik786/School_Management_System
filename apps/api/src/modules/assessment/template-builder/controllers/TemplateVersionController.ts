import { Request, Response } from 'express';
import { TemplateRepository } from '../repositories/template.repository';
import { TemplateService } from '../services/template.service';
import { supabase } from '../../../../config/supabase';

export class TemplateVersionController {
    private static repo = new TemplateRepository();
    private static templateService = new TemplateService();

    public static async getHistory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Template ID
            const { data, error } = await supabase
                .from('assessment_template_versions')
                .select('*')
                .eq('template_id', id)
                .order('version', { ascending: false });

            if (error) throw error;
            return res.status(200).json(data || []);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to fetch version history.' });
        }
    }

    public static async restoreVersion(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params; // Template ID
            const { versionNumber } = req.body;
            const schoolId = (req as any).context?.user?.school_id;
            const userId = (req as any).context?.user?.id;
            if (!schoolId || !userId || !versionNumber) {
                return res.status(400).json({ error: 'Missing restorable details or target versionNumber.' });
            }

            // Find version snapshot
            const { data: verSnapshot, error: vError } = await supabase
                .from('assessment_template_versions')
                .select('*')
                .eq('template_id', id)
                .eq('version', versionNumber)
                .maybeSingle();

            if (vError) throw vError;
            if (!verSnapshot) return res.status(404).json({ error: `Snapshot version ${versionNumber} not found.` });

            const restored = await TemplateVersionController.templateService.updateTemplate(id, schoolId, userId, {
                ...verSnapshot.schema_snapshot,
                version: verSnapshot.version
            });

            return res.status(200).json(restored);
        } catch (error: any) {
            return res.status(500).json({ error: error.message || 'Failed to rollback version.' });
        }
    }
}
export default TemplateVersionController;
