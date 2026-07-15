// src/modules/examination-administration/calendar/repositories/VersionRepository.ts
import { supabase } from '../../../../shared/supabase';
import { BusinessException } from '../../../../common/exceptions/BusinessException';
import { CalendarVersion } from '../types/CalendarVersion';
import { v4 as uuidv4 } from 'uuid';

export class VersionRepository {
  private table = 'exam_schedule_versions';

  async saveVersion(data: {
    calendarId: string;
    snapshot: any;
    publishedBy: string;
    status: string;
  }): Promise<CalendarVersion> {
    const { calendarId, snapshot, publishedBy, status } = data;
    const id = uuidv4();
    const { data: inserted, error } = await supabase
      .from(this.table)
      .insert({
        id,
        calendar_id: calendarId,
        snapshot,
        created_by: publishedBy,
        status,
        created_at: new Date().toISOString(),
      })
      .single();
    if (error) {
      throw new BusinessException('Failed to save version', 500, 'VERSION_SAVE_ERROR', error);
    }
    return inserted as CalendarVersion;
  }

  async findLatestVersion(calendarId: string): Promise<CalendarVersion | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('calendar_id', calendarId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = No rows found
      throw new BusinessException('Failed to fetch latest version', 500, 'VERSION_FETCH_ERROR', error);
    }
    return data as CalendarVersion | null;
  }

  async findById(versionId: string): Promise<CalendarVersion | null> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', versionId)
      .single();
    if (error && error.code !== 'PGRST116') {
      throw new BusinessException('Failed to fetch version', 500, 'VERSION_FETCH_ERROR', error);
    }
    return data as CalendarVersion | null;
  }
}
