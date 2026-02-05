import { supabase } from './config/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function runTransportAdminParityMigration() {
    console.log('=== Running Transport Admin Parity Migration ===\n');

    try {
        // Read the migration file
        const migrationPath = path.join(__dirname, '../database/migrations/032_transport_admin_parity.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('Executing migration...\n');

        // Execute the migration
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: migrationSQL });

        if (error) {
            console.error('❌ Migration failed:', error);

            // Try running it in parts
            console.log('\n⚙️ Attempting to run migration in parts...\n');

            // Part 1: Grant permissions
            const grantSQL = `
                INSERT INTO public.role_permissions (role_id, permission_id)
                SELECT r.id, p.id 
                FROM public.roles r, public.permissions p
                WHERE r.name = 'TRANSPORT_ADMIN'
                AND p.code IN (
                    'TRANSPORT_SETUP',
                    'TRANSPORT_VIEW',
                    'TRANSPORT_ASSIGN',
                    'TRANSPORT_VIEW_SELF',
                    'TRIP_EXECUTE',
                    'TRIP_VIEW_SELF',
                    'TRIP_MONITOR',
                    'STUDENT_VIEW'
                )
                ON CONFLICT DO NOTHING;
            `;

            // Execute directly via Supabase
            const { error: grantError } = await supabase.rpc('exec_sql', { sql_query: grantSQL });

            if (grantError) {
                console.error('❌ Grant permissions failed:', grantError);
            } else {
                console.log('✅ Permissions granted successfully');
            }
        } else {
            console.log('✅ Migration completed successfully');
        }

        // Verify the permissions
        console.log('\n=== Verifying Transport Admin Permissions ===\n');

        const { data: perms, error: permError } = await supabase
            .from('role_permissions')
            .select('permission:permission_id(code, description), role:role_id(name)')
            .in('role_id', (await supabase.from('roles').select('id').eq('name', 'TRANSPORT_ADMIN')).data?.map((r: any) => r.id) || []);

        if (permError) {
            console.error('❌ Failed to verify permissions:', permError);
        } else {
            console.log('Transport Admin Permissions:');
            const transportPerms = perms?.filter((p: any) =>
                p.permission.code.startsWith('TRANSPORT') ||
                p.permission.code.startsWith('TRIP') ||
                p.permission.code === 'STUDENT_VIEW'
            );

            transportPerms?.forEach((p: any) => {
                console.log(`  ✅ ${p.permission.code}`);
            });

            console.log(`\nTotal transport-related permissions: ${transportPerms?.length || 0}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }

    process.exit(0);
}

runTransportAdminParityMigration().catch(console.error);
