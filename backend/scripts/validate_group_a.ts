
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const API_URL = `http://localhost:${env.PORT}/api`;

async function validate() {
    log('Starting Phase-T2 Validation...');

    // 1. Find Data (Use latest created for testing)
    const { data: stu } = await supabase.from('students').select('*').order('created_at', { ascending: false }).limit(1).single();
    const { data: exam } = await supabase.from('exams').select('*').order('created_at', { ascending: false }).limit(1).single();
    const { data: schedule } = await supabase.from('exam_schedules').select('*').eq('exam_id', exam.id).single();
    const { data: authUser } = await supabase.from('users').select('email').eq('id', stu.admission_id).maybeSingle(); // Incorrect link, but I know StuA email from context if needed.
    // Actually I'll use fixed admin for generation.

    log(`Testing Student ${stu.full_name} (${stu.id}) for Exam ${exam.name} (${exam.id})`);

    const { data: login } = await supabase.auth.signInWithPassword({ email: 'uat.admin.fixed@test.com', password: 'password123' });
    const headers = { Authorization: `Bearer ${login.session.access_token}` };

    // 1. Eligibility Check
    const resElig = await axios.get(`${API_URL}/exams/exam-eligibility?examId=${exam.id}&studentId=${stu.id}`, { headers });
    log(`Eligibility: ${resElig.data.eligible} (Pct: ${resElig.data.attendance_percentage}%)`);

    // 2. Hall Ticket Before Seating
    try {
        await axios.get(`${API_URL}/exams/hall-ticket?examId=${exam.id}&studentId=${stu.id}`, { headers });
    } catch (err) {
        log(`Hall Ticket (Pre-Seating): ${err.response?.data?.error} (Code: ${err.response?.data?.code})`);
    }

    // 3. Generate Seating
    const resSeat = await axios.post(`${API_URL}/exams/seating/generate`, { examScheduleId: schedule.id }, { headers });
    log(`Seating Generation: ${resSeat.data.message} (Count: ${resSeat.data.count})`);

    // 4. Hall Ticket After Seating
    const resHT = await axios.get(`${API_URL}/exams/hall-ticket?examId=${exam.id}&studentId=${stu.id}`, { headers });
    log(`Hall Ticket (Post-Seating): 200 OK. Student: ${resHT.data.student.full_name}, Seat: ${resHT.data.schedules[0].seat_number}`);

    console.log('--- TEST SUMMARY ---');
    console.table([
        { Metric: 'Attendance', Expected: '>= 75%', Actual: `${resElig.data.attendance_percentage}%`, Status: resElig.data.attendance_percentage >= 75 ? 'PASS' : 'FAIL' },
        { Metric: 'Eligibility', Expected: 'true', Actual: resElig.data.eligible.toString(), Status: resElig.data.eligible ? 'PASS' : 'FAIL' },
        { Metric: 'Seating', Expected: '1 Allocation', Actual: `${resSeat.data.count} Allocation`, Status: resSeat.data.count === 1 ? 'PASS' : 'FAIL' },
        { Metric: 'Hall Ticket', Expected: 'Success', Actual: 'Success', Status: 'PASS' }
    ]);
}

function log(m) { console.log(`[VAL] ${m}`); }
validate();
