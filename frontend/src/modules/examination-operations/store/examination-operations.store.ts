import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
    ExamCenter, ExamBuilding, ExamRoom,
    ExamRegistration,
    SeatAllocation, SeatAllocationAuditLog,
    InvigilatorAssignment, InvigilatorAvailability,
    ExamAttendance, ExamResultPublication,
    ScheduleSession, ScheduleRoom,
} from '../types';
import {
    registrationApi, venueApi, seatingApi,
    invigilationApi, attendanceApi, publicationApi, schedulingApi,
} from '../services/examination-operations.api';

interface ExamOperationsState {
    // ── LOADING & ERROR ──────────────────────────────────
    loading: boolean;
    error: string | null;

    // ── VENUES ──────────────────────────────────────────
    centers: ExamCenter[];
    buildings: ExamBuilding[];
    rooms: ExamRoom[];

    // ── REGISTRATIONS ───────────────────────────────────
    registrations: ExamRegistration[];
    registrationTotal: number;
    selectedRegistration: ExamRegistration | null;

    // ── SEATING ─────────────────────────────────────────
    allocations: SeatAllocation[];
    allocationAuditLogs: SeatAllocationAuditLog[];

    // ── INVIGILATION ────────────────────────────────────
    assignments: InvigilatorAssignment[];
    availability: InvigilatorAvailability[];

    // ── ATTENDANCE ──────────────────────────────────────
    attendance: ExamAttendance[];

    // ── PUBLICATIONS ────────────────────────────────────
    publications: ExamResultPublication[];
    selectedPublication: ExamResultPublication | null;

    // ── SCHEDULING ──────────────────────────────────────
    sessions: ScheduleSession[];
    scheduleRooms: ScheduleRoom[];

    // ── ACTIONS ─────────────────────────────────────────
    // Venues
    fetchCenters: () => Promise<void>;
    fetchBuildings: (centerId?: string) => Promise<void>;
    fetchRooms: (buildingId?: string) => Promise<void>;
    createCenter: (payload: { name: string; code: string; campus?: string }) => Promise<void>;
    updateCenter: (id: string, payload: Partial<ExamCenter>) => Promise<void>;
    deleteCenter: (id: string) => Promise<void>;
    createBuilding: (payload: { center_id: string; name: string; floors_count?: number }) => Promise<void>;
    updateBuilding: (id: string, payload: Partial<ExamBuilding>) => Promise<void>;
    createRoom: (payload: { building_id: string; room_number: string; capacity: number; floor_number?: number; rows_count?: number; cols_count?: number }) => Promise<void>;
    updateRoom: (id: string, payload: Partial<ExamRoom>) => Promise<void>;
    deleteRoom: (id: string) => Promise<void>;

    // Registrations
    fetchRegistrations: (params?: { exam_id?: string; status?: string; page?: number }) => Promise<void>;
    fetchRegistration: (id: string) => Promise<void>;
    createRegistration: (payload: { student_id: string; exam_id: string }) => Promise<void>;
    bulkRegister: (payload: { student_ids: string[]; exam_id: string }) => Promise<void>;
    updateRegistrationStatus: (id: string, status: string, remarks?: string) => Promise<void>;
    generateHallTicket: (id: string) => Promise<void>;

    // Seating
    fetchAllocations: (examScheduleId?: string) => Promise<void>;
    autoAllocate: (payload: { exam_schedule_id: string; room_ids: string[] }) => Promise<void>;
    changeSeat: (id: string, payload: { new_seat_number: string; new_room_id?: string; remarks?: string }) => Promise<void>;
    fetchAuditLogs: (allocationId?: string) => Promise<void>;

    // Invigilation
    fetchAssignments: (examScheduleId?: string) => Promise<void>;
    assignInvigilator: (payload: { exam_schedule_id: string; room_id: string; faculty_profile_id: string; role?: string }) => Promise<void>;
    removeAssignment: (id: string) => Promise<void>;
    fetchAvailability: (date?: string) => Promise<void>;
    setAvailability: (payload: { faculty_profile_id: string; available_date: string; start_time: string; end_time: string; is_available?: boolean }) => Promise<void>;

    // Attendance
    fetchAttendance: (examScheduleId: string) => Promise<void>;
    markAttendance: (payload: { exam_schedule_id: string; student_id: string; status: string; verified_via?: string; remarks?: string }) => Promise<void>;
    scanQR: (payload: { ticket_code: string; exam_schedule_id: string }) => Promise<{ message: string }>;
    bulkMarkAttendance: (payload: { exam_schedule_id: string; entries: Array<{ student_id: string; status: string }> }) => Promise<void>;

    // Publications
    fetchPublications: () => Promise<void>;
    fetchPublication: (id: string) => Promise<void>;
    initiatePublication: (examId: string) => Promise<void>;
    advancePublication: (id: string, payload: { action?: 'APPROVE' | 'ROLLBACK'; comments?: string }) => Promise<void>;
    freezePublication: (id: string) => Promise<void>;

    // Scheduling
    fetchSessions: () => Promise<void>;
    createSession: (payload: { name: string; start_time: string; end_time: string }) => Promise<void>;
    updateSession: (id: string, payload: Partial<ScheduleSession>) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    fetchScheduleRooms: (examScheduleId?: string) => Promise<void>;
    addScheduleRoom: (payload: { exam_schedule_id: string; room_id: string; allocated_capacity: number }) => Promise<void>;
    removeScheduleRoom: (id: string) => Promise<void>;

    clearError: () => void;
}

export const useExamOperationsStore = create<ExamOperationsState>()(
    devtools(
        (set, get) => ({
            loading: false,
            error: null,
            centers: [],
            buildings: [],
            rooms: [],
            registrations: [],
            registrationTotal: 0,
            selectedRegistration: null,
            allocations: [],
            allocationAuditLogs: [],
            assignments: [],
            availability: [],
            attendance: [],
            publications: [],
            selectedPublication: null,
            sessions: [],
            scheduleRooms: [],

            clearError: () => set({ error: null }),

            // ─── VENUES ────────────────────────────────────────
            fetchCenters: async () => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.centers.list();
                    set({ centers: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchBuildings: async (centerId) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.buildings.list(centerId);
                    set({ buildings: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchRooms: async (buildingId) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.rooms.list(buildingId);
                    set({ rooms: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            createCenter: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.centers.create(payload);
                    set(s => ({ centers: [...s.centers, res.data] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            updateCenter: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.centers.update(id, payload);
                    set(s => ({ centers: s.centers.map(c => c.id === id ? res.data : c) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            deleteCenter: async (id) => {
                set({ loading: true, error: null });
                try {
                    await venueApi.centers.delete(id);
                    set(s => ({ centers: s.centers.filter(c => c.id !== id) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            createBuilding: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.buildings.create(payload);
                    set(s => ({ buildings: [...s.buildings, res.data] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            updateBuilding: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.buildings.update(id, payload);
                    set(s => ({ buildings: s.buildings.map(b => b.id === id ? res.data : b) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            createRoom: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.rooms.create(payload);
                    set(s => ({ rooms: [...s.rooms, res.data] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            updateRoom: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await venueApi.rooms.update(id, payload);
                    set(s => ({ rooms: s.rooms.map(r => r.id === id ? res.data : r) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            deleteRoom: async (id) => {
                set({ loading: true, error: null });
                try {
                    await venueApi.rooms.delete(id);
                    set(s => ({ rooms: s.rooms.filter(r => r.id !== id) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },

            // ─── REGISTRATIONS ─────────────────────────────────
            fetchRegistrations: async (params) => {
                set({ loading: true, error: null });
                try {
                    const res = await registrationApi.list(params);
                    set({ registrations: res.data.data, registrationTotal: res.data.total });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchRegistration: async (id) => {
                set({ loading: true, error: null });
                try {
                    const res = await registrationApi.get(id);
                    set({ selectedRegistration: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            createRegistration: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await registrationApi.create(payload);
                    set(s => ({ registrations: [res.data, ...s.registrations] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            bulkRegister: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await registrationApi.bulkRegister(payload);
                    set(s => ({ registrations: [...res.data.data, ...s.registrations] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            updateRegistrationStatus: async (id, status, remarks) => {
                set({ loading: true, error: null });
                try {
                    const res = await registrationApi.updateStatus(id, { status: status as any, remarks });
                    set(s => ({ registrations: s.registrations.map(r => r.id === id ? res.data : r) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            generateHallTicket: async (id) => {
                set({ loading: true, error: null });
                try {
                    await registrationApi.generateHallTicket(id);
                    await get().fetchRegistrations();
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },

            // ─── SEATING ───────────────────────────────────────
            fetchAllocations: async (examScheduleId) => {
                set({ loading: true, error: null });
                try {
                    const res = await seatingApi.listAllocations(examScheduleId);
                    set({ allocations: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            autoAllocate: async (payload) => {
                set({ loading: true, error: null });
                try {
                    await seatingApi.autoAllocate(payload);
                    await get().fetchAllocations(payload.exam_schedule_id);
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            changeSeat: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await seatingApi.changeSeat(id, payload);
                    set(s => ({ allocations: s.allocations.map(a => a.id === id ? res.data : a) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchAuditLogs: async (allocationId) => {
                set({ loading: true, error: null });
                try {
                    const res = await seatingApi.getAuditLogs(allocationId);
                    set({ allocationAuditLogs: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },

            // ─── INVIGILATION ──────────────────────────────────
            fetchAssignments: async (examScheduleId) => {
                set({ loading: true, error: null });
                try {
                    const res = await invigilationApi.listAssignments(examScheduleId);
                    set({ assignments: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            assignInvigilator: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await invigilationApi.assign(payload);
                    set(s => ({ assignments: [...s.assignments, res.data] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            removeAssignment: async (id) => {
                set({ loading: true, error: null });
                try {
                    await invigilationApi.remove(id);
                    set(s => ({ assignments: s.assignments.filter(a => a.id !== id) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchAvailability: async (date) => {
                set({ loading: true, error: null });
                try {
                    const res = await invigilationApi.listAvailability(date);
                    set({ availability: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            setAvailability: async (payload) => {
                set({ loading: true, error: null });
                try {
                    await invigilationApi.setAvailability(payload);
                    await get().fetchAvailability();
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },

            // ─── ATTENDANCE ────────────────────────────────────
            fetchAttendance: async (examScheduleId) => {
                set({ loading: true, error: null });
                try {
                    const res = await attendanceApi.list(examScheduleId);
                    set({ attendance: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            markAttendance: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await attendanceApi.mark(payload);
                    set(s => ({
                        attendance: s.attendance.some(a => a.student_id === payload.student_id && a.exam_schedule_id === payload.exam_schedule_id)
                            ? s.attendance.map(a => a.student_id === payload.student_id ? res.data : a)
                            : [...s.attendance, res.data]
                    }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            scanQR: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await attendanceApi.scanQR(payload);
                    await get().fetchAttendance(payload.exam_schedule_id);
                    return { message: res.data.message };
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                    return { message: 'QR scan failed.' };
                } finally { set({ loading: false }); }
            },
            bulkMarkAttendance: async (payload) => {
                set({ loading: true, error: null });
                try {
                    await attendanceApi.bulkMark(payload);
                    await get().fetchAttendance(payload.exam_schedule_id);
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },

            // ─── PUBLICATIONS ──────────────────────────────────
            fetchPublications: async () => {
                set({ loading: true, error: null });
                try {
                    const res = await publicationApi.list();
                    set({ publications: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchPublication: async (id) => {
                set({ loading: true, error: null });
                try {
                    const res = await publicationApi.get(id);
                    set({ selectedPublication: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            initiatePublication: async (examId) => {
                set({ loading: true, error: null });
                try {
                    const res = await publicationApi.initiate(examId);
                    set(s => ({ publications: [res.data, ...s.publications] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            advancePublication: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await publicationApi.advance(id, payload);
                    set(s => ({
                        publications: s.publications.map(p => p.id === id ? res.data : p),
                        selectedPublication: s.selectedPublication?.id === id ? res.data : s.selectedPublication,
                    }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            freezePublication: async (id) => {
                set({ loading: true, error: null });
                try {
                    const res = await publicationApi.freeze(id);
                    set(s => ({
                        publications: s.publications.map(p => p.id === id ? res.data : p),
                        selectedPublication: s.selectedPublication?.id === id ? res.data : s.selectedPublication,
                    }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },

            // ─── SCHEDULING ────────────────────────────────────
            fetchSessions: async () => {
                set({ loading: true, error: null });
                try {
                    const res = await schedulingApi.sessions.list();
                    set({ sessions: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            createSession: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await schedulingApi.sessions.create(payload);
                    set(s => ({ sessions: [...s.sessions, res.data] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            updateSession: async (id, payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await schedulingApi.sessions.update(id, payload);
                    set(s => ({ sessions: s.sessions.map(s2 => s2.id === id ? res.data : s2) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            deleteSession: async (id) => {
                set({ loading: true, error: null });
                try {
                    await schedulingApi.sessions.delete(id);
                    set(s => ({ sessions: s.sessions.filter(s2 => s2.id !== id) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            fetchScheduleRooms: async (examScheduleId) => {
                set({ loading: true, error: null });
                try {
                    const res = await schedulingApi.rooms.list(examScheduleId);
                    set({ scheduleRooms: res.data });
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            addScheduleRoom: async (payload) => {
                set({ loading: true, error: null });
                try {
                    const res = await schedulingApi.rooms.add(payload);
                    set(s => ({ scheduleRooms: [...s.scheduleRooms, res.data] }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
            removeScheduleRoom: async (id) => {
                set({ loading: true, error: null });
                try {
                    await schedulingApi.rooms.remove(id);
                    set(s => ({ scheduleRooms: s.scheduleRooms.filter(r => r.id !== id) }));
                } catch (e: any) {
                    set({ error: e?.response?.data?.error || e.message });
                } finally { set({ loading: false }); }
            },
        }),
        { name: 'ExaminationOperationsStore' }
    )
);
