import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi, AttendanceRecordPayload, PeriodAttendancePayload } from '../services/attendance.api';

export function useAttendance(sectionId?: string, date?: string) {
    const queryClient = useQueryClient();

    const sessionQuery = useQuery({
        queryKey: ['attendance-session', sectionId, date],
        queryFn: async () => {
            if (!sectionId || !date) return null;
            const res = await attendanceApi.getOrCreateSession({
                school_id: '457bbda3-f542-47dc-9d41-3d7729226f86', // default school_id fallback
                academic_year_id: '8db7f474-3252-475a-bc84-9092be0f8f12', // active year fallback
                grade: 'Grade 10',
                section_id: sectionId,
                date,
            });
            return res.data;
        },
        enabled: !!sectionId && !!date,
    });

    const createSession = useMutation({
        mutationFn: attendanceApi.getOrCreateSession,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-session'] });
        },
    });

    const markSingle = useMutation({
        mutationFn: attendanceApi.markAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-session'] });
        },
    });

    const bulkMark = useMutation({
        mutationFn: attendanceApi.bulkAttendance,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance-session'] });
        },
    });

    const markPeriod = useMutation({
        mutationFn: attendanceApi.markPeriodAttendance,
    });

    return {
        session: sessionQuery.data,
        isLoadingSession: sessionQuery.isLoading,
        createSession: createSession.mutateAsync,
        isCreatingSession: createSession.isPending,
        markSingle: markSingle.mutateAsync,
        bulkMark: bulkMark.mutateAsync,
        isBulking: bulkMark.isPending,
        markPeriod: markPeriod.mutateAsync,
    };
}
