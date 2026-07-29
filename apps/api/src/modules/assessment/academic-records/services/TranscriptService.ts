import { BaseService } from '../../../admission/services/BaseService';
import { supabase } from '../../../../config/supabase';
import { createHash } from 'crypto';

export class TranscriptService extends BaseService {
    public async generateOfficialTranscript(
        studentId: string,
        userId: string,
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Compiling consolidated academic records transcript for student: ${studentId}`, correlationId);

        // Fetch student's record details
        const { data: record } = await supabase
            .from('student_academic_records')
            .select('*')
            .eq('student_id', studentId)
            .maybeSingle();

        if (!record) throw new Error('Permanent academic record profile not created.');

        const transcriptUrl = `/exports/transcript_${studentId}_signed.pdf`;
        const { data: transcript, error } = await supabase
            .from('official_transcripts')
            .insert({
                student_id: studentId,
                pdf_url: transcriptUrl,
                is_official: true
            })
            .select()
            .single();

        if (error) throw error;

        // Log COE signature hashes
        const sigHash = createHash('sha256').update(transcript.id + userId).digest('hex');
        await supabase
            .from('transcript_signatures')
            .insert({
                transcript_id: transcript.id,
                signatory_role: 'COE',
                signed_hash: sigHash
            });

        // Set version registry
        await supabase
            .from('transcript_versions')
            .insert({
                transcript_id: transcript.id,
                version_number: 1,
                snapshot_hash: sigHash
            });

        return transcript;
    }
}
export default TranscriptService;
