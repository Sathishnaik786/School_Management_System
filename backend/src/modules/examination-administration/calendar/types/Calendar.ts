// src/modules/examination-administration/calendar/types/Calendar.ts
export interface Calendar {
  id: string;
  name: string;
  description?: string;
  status: string;
  tenant_id: string;
  is_deleted: boolean;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  // add other relevant fields like start_date, end_date, etc.
}

export interface CalendarConflict {
  id?: string;
  rule_code: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  description?: string;
  created_at?: string;
  resolved?: boolean;
}
