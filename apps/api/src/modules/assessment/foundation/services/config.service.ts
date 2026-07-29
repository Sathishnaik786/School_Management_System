import { BaseService } from '../../../admission/services/BaseService';
import { FoundationRepository } from '../repositories/foundation.repository';
import { updateAssessmentConfigSchema, UpdateAssessmentConfigDto } from '../dto/config.dto';
import { ValidationError } from '../../../admission/errors/ValidationError';
import { AuditService } from '../../../admission/services/AuditService';

// Simulating Redis caching via local in-memory store with TTL
class InMemoryCache {
    private store = new Map<string, { value: any; expiresAt: number }>();

    public get(key: string): any | null {
        const item = this.store.get(key);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return item.value;
    }

    public set(key: string, value: any, ttlMs: number): void {
        this.store.set(key, {
            value,
            expiresAt: Date.now() + ttlMs
        });
    }

    public delete(key: string): void {
        this.store.delete(key);
    }
}

export const cacheProvider = new InMemoryCache();
const CACHE_TTL_24H = 24 * 60 * 60 * 1000;

export class ConfigService extends BaseService {
    private readonly repo: FoundationRepository;
    private readonly auditService: AuditService;

    constructor() {
        super();
        this.repo = new FoundationRepository();
        this.auditService = new AuditService();
    }

    private getCacheKey(schoolId: string): string {
        return `school_config:${schoolId}`;
    }

    /**
     * Retrieves school configuration, checking memory cache first.
     */
    public async getConfig(schoolId: string, correlationId?: string): Promise<any> {
        const cacheKey = this.getCacheKey(schoolId);
        const cached = cacheProvider.get(cacheKey);
        if (cached) {
            this.logInfo(`Cache hit for school configuration: ${schoolId}`, correlationId);
            return cached;
        }

        this.logInfo(`Cache miss. Fetching school configuration from database: ${schoolId}`, correlationId);
        const config = await this.repo.findConfigBySchool(schoolId);
        cacheProvider.set(cacheKey, config, CACHE_TTL_24H);
        return config;
    }

    /**
     * Updates school configuration, invalidating cache and logging audit trail.
     */
    public async updateConfig(
        schoolId: string,
        userId: string,
        payload: UpdateAssessmentConfigDto,
        correlationId?: string
    ): Promise<any> {
        // Validate payload using Zod DTO
        const validated = this.validate(updateAssessmentConfigSchema, payload);

        // Fetch current state for audit comparison
        const beforeState = await this.getConfig(schoolId, correlationId);

        // Update in database
        const updatedConfig = await this.repo.updateConfig(schoolId, validated);

        // Invalidate Cache (Invalidate after update)
        const cacheKey = this.getCacheKey(schoolId);
        cacheProvider.delete(cacheKey);
        this.logInfo(`Invalidated config cache for school: ${schoolId}`, correlationId);

        // Log Audit Trail
        await this.auditService.logAudit({
            userId,
            action: 'ASSESSMENT_CONFIG_UPDATE',
            entityName: 'assessment_configurations',
            entityId: updatedConfig.id,
            beforeState,
            afterState: updatedConfig,
            correlationId
        });

        return updatedConfig;
    }
}
