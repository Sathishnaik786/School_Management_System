import CalendarRepository from '../repositories/CalendarRepository';
import { VersionRepository } from '../repositories/VersionRepository';
import { PublicationRepository } from '../repositories/PublicationRepository';
import ConflictRepository from '../repositories/ConflictRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import ConflictEngine from '../utils/ConflictEngine';
import { isValidTransition } from '../utils/Lifecycle';
import { CreateAcademicCalendarDto, UpdateAcademicCalendarDto, PublishCalendarDto, LockCalendarDto, ResolveConflictDto } from '../dto/CalendarDto';
import { Calendar, CalendarVersion, CalendarConflict, AuditLog } from '../types';
import { BusinessException } from '../../../../common/exceptions/BusinessException';
import { TransactionHelper } from '../../../../common/database/TransactionHelper';

class CalendarService {
  private calendarRepo = new CalendarRepository();
  private versionRepo = new VersionRepository();
  private publicationRepo = new PublicationRepository();
  private conflictRepo = new ConflictRepository();
  private auditRepo = new AuditRepository();
  private transactionHelper = new TransactionHelper();

  async createCalendar(payload: CreateAcademicCalendarDto, userId: string) {
    const calendar = await this.calendarRepo.create(payload, userId);
    await this.auditRepo.logCreate('academic_calendar', calendar.id, payload, userId);
    // placeholder event publish
    // await EventBus.publish('calendar.created', { calendarId: calendar.id, userId });
    return calendar;
  }

  async updateCalendar(id: string, payload: UpdateAcademicCalendarDto, userId: string) {
    const before = await this.calendarRepo.findById(id);
    const updated = await this.calendarRepo.update(id, payload, userId);
    await this.auditRepo.logUpdate('academic_calendar', id, payload, before, userId);
    // await EventBus.publish('calendar.updated', { calendarId: id, userId });
    return updated;
  }

  async deleteCalendar(id: string, userId: string) {
    const before = await this.calendarRepo.findById(id);
    await this.calendarRepo.softDelete(id, userId);
    await this.auditRepo.logDelete('academic_calendar', id, before, userId);
    // await EventBus.publish('calendar.archived', { calendarId: id, userId });
  }

  async getCalendar(id: string) {
    return this.calendarRepo.findById(id);
  }

  async listCalendars(opts: any) {
    return this.calendarRepo.findAll(opts);
  }

  // Publish flow – validates lifecycle, creates version snapshot, writes publication record, audits, emits event
  async publishCalendar(id: string, payload: PublishCalendarDto, userId: string) {
    const calendar = await this.calendarRepo.findById(id);
    if (!isValidTransition(calendar.status, 'PUBLISHED')) {
      throw new BusinessException('Invalid state transition to PUBLISHED', 400, 'CALENDAR_INVALID_TRANSITION');
    }
    // Conflict check – block if any ERROR/CRITICAL
    const conflicts = await this.conflictRepo.findByCalendarId(id);
    const blocking = conflicts.filter(c => c.severity === 'ERROR' || c.severity === 'CRITICAL');
    if (blocking.length) {
      throw new BusinessException('Cannot publish due to blocking conflicts', 400, 'CALENDAR_HAS_CONFLICTS');
    }
    return this.transactionHelper.runInTransaction(async () => {
      // Create immutable snapshot
      const snapshot = await this.calendarRepo.buildSnapshot(id);
      const version = await this.versionRepo.saveVersion({ calendarId: id, snapshot, publishedBy: userId, status: 'PUBLISHED' });
      await this.publicationRepo.createPublication({ calendarId: id, versionId: version.id, publishedAt: new Date(), publishedBy: userId });
      await this.calendarRepo.updateStatus(id, 'PUBLISHED', userId);
      await this.auditRepo.logPublish('academic_calendar', id, version.id, userId);
      // await EventBus.publish('calendar.published', { calendarId: id, versionId: version.id, userId });
      return { calendar, version };
    });
  }

  async lockCalendar(id: string, payload: LockCalendarDto, userId: string) {
    const calendar = await this.calendarRepo.findById(id);
    if (!isValidTransition(calendar.status, 'LOCKED')) {
      throw new BusinessException('Invalid transition to LOCKED', 400, 'CALENDAR_INVALID_TRANSITION');
    }
    await this.calendarRepo.updateStatus(id, 'LOCKED', userId);
    await this.auditRepo.logLock('academic_calendar', id, userId);
    // await EventBus.publish('calendar.locked', { calendarId: id, userId });
    return { success: true };
  }

  async getVersionHistory(calendarId: string) {
    return this.versionRepo.findByCalendarId(calendarId);
  }

  async restoreVersion(calendarId: string, versionId: string, userId: string) {
    const version = await this.versionRepo.findById(versionId);
    if (!version) throw new BusinessException('Version not found', 404, 'VERSION_NOT_FOUND');
    return this.transactionHelper.runInTransaction(async () => {
      // restore snapshot – create new version with status SUPERSEDED then ARCHIVED previous
      await this.calendarRepo.restoreSnapshot(calendarId, version.snapshot, userId);
      const newVersion = await this.versionRepo.saveVersion({ calendarId, snapshot: version.snapshot, publishedBy: userId, status: 'SUPERSEDED' });
      await this.auditRepo.logRestore('academic_calendar', calendarId, versionId, userId);
      // await EventBus.publish('calendar.version.restored', { calendarId, versionId, userId });
      return newVersion;
    });
  }

  async detectConflicts(calendarId: string) {
    const calendar = await this.calendarRepo.findById(calendarId);
    return ConflictEngine.detectConflicts(calendar);
  }

  async resolveConflict(conflictId: string, payload: ResolveConflictDto, userId: string) {
    const conflict = await this.conflictRepo.findById(conflictId);
    if (!conflict) throw new BusinessException('Conflict not found', 404, 'CONFLICT_NOT_FOUND');
    await this.conflictRepo.resolve(conflictId, payload, userId);
    await this.auditRepo.logConflictResolve('calendar_conflict', conflictId, payload, userId);
    // await EventBus.publish('calendar.conflicts.resolve', { conflictId, userId });
    return { success: true };
  }
}

export default CalendarService;
