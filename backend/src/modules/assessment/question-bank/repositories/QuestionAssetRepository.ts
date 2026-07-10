import { supabase } from '../../../../config/supabase';
import { BaseRepository } from '../../../admission/repositories/BaseRepository';

export class QuestionAssetRepository extends BaseRepository<any> {
    constructor() {
        super('assessment_assets');
    }

    public async registerAsset(schoolId: string, asset: { file_name: string; file_path: string; mime_type: string; file_size: number }): Promise<any> {
        const { data, error } = await supabase
            .from(this.tableName)
            .insert({
                ...asset,
                school_id: schoolId
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    public async linkAssetToQuestion(questionId: string, assetId: string): Promise<void> {
        const { error } = await supabase
            .from('assessment_question_assets')
            .insert({
                question_id: questionId,
                asset_id: assetId
            });

        if (error) throw error;
    }

    public async unlinkAssetFromQuestion(questionId: string, assetId: string): Promise<void> {
        const { error } = await supabase
            .from('assessment_question_assets')
            .delete()
            .eq('question_id', questionId)
            .eq('asset_id', assetId);

        if (error) throw error;
    }

    public async findAssetsByQuestion(questionId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('assessment_question_assets')
            .select('asset_id')
            .eq('question_id', questionId);

        if (error) throw error;
        if (!data || data.length === 0) return [];

        const assetIds = data.map(item => item.asset_id);

        const { data: assets, error: assetsError } = await supabase
            .from(this.tableName)
            .select('*')
            .in('id', assetIds);

        if (assetsError) throw assetsError;
        return assets || [];
    }

    public async deleteAsset(assetId: string): Promise<void> {
        const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', assetId);

        if (error) throw error;
    }
}
export default QuestionAssetRepository;
