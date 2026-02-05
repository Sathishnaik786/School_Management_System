/**
 * Fix Transport Admin Permissions
 * Run this script to add missing TRANSPORT_SETUP and TRANSPORT_ASSIGN permissions
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTransportPermissions() {
    console.log('🔧 Fixing Transport Admin Permissions...\n');

    try {
        // Step 1: Ensure permissions exist
        console.log('Step 1: Creating permissions if they don\'t exist...');

        const permissionsToCreate = [
            { code: 'TRANSPORT_SETUP', description: 'Manage transport routes, stops, vehicles, and drivers' },
            { code: 'TRANSPORT_ASSIGN', description: 'Assign students to transport routes' },
            { code: 'TRANSPORT_VIEW_SELF', description: 'View own transport details' }
        ];

        for (const perm of permissionsToCreate) {
            const { data: existing } = await supabase
                .from('permissions')
                .select('id')
                .eq('code', perm.code)
                .single();

            if (!existing) {
                const { error } = await supabase
                    .from('permissions')
                    .insert(perm);

                if (error) {
                    console.log(`  ⚠️  Permission ${perm.code} might already exist`);
                } else {
                    console.log(`  ✅ Created permission: ${perm.code}`);
                }
            } else {
                console.log(`  ℹ️  Permission ${perm.code} already exists`);
            }
        }

        // Step 2: Get TRANSPORT_ADMIN role ID
        console.log('\nStep 2: Finding TRANSPORT_ADMIN role...');
        const { data: role, error: roleError } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'TRANSPORT_ADMIN')
            .single();

        if (roleError || !role) {
            console.error('❌ TRANSPORT_ADMIN role not found!');
            return;
        }
        console.log(`  ✅ Found TRANSPORT_ADMIN role: ${role.id}`);

        // Step 3: Assign permissions to role
        console.log('\nStep 3: Assigning permissions to TRANSPORT_ADMIN role...');

        for (const permCode of ['TRANSPORT_SETUP', 'TRANSPORT_ASSIGN', 'TRANSPORT_VIEW_SELF', 'TRIP_MONITOR']) {
            const { data: permission } = await supabase
                .from('permissions')
                .select('id')
                .eq('code', permCode)
                .single();

            if (permission) {
                const { data: existing } = await supabase
                    .from('role_permissions')
                    .select('*')
                    .eq('role_id', role.id)
                    .eq('permission_id', permission.id)
                    .single();

                if (!existing) {
                    const { error } = await supabase
                        .from('role_permissions')
                        .insert({
                            role_id: role.id,
                            permission_id: permission.id
                        });

                    if (error) {
                        console.log(`  ⚠️  Could not assign ${permCode}: ${error.message}`);
                    } else {
                        console.log(`  ✅ Assigned permission: ${permCode}`);
                    }
                } else {
                    console.log(`  ℹ️  Permission ${permCode} already assigned`);
                }
            }
        }

        // Step 4: Verify
        console.log('\nStep 4: Verifying permissions...');
        const { data: rolePerms } = await supabase
            .from('role_permissions')
            .select(`
                permissions (
                    code,
                    description
                )
            `)
            .eq('role_id', role.id);

        console.log('\n📋 TRANSPORT_ADMIN Role Permissions:');
        rolePerms?.forEach((rp: any) => {
            console.log(`  ✅ ${rp.permissions.code} - ${rp.permissions.description}`);
        });

        console.log('\n✨ Done! Please log out and log back in to refresh your session.');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixTransportPermissions();
