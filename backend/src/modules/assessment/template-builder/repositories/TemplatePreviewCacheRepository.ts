import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class TemplatePreviewCacheRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_template_preview_cache');
    }

    public async findCache(templateId: string, format: string): Promise<any | null> {
        const { data, error } = await supabase
            .from(this.tableName)
            .select('*')
            .eq('template_id', templateId)
            .eq('format', format)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (error) throw error;
        return data;
    }

    public async saveCache(templateId: string, format: string, payload: any): Promise<void> {
        const { error: delError } = await supabase
            .from(this.tableName)
            .delete()
            .eq('template_id', templateId)
            .eq('format', format);

        if (delError) throw delError;

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2); // 2 hours expiration

        const { error } = await supabase
            .from(this.tableName)
            .insert({
                template_id: templateId,
                format,
                hash: payload.hash,
                html_path: payload.html_path || null,
                pdf_path: payload.pdf_path || null,
                thumbnail_path: payload.thumbnail_path || null,
                expires_at: expiresAt.toISOString()
            });

        if (error) throw error;
    }

    public async invalidateCache(templateId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('template_id', templateId);

        if (error) throw error;
    }
}
export default TemplatePreviewCacheRepository;
