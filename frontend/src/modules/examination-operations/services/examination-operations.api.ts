import apiClient from '../../../lib/api-client';
import type {
    ExamCenter, ExamBuilding, ExamRoom,
    ExamRegistration, RegistrationStatus,
    HallTicket, SeatAllocation, SeatAllocationAuditLog,
    InvigilatorAssignment, InvigilatorAvailability,
    ExamAttendance, ExamResultPublication,
    ScheduleSession, ScheduleRoom,
    PaginatedResponse
} from '../types';

const BASE = '/v1/examination-operations';

// ─── REGISTRATIONS ───────────────────────────────────────────
export const registrationApi = {
    list: (params?: { exam_id?: string; status?: string; page?: number; limit?: number }) =>
        apiClient.get<PaginatedResponse<ExamRegistration>>(`${BASE}/registrations`, { params }),

    get: (id: string) =>
        apiClient.get<ExamRegistration>(`${BASE}/registrations/${id}`),

    create: (payload: { student_id: string; exam_id: string }) =>
        apiClient.post<ExamRegistration>(`${BASE}/registrations`, payload),

    bulkRegister: (payload: { student_ids: string[]; exam_id: string }) =>
        apiClient.post<{ created: number; data: ExamRegistration[] }>(`${BASE}/registrations/bulk`, payload),

    updateStatus: (id: string, payload: { status: RegistrationStatus; remarks?: string }) =>
        apiClient.patch<ExamRegistration>(`${BASE}/registrations/${id}/status`, payload),

    generateHallTicket: (id: string) =>
        apiClient.post<HallTicket>(`${BASE}/registrations/${id}/hall-ticket`),
};

// ─── VENUES ──────────────────────────────────────────────────
export const venueApi = {
    centers: {
        list: () => apiClient.get<ExamCenter[]>(`${BASE}/venues/centers`),
        create: (payload: { name: string; code: string; campus?: string }) =>
            apiClient.post<ExamCenter>(`${BASE}/venues/centers`, payload),
        update: (id: string, payload: Partial<ExamCenter>) =>
            apiClient.put<ExamCenter>(`${BASE}/venues/centers/${id}`, payload),
        delete: (id: string) => apiClient.delete(`${BASE}/venues/centers/${id}`),
    },
    buildings: {
        list: (centerId?: string) =>
            apiClient.get<ExamBuilding[]>(`${BASE}/venues/buildings`, { params: centerId ? { center_id: centerId } : undefined }),
        create: (payload: { center_id: string; name: string; floors_count?: number }) =>
            apiClient.post<ExamBuilding>(`${BASE}/venues/buildings`, payload),
        update: (id: string, payload: Partial<ExamBuilding>) =>
            apiClient.put<ExamBuilding>(`${BASE}/venues/buildings/${id}`, payload),
    },
    rooms: {
        list: (buildingId?: string) =>
            apiClient.get<ExamRoom[]>(`${BASE}/venues/rooms`, { params: buildingId ? { building_id: buildingId } : undefined }),
        create: (payload: { building_id: string; room_number: string; capacity: number; floor_number?: number; rows_count?: number; cols_count?: number; accessibility_supported?: boolean }) =>
            apiClient.post<ExamRoom>(`${BASE}/venues/rooms`, payload),
        update: (id: string, payload: Partial<ExamRoom>) =>
            apiClient.put<ExamRoom>(`${BASE}/venues/rooms/${id}`, payload),
        delete: (id: string) => apiClient.delete(`${BASE}/venues/rooms/${id}`),
    },
};

// ─── SEATING ─────────────────────────────────────────────────
export const seatingApi = {
    listAllocations: (examScheduleId?: string) =>
        apiClient.get<SeatAllocation[]>(`${BASE}/seating/allocations`, { params: examScheduleId ? { exam_schedule_id: examScheduleId } : undefined }),

    autoAllocate: (payload: { exam_schedule_id: string; room_ids: string[] }) =>
        apiClient.post<{ allocated: number; data: SeatAllocation[] }>(`${BASE}/seating/auto-allocate`, payload),

    changeSeat: (id: string, payload: { new_seat_number: string; new_room_id?: string; remarks?: string }) =>
        apiClient.patch<SeatAllocation>(`${BASE}/seating/allocations/${id}/change`, payload),

    getAuditLogs: (allocationId?: string) =>
        apiClient.get<SeatAllocationAuditLog[]>(`${BASE}/seating/audit-logs`, { params: allocationId ? { allocation_id: allocationId } : undefined }),
};

// ─── INVIGILATION ────────────────────────────────────────────
export const invigilationApi = {
    listAssignments: (examScheduleId?: string) =>
        apiClient.get<InvigilatorAssignment[]>(`${BASE}/invigilation/assignments`, { params: examScheduleId ? { exam_schedule_id: examScheduleId } : undefined }),

    assign: (payload: { exam_schedule_id: string; room_id: string; faculty_profile_id: string; role?: string }) =>
        apiClient.post<InvigilatorAssignment>(`${BASE}/invigilation/assignments`, payload),

    updateStatus: (id: string, status: string) =>
        apiClient.patch<InvigilatorAssignment>(`${BASE}/invigilation/assignments/${id}/status`, { status }),

    remove: (id: string) => apiClient.delete(`${BASE}/invigilation/assignments/${id}`),

    listAvailability: (date?: string) =>
        apiClient.get<InvigilatorAvailability[]>(`${BASE}/invigilation/availability`, { params: date ? { date } : undefined }),

    setAvailability: (payload: { faculty_profile_id: string; available_date: string; start_time: string; end_time: string; is_available?: boolean }) =>
        apiClient.post<InvigilatorAvailability>(`${BASE}/invigilation/availability`, payload),
};

// ─── ATTENDANCE ──────────────────────────────────────────────
export const attendanceApi = {
    list: (examScheduleId: string) =>
        apiClient.get<ExamAttendance[]>(`${BASE}/attendance`, { params: { exam_schedule_id: examScheduleId } }),

    mark: (payload: { exam_schedule_id: string; student_id: string; status: string; verified_via?: string; remarks?: string }) =>
        apiClient.post<ExamAttendance>(`${BASE}/attendance/mark`, payload),

    scanQR: (payload: { ticket_code: string; exam_schedule_id: string }) =>
        apiClient.post<{ message: string; attendance: ExamAttendance }>(`${BASE}/attendance/scan-qr`, payload),

    bulkMark: (payload: { exam_schedule_id: string; entries: Array<{ student_id: string; status: string }> }) =>
        apiClient.post<{ updated: number; data: ExamAttendance[] }>(`${BASE}/attendance/bulk`, payload),
};

// ─── PUBLICATIONS ────────────────────────────────────────────
export const publicationApi = {
    list: () => apiClient.get<ExamResultPublication[]>(`${BASE}/publications`),

    get: (id: string) => apiClient.get<ExamResultPublication>(`${BASE}/publications/${id}`),

    initiate: (examId: string) =>
        apiClient.post<ExamResultPublication>(`${BASE}/publications`, { exam_id: examId }),

    advance: (id: string, payload: { action?: 'APPROVE' | 'ROLLBACK'; comments?: string }) =>
        apiClient.post<ExamResultPublication>(`${BASE}/publications/${id}/advance`, payload),

    freeze: (id: string) => apiClient.post<ExamResultPublication>(`${BASE}/publications/${id}/freeze`),
};

// ─── SCHEDULING ──────────────────────────────────────────────
export const schedulingApi = {
    sessions: {
        list: () => apiClient.get<ScheduleSession[]>(`${BASE}/scheduling/sessions`),
        create: (payload: { name: string; start_time: string; end_time: string }) =>
            apiClient.post<ScheduleSession>(`${BASE}/scheduling/sessions`, payload),
        update: (id: string, payload: Partial<ScheduleSession>) =>
            apiClient.put<ScheduleSession>(`${BASE}/scheduling/sessions/${id}`, payload),
        delete: (id: string) => apiClient.delete(`${BASE}/scheduling/sessions/${id}`),
    },
    rooms: {
        list: (examScheduleId?: string) =>
            apiClient.get<ScheduleRoom[]>(`${BASE}/scheduling/rooms`, { params: examScheduleId ? { exam_schedule_id: examScheduleId } : undefined }),
        add: (payload: { exam_schedule_id: string; room_id: string; allocated_capacity: number }) =>
            apiClient.post<ScheduleRoom>(`${BASE}/scheduling/rooms`, payload),
        remove: (id: string) => apiClient.delete(`${BASE}/scheduling/rooms/${id}`),
    },
};
