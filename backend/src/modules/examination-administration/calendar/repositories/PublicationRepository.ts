// src/modules/examination-administration/calendar/repositories/PublicationRepository.ts
import { supabase } from '../../../../shared/supabase';
import { BusinessException } from '../../../../common/exceptions/BusinessException';
import { v4 as uuidv4 } from 'uuid';

export class PublicationRepository {
  private table = 'calendar_publications';

  async createPublication(data: {
    calendarId: string;
    versionId: string;
    publishedAt: Date;
    publishedBy: string;
  }): Promise<any> {
    const { calendarId, versionId, publishedAt, publishedBy } = data;
    const id = uuidv4();
    const { data: inserted, error } = await supabase
      .from(this.table)
      .insert({
        id,
        calendar_id: calendarId,
        version_id: versionId,
        published_at: publishedAt.toISOString(),
        published_by: publishedBy,
      })
      .single();
    if (error) {
      throw new BusinessException('Failed to create publication', 500, 'PUBLICATION_SAVE_ERROR', error);
    }
    return inserted;
  }

  async findByCalendarId(calendarId: string): Promise<any> {
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('calendar_id', calendarId)
      .single();
    if (error && error.code !== 'PGRST116') {
      throw new BusinessException('Failed to fetch publication', 500, 'PUBLICATION_FETCH_ERROR', error);
    }
    return data;
  }
}
