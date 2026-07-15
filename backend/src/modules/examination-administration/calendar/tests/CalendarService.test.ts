import CalendarService from '../services/CalendarService';
import CalendarRepository from '../repositories/CalendarRepository';
import { VersionRepository } from '../repositories/VersionRepository';
import { PublicationRepository } from '../repositories/PublicationRepository';
import ConflictRepository from '../repositories/ConflictRepository';
import { AuditRepository } from '../repositories/AuditRepository';
import { BusinessException } from '../../../../common/exceptions/BusinessException';

jest.mock('../repositories/CalendarRepository');
jest.mock('../repositories/VersionRepository');
jest.mock('../repositories/PublicationRepository');
jest.mock('../repositories/ConflictRepository');
jest.mock('../repositories/AuditRepository');
jest.mock('../../../../common/database/TransactionHelper', () => {
  return {
    TransactionHelper: jest.fn().mockImplementation(() => {
      return {
        runInTransaction: jest.fn((cb) => cb()),
      };
    }),
  };
});

describe('CalendarService', () => {
  let calendarService: CalendarService;
  let mockCalendarRepo: jest.Mocked<CalendarRepository>;
  let mockVersionRepo: jest.Mocked<VersionRepository>;
  let mockPublicationRepo: jest.Mocked<PublicationRepository>;
  let mockConflictRepo: jest.Mocked<ConflictRepository>;
  let mockAuditRepo: jest.Mocked<AuditRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    calendarService = new CalendarService();
    mockCalendarRepo = (calendarService as any).calendarRepo;
    mockVersionRepo = (calendarService as any).versionRepo;
    mockPublicationRepo = (calendarService as any).publicationRepo;
    mockConflictRepo = (calendarService as any).conflictRepo;
    mockAuditRepo = (calendarService as any).auditRepo;
  });

  describe('publishCalendar', () => {
    it('should throw error if invalid transition', async () => {
      mockCalendarRepo.findById.mockResolvedValue({ status: 'PUBLISHED' } as any);
      
      await expect(
        calendarService.publishCalendar('cal1', { reason: 'test' }, 'user1')
      ).rejects.toThrow(BusinessException);
    });

    it('should throw error if blocking conflicts exist', async () => {
      mockCalendarRepo.findById.mockResolvedValue({ status: 'DRAFT' } as any);
      mockConflictRepo.findByCalendarId.mockResolvedValue([{ severity: 'ERROR' } as any]);
      
      await expect(
        calendarService.publishCalendar('cal1', { reason: 'test' }, 'user1')
      ).rejects.toThrow(BusinessException);
    });

    it('should successfully publish calendar', async () => {
      mockCalendarRepo.findById.mockResolvedValue({ id: 'cal1', status: 'DRAFT' } as any);
      mockConflictRepo.findByCalendarId.mockResolvedValue([]);
      mockCalendarRepo.buildSnapshot.mockResolvedValue({ data: 'snapshot' });
      mockVersionRepo.saveVersion.mockResolvedValue({ id: 'ver1' } as any);
      
      const result = await calendarService.publishCalendar('cal1', { reason: 'test' }, 'user1');
      
      expect(mockVersionRepo.saveVersion).toHaveBeenCalled();
      expect(mockPublicationRepo.createPublication).toHaveBeenCalled();
      expect(mockCalendarRepo.updateStatus).toHaveBeenCalledWith('cal1', 'PUBLISHED', 'user1');
      expect(mockAuditRepo.logPublish).toHaveBeenCalled();
      expect(result.version.id).toBe('ver1');
    });
  });

  describe('restoreVersion', () => {
    it('should throw error if version not found', async () => {
      mockVersionRepo.findById.mockResolvedValue(null);
      await expect(
        calendarService.restoreVersion('cal1', 'ver1', 'user1')
      ).rejects.toThrow(BusinessException);
    });

    it('should successfully restore version', async () => {
      mockVersionRepo.findById.mockResolvedValue({ snapshot: 'snap' } as any);
      mockVersionRepo.saveVersion.mockResolvedValue({ id: 'newVer' } as any);
      
      const result = await calendarService.restoreVersion('cal1', 'ver1', 'user1');
      
      expect(mockCalendarRepo.restoreSnapshot).toHaveBeenCalledWith('cal1', 'snap', 'user1');
      expect(mockVersionRepo.saveVersion).toHaveBeenCalled();
      expect(mockAuditRepo.logRestore).toHaveBeenCalled();
      expect(result.id).toBe('newVer');
    });
  });
});
