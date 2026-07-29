import { supabase } from '../../../config/supabase';

export interface ExamHall {
    id: string;
    school_id: string;
    hall_name: string;
    building?: string;
    floor?: string;
    capacity: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export const ExamHallService = {
    /**
     * List all halls for a school
     */
    async listHalls(schoolId: string) {
        // Fetch halls and check for usage in seating allocations
        const { data, error } = await supabase
            .from('exam_halls')
            .select(`
                *,
                usage_count:exam_seating_allocations(count)
            `)
            .eq('school_id', schoolId)
            .order('hall_name');

        if (error) throw error;

        return (data as any[]).map(hall => ({
            ...hall,
            is_in_use: (hall.usage_count?.[0]?.count || 0) > 0
        })) as ExamHall[];
    },

    /**
     * Create a new hall
     */
    async createHall(hall: Partial<ExamHall> & { school_id: string }) {
        if (!hall.hall_name) throw new Error("Hall name is required.");
        if (!hall.capacity || hall.capacity <= 0) throw new Error("Capacity must be greater than zero.");

        const { data, error } = await supabase
            .from('exam_halls')
            .insert({
                ...hall,
                is_active: hall.is_active ?? true,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data as ExamHall;
    },

    /**
     * Update an existing hall
     */
    async updateHall(id: string, schoolId: string, updates: Partial<ExamHall>) {
        if (updates.capacity !== undefined && updates.capacity <= 0) {
            throw new Error("Capacity must be greater than zero.");
        }

        const { data, error } = await supabase
            .from('exam_halls')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();

        if (error) {
            if (error.message?.includes('CAPACITY_LOCKED')) throw new Error("CAPACITY_LOCKED: Cannot reduce capacity after seating allocation.");
            throw error;
        }
        return data as ExamHall;
    },

    /**
     * Delete a hall
     */
    async deleteHall(id: string, schoolId: string) {
        const { error } = await supabase
            .from('exam_halls')
            .delete()
            .eq('id', id)
            .eq('school_id', schoolId);

        if (error) {
            if (error.message?.includes('HALL_IN_USE')) throw new Error("HALL_IN_USE: Cannot delete hall with existing seating allocations.");
            throw error;
        }
        return { success: true };
    },

    /**
     * Toggle active status
     */
    async toggleActive(id: string, schoolId: string) {
        const { data: current } = await supabase
            .from('exam_halls')
            .select('is_active')
            .eq('id', id)
            .eq('school_id', schoolId)
            .single();

        if (!current) throw new Error("Hall not found.");

        const { data, error } = await supabase
            .from('exam_halls')
            .update({ is_active: !current.is_active, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('school_id', schoolId)
            .select()
            .single();

        if (error) throw error;
        return data as ExamHall;
    }
};
