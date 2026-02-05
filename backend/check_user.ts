import { supabase } from './src/config/supabase';

async function checkUser() {
    const userId = 'e7182968-f88a-4997-bea0-1714a1a0525d';
    console.log(`Checking user: ${userId}`);

    const { data: authUser, error: authError } = await (supabase as any).auth.admin.getUserById(userId);
    if (authError) {
        console.error('Auth User Error:', authError);
    } else {
        console.log('Auth User Found:', authUser.user.email);
    }

    const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (publicError) {
        console.error('Public User Error:', publicError);
    } else {
        console.log('Public User Found:', publicUser);
    }
}

checkUser();
