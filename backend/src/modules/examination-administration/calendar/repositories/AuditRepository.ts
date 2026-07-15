// src/modules/examination-administration/calendar/repositories/AuditRepository.ts
import { supabase } from '../../../../shared/supabase';
import { BusinessException } from '../../../../common/exceptions/BusinessException';
import { v4 as uuidv4 } from 'uuid';

export class AuditRepository {
  private table = 'calendar_audit_logs';

  async logCreate(entity: string, entityId: string, payload: any, userId: string) {
    await this.insertLog({
      entity,
      entity_id: entityId,
      action: 'CREATE',
      performed_by: userId,
      details: payload,
    });
  }

  async logUpdate(entity: string, entityId: string, payload: any, before: any, userId: string) {
    await this.insertLog({
      entity,
      entity_id: entityId,
      action: 'UPDATE',
      performed_by: userId,
      details: { before, after: payload },
    });
  }

  async logDelete(entity: string, entityId: string, before: any, userId: string) {
    await this.insertLog({
      entity,
      entity_id: entityId,
      action: 'DELETE',
      performed_by: userId,
      details: before,
    });
  }

  async logPublish(entity: string, entityId: string, versionId: string, userId: string) {
    await this.insertLog({
      entity,
      entity_id: entityId,
      action: 'PUBLISH',
      performed_by: userId,
      details: { versionId },
    });
  }

  async logLock(entity: string, entityId: string, userId: string) {
    await this.insertLog({
      entity,
      entity_id: entityId,
      action: 'LOCK',
      performed_by: userId,
      details: {},
    });
  }

  async logRestore(entity: string, entityId: string, versionId: string, userId: string) {
    await this.insertLog({
      entity,
      entity_id: entityId,
      action: 'RESTORE',
      performed_by: userId,
      details: { versionId },
    });
  }

  async logConflictResolve(entity: string, conflictId: string, payload: any, userId: string) {
    await this.insertLog({
      entity,
      entity_id: conflictId,
      action: 'RESOLVE_CONFLICT',
      performed_by: userId,
      details: payload,
    });
  }

  private async insertLog(log: {
    entity: string;
    entity_id: string;
    action: string;
    performed_by: string;
    details: any;
  }) {
    const id = uuidv4();
    const { error } = await supabase
      .from(this.table)
      .insert({
        id,
        tenant_id: process.env.DEFAULT_TENANT_ID || 'default',
        ...log,
        created_at: new Date().toISOString(),
      });
    if (error) {
      throw new BusinessException('Failed to insert audit log', 500, 'AUDIT_INSERT_ERROR', error);
    }
  }
}
