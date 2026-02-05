import axios from 'axios';
import { supabase } from './config/supabase';

// Mock token generator for testing
async function getToken(email: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: 'Password123!'
    });
    if (error) throw error;
    return data.session.access_token;
}

async function testAttendance() {
    try {
        console.log('Logging in as faculty...');
        const token = await getToken('faculty1@school.com');

        // 1. Get Sections
        console.log('Fetching sections...');
        const secRes = await axios.get('http://localhost:3000/api/academic/sections/my', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Sections:', secRes.data.map((s: any) => `${s.section.name} (${s.section.id})`));

        if (secRes.data.length === 0) {
            console.error('No sections found! Cannot test attendance.');
            return;
        }

        const sectionId = secRes.data[0].section.id;
        const academicYearId = secRes.data[0].section.class.academic_year.id || 'b5250422-9226-4074-a690-349079de6fa8'; // fallback

        // 2. Fetch Students
        console.log('Fetching students...');
        const stuRes = await axios.get(`http://localhost:3000/api/students?sectionId=${sectionId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const students = stuRes.data;
        console.log(`Found ${students.length} students`);

        if (students.length === 0) {
            console.error('No students in section!');
            return;
        }

        // 3. Create Session
        console.log('Creating session...');
        const sessionRes = await axios.post('http://localhost:3000/api/attendance/session', {
            academic_year_id: academicYearId, // Ensure this ID is valid
            section_id: sectionId,
            date: new Date().toISOString().split('T')[0]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const session = sessionRes.data;
        console.log('Session ID:', session.id);

        // 4. Mark Records
        console.log('Marking records...');
        const records = students.map((s: any) => ({
            student_id: s.id,
            status: 'present'
        }));

        const markRes = await axios.post(`http://localhost:3000/api/attendance/session/${session.id}/records`, {
            records
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Success:', markRes.data);

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

testAttendance();
