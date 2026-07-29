import { BaseService } from '../../../admission/services/BaseService';
import { AssessmentConfigurationRepository } from '../repositories/AssessmentConfigurationRepository';
import { AssessmentConfigurationValidator } from '../validators/AssessmentConfigurationValidator';
import { AssessmentConfigurationMapper } from '../mappers/AssessmentConfigurationMapper';
import { AssessmentConfigurationDTO } from '../dto/AssessmentConfigurationDTO';
import { AuditService } from '../../../admission/services/AuditService';
import { EventBus } from '../../../../workflows/event-bus.service';
import { NotFoundError } from '../../../admission/errors/NotFoundError';
import { cacheProvider } from './config.service';

const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

export class AssessmentConfigurationService extends BaseService {
    private readonly repo = new AssessmentConfigurationRepository();
    private readonly audit = new AuditService();

    private getCacheKey(schoolId: string): string {
        return `school_config:${schoolId}`;
    }

    public async listAllConfigs(schoolId: string, correlationId?: string): Promise<AssessmentConfigurationDTO[]> {
        this.logInfo(`Listing all configurations for school: ${schoolId}`, correlationId);
        const configs = await this.repo.findAll(schoolId);
        return configs.map(c => AssessmentConfigurationMapper.toDTO(c));
    }

    public async getConfigById(id: string, correlationId?: string): Promise<AssessmentConfigurationDTO> {
        this.logInfo(`Fetching configuration by id: ${id}`, correlationId);
        const config = await this.repo.findById(id);
        if (!config) {
            throw new NotFoundError(`Configuration not found with ID: ${id}`);
        }
        return AssessmentConfigurationMapper.toDTO(config);
    }

    public async getConfigBySchool(schoolId: string, correlationId?: string): Promise<AssessmentConfigurationDTO> {
        const cacheKey = this.getCacheKey(schoolId);
        const cached = cacheProvider.get(cacheKey);
        if (cached) {
            this.logInfo(`Cache hit for school configuration: ${schoolId}`, correlationId);
            return cached;
        }

        this.logInfo(`Cache miss. Fetching school configuration from database: ${schoolId}`, correlationId);
        const config = await this.repo.findConfigBySchool(schoolId);
        const dto = AssessmentConfigurationMapper.toDTO(config);
        cacheProvider.set(cacheKey, dto, CACHE_TTL_24H);
        return dto;
    }

    public async createConfig(schoolId: string, userId: string, payload: any, correlationId?: string): Promise<AssessmentConfigurationDTO> {
        const validated = AssessmentConfigurationValidator.validate({
            ...payload,
            school_id: schoolId
        });
        this.logInfo(`Creating new assessment configuration for school: ${schoolId}`, correlationId);

        const entity = AssessmentConfigurationMapper.toEntity(validated);
        const created = await this.repo.create(entity);
        const dto = AssessmentConfigurationMapper.toDTO(created);

        // Invalidate Cache
        cacheProvider.delete(this.getCacheKey(schoolId));

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_CONFIG_CREATE',
            entityName: 'assessment_configurations',
            entityId: dto.id!,
            afterState: dto,
            correlationId
        });

        // Publish Event
        await EventBus.publish('AssessmentConfigurationCreated', { configId: dto.id, schoolId, userId });

        return dto;
    }

    public async updateConfig(
        id: string,
        schoolId: string,
        userId: string,
        payload: any,
        correlationId?: string
    ): Promise<AssessmentConfigurationDTO> {
        // Fetch existing configuration
        const beforeState = await this.getConfigById(id, correlationId);
        
        // Validate partial inputs
        const validated = AssessmentConfigurationValidator.validatePartial({
            ...payload,
            school_id: schoolId
        });
        
        this.logInfo(`Updating assessment configuration: ${id}`, correlationId);

        const entityUpdates = AssessmentConfigurationMapper.toEntity({
            ...beforeState,
            ...validated,
            id
        } as AssessmentConfigurationDTO);

        const updated = await this.repo.update(id, entityUpdates);
        const dto = AssessmentConfigurationMapper.toDTO(updated);

        // Invalidate Cache
        cacheProvider.delete(this.getCacheKey(schoolId));

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_CONFIG_UPDATE',
            entityName: 'assessment_configurations',
            entityId: id,
            beforeState,
            afterState: dto,
            correlationId
        });

        // Publish Event
        await EventBus.publish('AssessmentConfigurationUpdated', { configId: id, schoolId, userId });

        return dto;
    }

    public async deleteConfig(id: string, schoolId: string, userId: string, correlationId?: string): Promise<void> {
        this.logInfo(`Deleting configuration: ${id}`, correlationId);
        const beforeState = await this.getConfigById(id, correlationId);

        await this.repo.delete(id);

        // Invalidate Cache
        cacheProvider.delete(this.getCacheKey(schoolId));

        // Audit Log
        await this.audit.logAudit({
            userId,
            action: 'ASSESSMENT_CONFIG_DELETE',
            entityName: 'assessment_configurations',
            entityId: id,
            beforeState,
            afterState: { id, status: 'DELETED' },
            correlationId
        });
    }

    public async cloneConfig(id: string, schoolId: string, userId: string, correlationId?: string): Promise<AssessmentConfigurationDTO> {
        this.logInfo(`Cloning configuration: ${id}`, correlationId);
        const target = await this.getConfigById(id, correlationId);

        const clonedPayload = {
            ...target,
            id: undefined,
            settings: {
                ...target.settings,
                version: (target.settings.version || 1) + 1,
            }
        };

        return this.createConfig(schoolId, userId, clonedPayload, correlationId);
    }

    public async resetConfig(id: string, schoolId: string, userId: string, correlationId?: string): Promise<AssessmentConfigurationDTO> {
        this.logInfo(`Resetting configuration: ${id} to defaults`, correlationId);
        const beforeState = await this.getConfigById(id, correlationId);

        // Empty settings triggers fallback schema defaults defined in Zod schema
        const resetPayload = {
            school_id: schoolId,
            max_upload_size_mb: 10,
            autosave_interval_secs: 10,
            default_heartbeat_secs: 30,
            timezone: 'UTC',
            grading_scale: [],
            retention_telemetry_days: 90,
            retention_attempts_years: 7,
            settings: undefined // triggers Zod defaults
        };

        return this.updateConfig(id, schoolId, userId, resetPayload, correlationId);
    }

    public validateConfig(payload: any): any {
        return AssessmentConfigurationValidator.validate(payload);
    }
}
