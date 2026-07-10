import { BaseService } from '../../../admission/services/BaseService';
import { GenerationJobRepository } from '../repositories/GenerationJobRepository';
import { PaperGeneratorService } from './PaperGeneratorService';
import { supabase } from '../../../../config/supabase';
import { EventBus } from '../../../../workflows/event-bus.service';

export class GenerationJobService extends BaseService {
    private readonly jobRepo = new GenerationJobRepository();
    private readonly generator = new PaperGeneratorService();

    public async queueGenerationJob(
        schoolId: string,
        userId: string,
        payload: { blueprint_id: string; template_id: string; subject_id: string; name: string; description?: string },
        correlationId?: string
    ): Promise<any> {
        this.logInfo(`Queueing generation job for template: ${payload.template_id}`, correlationId);

        // 1. Check concurrent generation lock
        const { data: lock } = await supabase
            .from('assessment_generation_locks')
            .select('*')
            .eq('resource_id', payload.blueprint_id)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle();

        if (lock) {
            throw new Error('This blueprint is currently locked by another generation job.');
        }

        // Set lock
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes lock expiration
        
        await supabase
            .from('assessment_generation_locks')
            .insert({
                resource_type: 'BLUEPRINT',
                resource_id: payload.blueprint_id,
                locked_by: userId,
                expires_at: expiresAt.toISOString()
            });

        // 2. Create job in queue
        const job = await this.jobRepo.createJob(schoolId, payload.blueprint_id, payload.template_id, userId);

        // Process generation job asynchronously
        this.processJobAsync(job.id, schoolId, userId, payload, correlationId);

        return job;
    }

    private async processJobAsync(
        jobId: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<void> {
        const logs: string[] = ['Job started. Acquiring locks...'];
        try {
            await this.jobRepo.updateJobStatus(jobId, 'RUNNING', logs);

            logs.push('Resolving blueprints rules...');
            const paper = await this.generator.generatePaper(schoolId, userId, payload, correlationId);

            logs.push(`Successfully generated paper ID: ${paper.id}`);
            await this.jobRepo.updateJobStatus(jobId, 'COMPLETED', logs);

            // Release lock
            await supabase
                .from('assessment_generation_locks')
                .delete()
                .eq('resource_id', payload.blueprint_id);

            await EventBus.publish('PaperGenerated', { paperId: paper.id, schoolId, userId });
        } catch (error: any) {
            logs.push(`Error: ${error.message}`);
            await this.jobRepo.updateJobStatus(jobId, 'FAILED', logs, error.message);

            // Release lock on failure
            await supabase
                .from('assessment_generation_locks')
                .delete()
                .eq('resource_id', payload.blueprint_id);

            await EventBus.publish('PaperGenerationFailed', { schoolId, userId, error: error.message });
        }
    }
}
export default GenerationJobService;
