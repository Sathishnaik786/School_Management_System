import { supabase } from '../../config/supabase';

export const NotificationService = {
    async send(userId: string, title: string, body: string, metadata: any = {}) {
        try {
            await supabase.from('notifications').insert({
                user_id: userId,
                title,
                body,
                metadata
            });
            // Here we would also trigger SMS/Push via Twilio/FCM
        } catch (error) {
            console.error("Notification Failed", error);
        }
    },

    async notifyRouteSubscribers(routeId: string, title: string, body: string) {
        // Find all parents of students in this route
        // 1. Get students on route
        const { data: assignments } = await supabase
            .from('transport_student_assignment')
            .select('student_id')
            .eq('route_id', routeId);

        if (!assignments?.length) return;

        const studentIds = assignments.map((a: any) => a.student_id);

        // 2. Get parents
        const { data: links } = await supabase
            .from('student_parents')
            .select('parent_user_id')
            .in('student_id', studentIds);

        if (!links?.length) return;

        // 3. Deduplicate (Parents with multiple kids on same bus)
        const parentIds = [...new Set(links.map((l: any) => l.parent_user_id))];

        // 4. Batch Insert
        const notifications = parentIds.map(uid => ({
            user_id: uid,
            title,
            body,
            metadata: { route_id: routeId }
        }));

        await supabase.from('notifications').insert(notifications);
    },

    async notifyStudentParents(studentId: string, title: string, body: string) {
        const { data: links } = await supabase
            .from('student_parents')
            .select('parent_user_id')
            .eq('student_id', studentId);

        if (!links?.length) return;

        const notifications = links.map((l: any) => ({
            user_id: l.parent_user_id,
            title,
            body,
            metadata: { student_id: studentId }
        }));

        await supabase.from('notifications').insert(notifications);
    }
};
