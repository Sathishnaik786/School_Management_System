import ConflictEngine from '../utils/ConflictEngine';
import { supabase } from '../../../../../shared/supabase';
import { Calendar } from '../types/Calendar';

jest.mock('../../../../../shared/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
  },
}));

describe('ConflictEngine', () => {
  let calendar: Calendar;

  beforeEach(() => {
    jest.clearAllMocks();
    calendar = {
      id: 'cal1',
      name: 'Test Calendar',
      status: 'DRAFT',
      tenant_id: 'tenant1',
      is_deleted: false,
      created_at: new Date().toISOString(),
      created_by: 'user1',
    };
  });

  it('should detect ROOM_OVERLAP', async () => {
    (supabase.not as jest.Mock).mockResolvedValue({
      data: [
        { location: 'Room A', start_timestamp: '2026-07-15T10:00:00Z', end_timestamp: '2026-07-15T12:00:00Z' },
        { location: 'Room A', start_timestamp: '2026-07-15T11:00:00Z', end_timestamp: '2026-07-15T13:00:00Z' },
      ],
      error: null,
    });
    // For EXAM_OUTSIDE_SEASON
    (supabase.eq as jest.Mock).mockResolvedValueOnce({
       data: [],
       error: null
    });

    const conflicts = await ConflictEngine.detectConflicts(calendar);
    const roomConflict = conflicts.find((c) => c.rule_code === 'ROOM_OVERLAP');
    expect(roomConflict).toBeDefined();
    expect(roomConflict?.severity).toBe('ERROR');
  });

  it('should detect EXAM_OUTSIDE_SEASON', async () => {
    (supabase.not as jest.Mock).mockResolvedValueOnce({
      data: [],
      error: null,
    });
    // Mock the second query for EXAM_OUTSIDE_SEASON
    (supabase.eq as jest.Mock).mockResolvedValueOnce({
      data: [
        { start_timestamp: '2026-06-01T10:00:00Z', end_timestamp: '2026-06-01T12:00:00Z' },
      ],
      error: null,
    });

    const conflicts = await ConflictEngine.detectConflicts({
      ...calendar,
      start_date: '2026-07-01',
      end_date: '2026-07-31',
    } as any);
    
    const seasonConflict = conflicts.find((c) => c.rule_code === 'EXAM_OUTSIDE_SEASON');
    expect(seasonConflict).toBeDefined();
    expect(seasonConflict?.severity).toBe('ERROR');
  });
});
