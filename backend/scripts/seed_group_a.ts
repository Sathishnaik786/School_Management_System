
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function run() {
    const uniqueSuffix = Date.now();
    log(`Starting robust seeding ${uniqueSuffix}`);

    // 1. Setup
    const { data: school } = await supabase.from('schools').select('id').limit(1).single();
    const { data: year } = await supabase.from('academic_years').select('id').eq('school_id', school.id).eq('is_active', true).single();
    const { data: cls } = await supabase.from('classes').insert({ school_id: school.id, name: `UAT-Class-${uniqueSuffix}`, academic_year_id: year.id }).select().single();
    const { data: sec } = await supabase.from('sections').insert({ class_id: cls.id, name: `Sec-A` }).select().single();
    const { data: subject } = await supabase.from('subjects').insert({ school_id: school.id, class_id: cls.id, name: 'UAT-Math' }).select().single();
    const { data: exam } = await supabase.from('exams').insert({ school_id: school.id, academic_year_id: year.id, name: `UAT Exam ${uniqueSuffix}`, start_date: '2026-06-01', end_date: '2026-06-10', status: 'PUBLISHED' }).select().single();
    const { data: sched } = await supabase.from('exam_schedules').insert({ exam_id: exam.id, subject_id: subject.id, exam_date: '2026-06-01', start_time: '09:00:00', end_time: '12:00:00' }).select().single();

    // Student A
    const emailA = `stu.a.${uniqueSuffix}@test.com`;
    const { data: authA } = await supabase.auth.admin.createUser({ email: emailA, password: 'password123', email_confirm: true });
    await supabase.from('users').upsert({ id: authA.user.id, email: emailA, school_id: school.id, full_name: 'Student A', status: 'active', login_status: 'APPROVED' });
    const { data: admA } = await supabase.from('admissions').insert({ school_id: school.id, academic_year_id: year.id, applicant_user_id: authA.user.id, student_name: 'Student A', date_of_birth: '2010-01-01', grade_applied_for: 'X', status: 'approved' }).select().single();
    const { data: stuA } = await supabase.from('students').insert({ school_id: school.id, admission_id: admA.id, student_code: `STU-A-${uniqueSuffix}`, full_name: 'Student A', date_of_birth: '2010-01-01' }).select().single();

    // THE LINK
    const { error: linkErr } = await supabase.from('student_sections').insert({
        student_id: stuA.id,
        section_id: sec.id,
        academic_year_id: year.id
    });
    if (linkErr) throw linkErr;

    // VERIFY LINK BEFORE CALLING ENDPOINT
    const { data: checkLink } = await supabase.from('student_sections').select('*').eq('student_id', stuA.id).eq('section_id', sec.id).single();
    log(`Link verification: ${!!checkLink}`);

    // Call Seed
    const { data: login } = await supabase.auth.signInWithPassword({ email: 'uat.admin.fixed@test.com', password: 'password123' });
    const headers = { Authorization: `Bearer ${login.session.access_token}` };
    const API_URL = `http://localhost:${env.PORT}/api`;

    try {
        const resAtt = await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: sec.id, start_date: '2026-05-01', end_date: '2026-05-10', status: 'Present' }, { headers });
        log(`Attendance Seed: ${JSON.stringify(resAtt.data)}`);
    } catch (err) {
        log(`Attendance Seed Error: ${err.response?.data?.error || err.message}`);
    }

    log(`Setup ready for Exam: ${exam.id}, Student: ${stuA.id}, Section: ${sec.id}`);
}

function log(m) { console.log(`[SEED] ${m}`); }

run();
