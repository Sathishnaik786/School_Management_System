import { supabase } from '../../../../config/supabase';

async function checkRoles() {
    const userId = 'e12cb08e-c28d-4067-a10d-8786a4d46c8d';

    console.log('Querying roles for user...');
    const { data: userRoles, error: urError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

    if (urError) {
        console.error('Error user_roles:', urError);
    } else {
        console.log('user_roles rows:', userRoles);
    }

    console.log('Querying all roles from roles table...');
    const { data: roles, error: rError } = await supabase
        .from('roles')
        .select('*');

    if (rError) {
        console.error('Error roles:', rError);
    } else {
        console.log('roles rows:', roles);
    }
}

checkRoles();
