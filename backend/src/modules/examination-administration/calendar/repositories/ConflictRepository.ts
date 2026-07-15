import { supabase } from '../../../../shared/supabase';
import { BusinessException } from '../../../../common/exceptions/BusinessException';
import { v4 as uuidv4 } from 'uuid';

export default class ConflictRepository {
  private table = 'calendar_conflicts';

  async findByCalendarId(calendarId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('exam_calendar_id', calendarId);
    if (error) {
      throw new BusinessException('Failed to fetch conflicts', 500, 'CONFLICT_FETCH_ERROR', error);
    }
    return data || [];
  }

  async findById(conflictId: string) {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', conflictId)
      .single();
    if (error && error.code !== 'PGRST116') {
      throw new BusinessException('Failed to fetch conflict', 500, 'CONFLICT_FETCH_ERROR', error);
    }
    return data;
  }

  async resolve(conflictId: string, payload: any, userId: string) {
    const { error } = await supabase
      .from(this.table)
      .update({
        resolved: true,
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
        resolution_notes: payload.resolution_notes,
      })
      .eq('id', conflictId);
    if (error) {
      throw new BusinessException('Failed to resolve conflict', 500, 'CONFLICT_RESOLVE_ERROR', error);
    }
  }
}
