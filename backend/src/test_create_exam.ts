import axios from 'axios';
import { supabase } from './config/supabase';

async function getToken() {
    // Find an Admin user
    const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
    if (!adminRole) throw new Error("No admin role");

    const { data: userRole } = await supabase.from('user_roles').select('user_id').eq('role_id', adminRole.id).limit(1).single();

    if (!userRole) throw new Error('No admin user found');

    const { data: user } = await supabase.from('users').select('email').eq('id', userRole.user_id).single();
    console.log('Testing with Admin:', user?.email);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: 'Password123!' // Assuming default test password
    });

    if (error) throw error;
    return data.session.access_token;
}

async function testExamCreate() {
    try {
        const token = await getToken();

        // Get Year
        const { data: year } = await supabase.from('academic_years').select('id').eq('is_active', true).single();
        if (!year) throw new Error("No active year");

        console.log('Creating Exam...');
        const res = await axios.post('http://localhost:3000/api/exams', {
            name: `Test Exam ${Date.now()}`,
            academic_year_id: year.id,
            start_date: '2026-03-01',
            end_date: '2026-03-10'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success:', res.data);

    } catch (err: any) {
        console.error('Test Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
    }
}

testExamCreate();
