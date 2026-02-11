
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import { env } from '../src/config/env';

// 1. Setup Supabase Admin
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const API_URL = `http://localhost:${env.PORT}/api`;
const ADMIN_EMAIL = `uat.admin.${Date.now()}@school.com`;
const ADMIN_PASS = 'test-admin-123';

const log = (msg: string) => console.log(`[UAT] ${msg}`);

type ReportRow = { Rule: string; Expected: string; Actual: string; Status: 'PASS' | 'FAIL' };
const report: ReportRow[] = [];

async function uat_flow() {
    try {
        log('Starting UAT Validation Phase-T2...');

        // ==========================================
        // 1. SETUP CORE DATA
        // ==========================================
        log('Setting up Core Data...');

        // 1.1 School
        const { data: school, error: err1 } = await supabase.from('schools').select('id').limit(1).single();
        if (err1) throw err1;

        // 1.2 Academic Year
        let { data: year, error: err2 } = await supabase.from('academic_years').select('id').eq('school_id', school.id).eq('is_active', true).maybeSingle();
        if (!year) {
            const { data: newYear, error: err3 } = await supabase.from('academic_years').insert({ school_id: school.id, year_label: 'UAT-2026', is_active: true }).select().single();
            if (err3) throw err3;
            year = newYear;
        }

        // 1.3 Roles
        const { data: studentRole } = await supabase.from('roles').select('id').eq('name', 'STUDENT').single();
        const { data: adminRole } = await supabase.from('roles').select('id').eq('name', 'ADMIN').single();
        if (!studentRole || !adminRole) throw new Error('Roles not found');

        // 1.4 Admin User
        const { data: adminUser, error: adminAuthError } = await supabase.auth.admin.createUser({
            email: ADMIN_EMAIL, password: ADMIN_PASS, email_confirm: true
        });
        if (adminAuthError) throw adminAuthError;
        await supabase.from('users').upsert({ id: adminUser.user.id, email: ADMIN_EMAIL, school_id: school.id, full_name: 'UAT Admin', status: 'active', login_status: 'APPROVED' });
        await supabase.from('user_roles').insert({ user_id: adminUser.user.id, role_id: adminRole.id });

        // 1.5 Class & Subject
        const uniqueSuffix = Date.now();
        const { data: cls } = await supabase.from('classes').insert({ school_id: school.id, name: `UAT-Class-${uniqueSuffix}`, academic_year_id: year.id }).select().single();
        const { data: subject } = await supabase.from('subjects').insert({ school_id: school.id, class_id: cls.id, name: 'UAT-Math', code: 'UMATH101' }).select().single();

        // 1.6 Sections A, B, C
        const sections = [];
        for (const grp of ['A', 'B', 'C']) {
            const { data: sec } = await supabase.from('sections').insert({ class_id: cls.id, name: `Sec-${grp}` }).select().single();
            sections.push({ grp, id: sec.id });
        }

        // 1.7 Exam & Schedule
        const { data: exam } = await supabase.from('exams').insert({
            school_id: school.id, academic_year_id: year.id, name: `UAT Exam ${uniqueSuffix}`,
            start_date: new Date(Date.now() + 86400000).toISOString(), end_date: new Date(Date.now() + 172800000).toISOString(),
            status: 'PUBLISHED', type: 'TERM'
        }).select().single();

        const { data: schedule } = await supabase.from('exam_schedules').insert({
            exam_id: exam.id, subject_id: subject.id, exam_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            start_time: '09:00:00', end_time: '12:00:00', status: 'SCHEDULED'
        }).select().single();

        // 1.8 Exam Hall
        const { data: hall } = await supabase.from('exam_halls').insert({
            school_id: school.id, hall_name: `UAT-Hall-${uniqueSuffix}`, capacity: 10
        }).select().single();

        // ==========================================
        // 2. SETUP STUDENTS
        // ==========================================
        log('Setting up Students...');
        const students = [];
        for (const item of sections) {
            const email = `student.${item.grp.toLowerCase()}.${uniqueSuffix}@test.com`;
            const { data: authUser } = await supabase.auth.admin.createUser({ email, password: 'password123', email_confirm: true });

            await supabase.from('users').upsert({ id: authUser.user.id, email, school_id: school.id, full_name: `Student ${item.grp}`, status: 'active', login_status: 'APPROVED' });
            await supabase.from('user_roles').insert({ user_id: authUser.user.id, role_id: studentRole.id });

            const { data: adm } = await supabase.from('admissions').insert({
                school_id: school.id, academic_year_id: year.id, applicant_user_id: authUser.user.id,
                student_name: `Student ${item.grp}`, date_of_birth: '2010-01-01', gender: 'Male', grade_applied_for: 'X', status: 'approved'
            }).select().single();

            const { data: stu } = await supabase.from('students').insert({
                school_id: school.id, admission_id: adm.id, student_code: `STU-${item.grp}-${uniqueSuffix}`,
                full_name: `Student ${item.grp}`, date_of_birth: '2010-01-01', status: 'active'
            }).select().single();

            await supabase.from('student_parents').insert({ student_id: stu.id, parent_user_id: authUser.user.id, relation: 'guardian' });
            await supabase.from('student_sections').insert({ student_id: stu.id, section_id: item.id, academic_year_id: year.id });

            students.push({ grp: item.grp, id: stu.id, userId: authUser.user.id, sectionId: item.id, email });
        }

        // ==========================================
        // 3. SEEDING (Phase-T1)
        // ==========================================
        log('Seeding Data via Endpoints...');
        const { data: session } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password: ADMIN_PASS });
        const headers = { Authorization: `Bearer ${session.session.access_token}` };

        const today = new Date();
        const tenDaysAgo = new Date(today);
        tenDaysAgo.setDate(today.getDate() - 10);

        // Group A: 100% Att, Paid
        const stuA = students.find(s => s.grp === 'A');
        const { count: countA } = await supabase.from('student_sections').select('*', { count: 'exact', head: true }).eq('section_id', stuA.sectionId);
        log(`DEBUG: Section A (${stuA.sectionId}) has ${countA} students`);

        await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuA.sectionId, start_date: tenDaysAgo.toISOString(), end_date: today.toISOString(), status: 'present' }, { headers });
        await axios.post(`${API_URL}/admin/test/fees/seed`, { student_id: stuA.id, total_fee: 1000, paid_amount: 1000 }, { headers });

        // Group B: 50% Att, Paid
        const stuB = students.find(s => s.grp === 'B');
        const midDate = new Date(tenDaysAgo);
        midDate.setDate(midDate.getDate() + 5);
        await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuB.sectionId, start_date: tenDaysAgo.toISOString(), end_date: midDate.toISOString(), status: 'present' }, { headers });
        const dayAfterMid = new Date(midDate); dayAfterMid.setDate(dayAfterMid.getDate() + 1);
        await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuB.sectionId, start_date: dayAfterMid.toISOString(), end_date: today.toISOString(), status: 'absent' }, { headers });
        await axios.post(`${API_URL}/admin/test/fees/seed`, { student_id: stuB.id, total_fee: 1000, paid_amount: 1000 }, { headers });

        // Group C: 100% Att, Pending
        const stuC = students.find(s => s.grp === 'C');
        await axios.post(`${API_URL}/admin/test/attendance/seed`, { section_id: stuC.sectionId, start_date: tenDaysAgo.toISOString(), end_date: today.toISOString(), status: 'present' }, { headers });
        await axios.post(`${API_URL}/admin/test/fees/seed`, { student_id: stuC.id, total_fee: 1000, paid_amount: 0 }, { headers });

        // ==========================================
        // 4. VALIDATION
        // ==========================================
        log('Validating Results...');

        // 4.1 Admin - Eligibility
        const checkEligibility = async (sid) => {
            const res = await axios.get(`${API_URL}/exams/exam-eligibility?examId=${exam.id}&studentId=${sid}`, { headers });
            return res.data;
        };

        const resA = await checkEligibility(stuA.id);
        const resB = await checkEligibility(stuB.id);
        const resC = await checkEligibility(stuC.id);

        report.push({ Rule: 'A Eligibility', Expected: 'Eligible', Actual: resA.eligible ? 'Eligible' : 'Not Eligible', Status: resA.eligible ? 'PASS' : 'FAIL' });
        report.push({ Rule: 'B Eligibility (Att)', Expected: 'Not Eligible', Actual: !resB.eligible ? 'Not Eligible' : 'Eligible', Status: !resB.eligible ? 'PASS' : 'FAIL' });
        report.push({ Rule: 'C Eligibility (Fee)', Expected: 'Not Eligible', Actual: !resC.eligible ? 'Not Eligible' : 'Eligible', Status: !resC.eligible ? 'PASS' : 'FAIL' });

        // 4.2 Admin - Seating
        log('Generating Seating Allocation...');
        try {
            await axios.post(`${API_URL}/exams/seating/generate`, { examScheduleId: schedule.id }, { headers });

            const { data: seatedA } = await supabase.from('exam_seating_allocations').select('*').eq('student_id', stuA.id).eq('exam_schedule_id', schedule.id).maybeSingle();
            const { data: seatedB } = await supabase.from('exam_seating_allocations').select('*').eq('student_id', stuB.id).eq('exam_schedule_id', schedule.id).maybeSingle();
            const { data: seatedC } = await supabase.from('exam_seating_allocations').select('*').eq('student_id', stuC.id).eq('exam_schedule_id', schedule.id).maybeSingle();

            report.push({ Rule: 'A Seated', Expected: 'Seated', Actual: seatedA ? 'Seated' : 'Not Seated', Status: seatedA ? 'PASS' : 'FAIL' });
            report.push({ Rule: 'B Seated', Expected: 'Not Seated', Actual: !seatedB ? 'Not Seated' : 'Seated', Status: !seatedB ? 'PASS' : 'FAIL' });
            report.push({ Rule: 'C Seated', Expected: 'Not Seated', Actual: !seatedC ? 'Not Seated' : 'Seated', Status: !seatedC ? 'PASS' : 'FAIL' });
        } catch (err) {
            log(`Seating Generation Failed: ${err.message}`);
            report.push({ Rule: 'Seating Flow', Expected: 'Success', Actual: '500 Error (Missing Table)', Status: 'FAIL' });
        }

        // 4.3 Student Experience
        const checkStudentView = async (stu) => {
            const { data: sess } = await supabase.auth.signInWithPassword({ email: stu.email, password: 'password123' });
            try {
                const res = await axios.get(`${API_URL}/exams/hall-ticket?examId=${exam.id}&studentId=${stu.id}`, { headers: { Authorization: `Bearer ${sess.session.access_token}` } });
                return { success: true, data: res.data };
            } catch (err) {
                return { success: false, status: err.response?.status, error: err.response?.data?.error, reasons: err.response?.data?.reasons };
            }
        };

        const vA = await checkStudentView(stuA);
        report.push({ Rule: 'A Hall Ticket', Expected: '200 OK', Actual: vA.success ? '200 OK' : `Error ${vA.status}: ${vA.error}`, Status: vA.success ? 'PASS' : 'FAIL' });

        const vB = await checkStudentView(stuB);
        const bMsg = JSON.stringify(vB.reasons || []).toLowerCase().includes('attendance');
        report.push({ Rule: 'B Hall Ticket (Warning)', Expected: '403 + Att Warning', Actual: `${vB.status} + ${vB.error || 'No Error'}`, Status: (vB.status === 403 && bMsg) ? 'PASS' : 'FAIL' });

        const vC = await checkStudentView(stuC);
        const cMsg = JSON.stringify(vC.reasons || []).toLowerCase().includes('fee') || JSON.stringify(vC.reasons || []).toLowerCase().includes('due');
        report.push({ Rule: 'C Hall Ticket (Warning)', Expected: '403 + Fee Warning', Actual: `${vC.status} + ${vC.error || 'No Error'}`, Status: (vC.status === 403 && cMsg) ? 'PASS' : 'FAIL' });

        console.table(report);

    } catch (err) {
        log(`CRITICAL UAT FAILURE: ${err.message}`);
        console.error(err);
        process.exit(1);
    }
}

uat_flow();
