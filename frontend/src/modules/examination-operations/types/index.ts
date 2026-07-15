// ============================================================
// Phase 2C: Examination Operations - TypeScript Domain Types
// ============================================================

// ─── VENUE ───────────────────────────────────────────────────
export interface ExamCenter {
    id: string;
    school_id: string;
    name: string;
    campus?: string;
    code: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    exam_buildings?: ExamBuilding[];
}

export interface ExamBuilding {
    id: string;
    school_id: string;
    center_id: string;
    name: string;
    floors_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    exam_rooms?: ExamRoom[];
}

export interface ExamRoom {
    id: string;
    school_id: string;
    building_id: string;
    room_number: string;
    floor_number: number;
    capacity: number;
    accessibility_supported: boolean;
    rows_count: number;
    cols_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    exam_buildings?: ExamBuilding;
}

// ─── SCHEDULING ──────────────────────────────────────────────
export interface ScheduleSession {
    id: string;
    school_id: string;
    name: string;
    start_time: string;
    end_time: string;
    created_at: string;
    updated_at: string;
}

export interface ScheduleRoom {
    id: string;
    school_id: string;
    exam_schedule_id: string;
    room_id: string;
    allocated_capacity: number;
    created_at: string;
    updated_at: string;
    exam_rooms?: ExamRoom;
}

// ─── REGISTRATION ────────────────────────────────────────────
export type RegistrationStatus =
    | 'DRAFT'
    | 'PENDING'
    | 'VERIFIED'
    | 'APPROVED'
    | 'HALL_TICKET_GENERATED'
    | 'CHECKED_IN'
    | 'COMPLETED'
    | 'CANCELLED';

export interface ExamRegistration {
    id: string;
    school_id: string;
    student_id: string;
    exam_id: string;
    status: RegistrationStatus;
    created_at: string;
    updated_at: string;
    // Joined
    students?: { id: string; first_name: string; last_name: string; roll_number: string; email: string };
    exams?: { id: string; name: string; code: string };
    hall_tickets?: HallTicket[];
    registration_status_history?: RegistrationStatusHistory[];
    registration_documents?: RegistrationDocument[];
}

export interface RegistrationStatusHistory {
    id: string;
    registration_id: string;
    status: RegistrationStatus;
    changed_by?: string;
    remarks?: string;
    created_at: string;
}

export interface RegistrationDocument {
    id: string;
    registration_id: string;
    document_name: string;
    document_url: string;
    uploaded_at: string;
}

// ─── HALL TICKET ─────────────────────────────────────────────
export type HallTicketStatus = 'GENERATED' | 'DOWNLOADED' | 'REVOKED';

export interface HallTicket {
    id: string;
    school_id: string;
    registration_id: string;
    ticket_code: string;
    status: HallTicketStatus;
    snapshot_data: Record<string, unknown>;
    generated_at: string;
    updated_at: string;
}

// ─── SEATING ─────────────────────────────────────────────────
export type SeatAllocationStatus = 'ALLOCATED' | 'CHANGED' | 'RELEASED';

export interface SeatAllocation {
    id: string;
    school_id: string;
    exam_schedule_id: string;
    student_id: string;
    room_id: string;
    seat_number: string;
    status: SeatAllocationStatus;
    created_at: string;
    updated_at: string;
    students?: { id: string; first_name: string; last_name: string; roll_number: string };
    exam_rooms?: ExamRoom;
    exam_schedules?: { id: string; exam_date: string; subject_name: string };
}

export interface SeatAllocationAuditLog {
    id: string;
    school_id: string;
    allocation_id: string;
    action: string;
    old_seat?: string;
    new_seat?: string;
    performed_by?: string;
    remarks?: string;
    created_at: string;
}

// ─── INVIGILATION ────────────────────────────────────────────
export type InvigilatorRole = 'CHIEF_SUPERINTENDENT' | 'INVIGILATOR' | 'RELIEVER';
export type InvigilatorAssignmentStatus = 'ASSIGNED' | 'CONFIRMED' | 'DECLINED';

export interface InvigilatorAssignment {
    id: string;
    school_id: string;
    exam_schedule_id: string;
    room_id: string;
    faculty_profile_id: string;
    role: InvigilatorRole;
    status: InvigilatorAssignmentStatus;
    created_at: string;
    faculty_profiles?: { id: string; users?: { id: string; first_name: string; last_name: string; email: string } };
    exam_rooms?: ExamRoom;
    exam_schedules?: { id: string; exam_date: string; subject_name: string };
}

export interface InvigilatorAvailability {
    id: string;
    school_id: string;
    faculty_profile_id: string;
    available_date: string;
    start_time: string;
    end_time: string;
    is_available: boolean;
    created_at: string;
    faculty_profiles?: { id: string; users?: { id: string; first_name: string; last_name: string; email: string } };
}

// ─── ATTENDANCE ──────────────────────────────────────────────
export type AttendanceStatus =
    | 'REGISTERED'
    | 'CHECKED_IN'
    | 'PRESENT'
    | 'LATE'
    | 'ABSENT'
    | 'MALPRACTICE'
    | 'CANCELLED';

export type AttendanceVerifiedVia = 'QR_CODE' | 'MANUAL' | 'BIOMETRIC';

export interface ExamAttendance {
    id: string;
    school_id?: string;
    exam_schedule_id: string;
    student_id: string;
    status: AttendanceStatus;
    entry_time?: string;
    verified_via?: AttendanceVerifiedVia;
    remarks?: string;
    created_at: string;
    updated_at?: string;
    students?: { id: string; first_name: string; last_name: string; roll_number: string };
}

// ─── RESULT PUBLICATION ──────────────────────────────────────
export type PublicationStatus =
    | 'EVALUATED'
    | 'AUTO_VALIDATION'
    | 'MODERATOR'
    | 'EXAM_CELL'
    | 'PRINCIPAL'
    | 'PUBLISHED'
    | 'ARCHIVED';

export interface ExamResultPublication {
    id: string;
    school_id: string;
    exam_id: string;
    status: PublicationStatus;
    published_at?: string;
    frozen: boolean;
    created_at: string;
    updated_at: string;
    exams?: { id: string; name: string; code: string };
    approval_history?: ApprovalHistoryEntry[];
}

export interface ApprovalHistoryEntry {
    id: string;
    publication_id: string;
    stage: string;
    approved_by?: string;
    status: 'APPROVED' | 'ROLLBACK';
    comments?: string;
    created_at: string;
    users?: { id: string; email: string; first_name?: string; last_name?: string };
}

// ─── PAGINATION ──────────────────────────────────────────────
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
