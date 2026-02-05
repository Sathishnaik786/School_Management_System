import { supabase } from '../config/supabase';

async function seedMissingRoles() {
    const rolesToCheck = ['STAFF', 'STUDENT', 'PARENT', 'SUPER_ADMIN'];

    console.log("Checking and seeding missing roles...");

    for (const roleName of rolesToCheck) {
        const { data: existing } = await supabase
            .from('roles')
            .select('id')
            .eq('name', roleName)
            .single();

        if (existing) {
            console.log(`Role '${roleName}' already exists.`);
        } else {
            console.log(`Role '${roleName}' missing. Creating...`);
            const { error } = await supabase
                .from('roles')
                .insert({
                    name: roleName,
                    description: `${roleName.charAt(0) + roleName.slice(1).toLowerCase()} role`
                });

            if (error) {
                console.error(`Failed to create role '${roleName}':`, error.message);
            } else {
                console.log(`Successfully created role '${roleName}'.`);
            }
        }
    }
}

seedMissingRoles();
