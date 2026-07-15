// src/modules/examination-administration/calendar/types/CalendarVersion.ts
export interface CalendarVersion {
  id: string;
  calendar_id: string;
  snapshot: any; // JSONB snapshot of calendar state
  created_by: string;
  status: string;
  created_at: string;
}
