import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import { env } from '../config/env';

export interface UserProfile {
    id: string;
    email: string;
    school_id: string;
    full_name: string;
    roles: string[];
    permissions: string[];
    login_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
}

export class SessionService {
    async validateSession(token: string): Promise<UserProfile | null> {
        try {
            // 1. Verify Auth User (validates JWT)
            const { data: authData, error: authError } = await supabase.auth.getUser(token);
            if (authError || !authData.user) {
                console.error('[Session] Supabase Auth validation failed:', authError?.message || 'No user data');
                return null;
            }

            const userId = authData.user.id;

            // 2. Fetch Profile directly via Service Role (bypasses RLS)
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError || !user) {
                console.warn(`[Session] User ${userId} (${authData.user.email}) found in Auth but missing in public.users table.`);
                return null;
            }

            if (user.status !== 'active') {
                console.warn(`[Session] User ${userId} is currently ${user.status}. Access denied.`);
                return null;
            }

            // 3. Fetch Roles & Permissions via recursive joins
            const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select(`
                    roles!inner (
                        name,
                        role_permissions!inner (
                            permissions!inner (
                                code
                            )
                        )
                    )
                `)
                .eq('user_id', userId);

            if (rolesError) {
                console.error('[Session] Error fetching roles/permissions:', rolesError);
            }

            const roles: string[] = [];
            const permissions = new Set<string>();

            rolesData?.forEach((ur: any) => {
                const role = ur.roles;
                if (role) {
                    roles.push(role.name);
                    role.role_permissions?.forEach((rp: any) => {
                        if (rp.permissions?.code) {
                            permissions.add(rp.permissions.code);
                        }
                    });
                }
            });

            const finalProfile = {
                id: user.id,
                email: user.email,
                school_id: user.school_id,
                full_name: user.full_name,
                roles,
                permissions: Array.from(permissions),
                login_status: user.login_status || 'PENDING'
            };

            console.log(`[Session] Validated ${user.email}. Roles: ${roles.join(',')}. Perms Count: ${permissions.size}`);
            return finalProfile;

        } catch (err) {
            console.error('[Session] Unexpected validation error:', err);
            return null;
        }
    }

    getUserClient(token: string): SupabaseClient {
        return createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        });
    }
}

export const sessionService = new SessionService();
