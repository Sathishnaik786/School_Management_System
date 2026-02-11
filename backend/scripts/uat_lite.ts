
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);
const API_URL = `http://localhost:${env.PORT}/api`;

async function run() {
    const uniqueSuffix = Date.now();
    log(`Starting Lite Seeding ${uniqueSuffix}`);

    // Setup
    const { data: school } = await supabase.from('schools').select('id').limit(1).single();
    const { data: year } = await supabase.from('academic_years').select('id').eq('school_id', school.id).eq('is_active', true).single();
    const { data: cls } = await supabase.from('classes').insert({ school_id: school.id, name: `UAT-Class-${uniqueSuffix}`, academic_year_id: year.id }).select().single();
    const { data: subject } = await supabase.from('subjects').insert({ school_id: school.id, class_id: cls.id, name: 'UAT-Math' }).select().single();
    const { data: exam } = await supabase.from('exams').insert({ school_id: school.id, academic_year_id: year.id, name: `UAT Exam ${uniqueSuffix}`, start_date: '2026-06-01', end_date: '2026-06-10', status: 'PUBLISHED' }).select().single();

    const sections = [];
    for (const grp of ['B', 'C']) {
        const { data: sec } = await supabase.from('sections').insert({ class_id: cls.id, name: `Sec-${grp}` }).select().single();
        sections.push({ grp, id: sec.id });
    }

    const students = [];
    for (const item of sections) {
        const email = `stu.${item.grp.toLowerCase()}.${uniqueSuffix}@test.com`;
        const { data: auth } = await supabase.auth.admin.createUser({ email, password: 'password123', email_confirm: true });
        await supabase.from('users').upsert({ id: auth.user.id, email, school_id: school.id, full_name: `Student ${item.grp}`, status: 'active', login_status: 'APPROVED' });
        const { data: adm } = await supabase.from('admissions').insert({ school_id: school.id, academic_year_id: year.id, applicant_user_id: auth.user.id, student_name: `Student ${item.grp}`, date_of_birth: '2010-01-01', grade_applied_for: 'X', status: 'approved' }).select().single();
        const { data: stu } = await supabase.from('students').insert({ school_id: school.id, admission_id: adm.id, student_code: `STU-${item.grp}-${uniqueSuffix}`, full_name: `Student ${item.grp}`, date_of_birth: '2010-01-01' }).select().single();
        await supabase.from('student_sections').insert({ student_id: stu.id, section_id: item.id, academic_year_id: year.id });
        students.push({ grp: item.grp, id: stu.id, sectionId: item.id });
    }

    // Login for Seeding
    const { data: login } = await supabase.auth.signInWithPassword({ email: 'uat.admin.fixed@test.com', password: 'password123' });
    const headers = { Authorization: `Bearer ${login.session.access_token}` };

    const stuB = students.find(s => s.grp === 'B');
    const stuC = students.find(s => s.grp === 'C');

    // Seed B: 50% Attendance
    const today = new Date();
    const fiveDaysAgo = new Date(today); fiveDaysAgo.setDate(today.getDate() - 5);
    const tenDaysAgo = new Date(today); tenDaysAgo.setDate(today.getDate() - 10);
    await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuB.sectionId, start_date: tenDaysAgo.toISOString(), end_date: fiveDaysAgo.toISOString(), status: 'present' }, { headers });
    const fourDaysAgo = new Date(today); fourDaysAgo.setDate(today.getDate() - 4);
    await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuB.sectionId, start_date: fourDaysAgo.toISOString(), end_date: today.toISOString(), status: 'absent' }, { headers });
    await axios.post(`${API_URL}/admin/test/fees/seed`, { student_id: stuB.id, total_fee: 1000, paid_amount: 1000 }, { headers });

    // Seed C: Pending Fees
    await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuC.sectionId, start_date: tenDaysAgo.toISOString(), end_date: today.toISOString(), status: 'present' }, { headers });
    await axios.post(`${API_URL}/admin/test/fees/seed`, { student_id: stuC.id, total_fee: 1000, paid_amount: 0 }, { headers });

    // Validate
    const checkElig = async (sid) => (await axios.get(`${API_URL}/exams/exam-eligibility?examId=${exam.id}&studentId=${sid}`, { headers })).data;

    const resB = await checkElig(stuB.id);
    const resC = await checkElig(stuC.id);

    console.log('--- LITE VALIDATION SUMMARY ---');
    console.table([
        { Student: 'B', Rule: 'Attendance < 75%', Result: resB.eligible ? 'FAIL' : 'PASS', Data: `${resB.attendance_percentage}%` },
        { Student: 'C', Rule: 'Fees Pending', Result: resC.eligible ? 'FAIL' : 'PASS', Status: resC.fees_status }
    ]);
}

function log(m) { console.log(`[LITE] ${m}`); }
run();
