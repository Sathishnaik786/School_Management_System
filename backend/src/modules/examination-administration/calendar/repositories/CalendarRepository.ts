import { SupabaseClient } from '@supabase/supabase-js';
import { CalendarDTO } from '../dto/CalendarDto';
import { Calendar } from '../types/Calendar';
import { BusinessException } from '../../../../common/exceptions/BusinessException';

// Assuming a singleton Supabase client is exported from a shared module
import supabase from '../../../shared/supabaseClient';

class CalendarRepository {
  private client: SupabaseClient = supabase;

  async create(payload: CalendarDTO, userId: string): Promise<Calendar> {
    const { data, error } = await this.client
      .from<Calendar>('academic_calendars')
      .insert({
        ...payload,
        created_by: userId,
        updated_by: userId,
        status: 'DRAFT',
        is_deleted: false,
      })
      .single();
    if (error) throw new BusinessException(error.message, 500, 'DB_ERROR', error.details);
    return data as Calendar;
  }

  async update(id: string, payload: Partial<CalendarDTO>, userId: string): Promise<Calendar> {
    const { data, error } = await this.client
      .from<Calendar>('academic_calendars')
      .update({
        ...payload,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .single();
    if (error) throw new BusinessException(error.message, 500, 'DB_ERROR', error.details);
    return data as Calendar;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('academic_calendars')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id);
    if (error) throw new BusinessException(error.message, 500, 'DB_ERROR', error.details);
  }

  async findById(id: string): Promise<Calendar> {
    const { data, error } = await this.client
      .from<Calendar>('academic_calendars')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw new BusinessException(error.message, 500, 'DB_ERROR', error.details);
    return data as Calendar;
  }

  async findAll(opts: any): Promise<{ items: Calendar[]; total: number }> {
    const { page = 1, limit = 20, search, sortBy = 'created_at', sortOrder = 'desc', status, schoolId } = opts;
    let query = this.client.from<Calendar>('academic_calendars').select('*', { count: 'exact' });
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    const from = (page - 1) * limit;
    const { data, error, count } = await query
      .range(from, from + limit - 1)
      .order(sortBy, { ascending: sortOrder === 'asc' });
    if (error) throw new BusinessException(error.message, 500, 'DB_ERROR', error.details);
    return { items: data as Calendar[], total: count ?? 0 };
  }

  async updateStatus(id: string, status: string, userId: string): Promise<void> {
    const { error } = await this.client
      .from('academic_calendars')
      .update({ status, updated_by: userId, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new BusinessException(error.message, 500, 'DB_ERROR', error.details);
  }

  // Build an immutable snapshot of the entire calendar structure (placeholder implementation)
  async buildSnapshot(calendarId: string): Promise<any> {
    // Fetch calendar, events, exam schedule, rooms, invigilators
    const [calendar, events] = await Promise.all([
      this.findById(calendarId),
      this.client.from('academic_calendar_events').select('*').eq('calendar_id', calendarId),
    ]);
    // In a real implementation, also fetch related exam schedules, room/invigilator assignments.
    return { calendar, events };
  }

  async restoreSnapshot(calendarId: string, snapshot: any, userId: string): Promise<void> {
    // Simplified: replace calendar fields with snapshot data and mark as DRAFT
    await this.client.from('academic_calendars').update({
      ...snapshot.calendar,
      status: 'DRAFT',
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }).eq('id', calendarId);
    // Replace events (delete existing then insert snapshot events)
    await this.client.from('academic_calendar_events').delete().eq('calendar_id', calendarId);
    const events = snapshot.events || [];
    if (events.length) {
      const formatted = events.map((e: any) => ({ ...e, calendar_id: calendarId }));
      await this.client.from('academic_calendar_events').insert(formatted);
    }
  }
}

export default CalendarRepository;
