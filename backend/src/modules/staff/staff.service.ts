import { supabase } from '../../config/supabase';
import { getPaginationRange, applySearch, createPaginatedResult } from '../../utils/queryHelpers';

export const StaffService = {
    async getAllProfiles(schoolId: string, page: number = 1, limit: number = 10, search?: string) {
        let query = supabase
            .from('staff_profiles')
            .select(`
                *,
                user:user_id!inner (id, full_name, email, school_id),
                department:department_id (id, name)
            `, { count: 'exact' })
            .eq('user.school_id', schoolId);

        if (search) {
            query = applySearch(query, search, ['staff_type']);
        }

        const { from, to } = getPaginationRange(page, limit);
        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, count, error } = await query;
        if (error) throw error;

        return createPaginatedResult(data, count, page, limit);
    },

    async createProfile(data: any) {
        // Check if user is STAFF
        // (Optional: We could enforce role check here, but typically admin selects user)
        // Checking connection

        // Check duplicate
        const { data: existing } = await supabase
            .from('staff_profiles')
            .select('id')
            .eq('user_id', data.user_id)
            .maybeSingle();

        if (existing) throw new Error('Profile already exists for this user');

        const { data: profile, error } = await supabase
            .from('staff_profiles')
            .insert(data)
            .select()
            .single();

        if (error) throw error;
        return profile;
    },

    async updateProfile(id: string, updates: any) {
        const { data, error } = await supabase
            .from('staff_profiles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('staff_profiles')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
