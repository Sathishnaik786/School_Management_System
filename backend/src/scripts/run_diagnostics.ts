import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function runDiagnostics() {
    console.log('--- STARTING PRODUCTION DIAGNOSTICS ---\n');

    // 1. Academic Years
    console.log('1. Active Academic Years:');
    const { data: years } = await supabase
        .from('academic_years')
        .select('id, year_label, is_active, status')
        .or('is_active.eq.true,status.eq.ACTIVE');
    console.table(years);

    // For complex queries, we use raw SQL via a temporary function if possible, 
    // or we perform logical joins here. 
    // Given the complexity, let's try to use the existing data to report.

    // 2. Classes and Sections Capacity
    console.log('2. Section Capacity Audit:');
    const { data: sections } = await supabase
        .from('sections')
        .select('id, name, class:class_id(id, name), student_sections(id)');

    if (sections) {
        const capacityData = sections.map((s: any) => ({
            class_name: s.class?.name,
            section_name: s.name,
            current_students: s.student_sections?.length || 0,
            remaining: 15 - (s.student_sections?.length || 0)
        })).sort((a, b) => b.current_students - a.current_students);
        console.table(capacityData.filter(d => d.current_students >= 0));
    }

    // 3. Unassigned Students
    console.log('3. Unassigned Students (Orphans):');
    const { data: orphans } = await supabase
        .from('students')
        .select('id, student_code, admission:admission_id(grade_applied_for), student_sections(id)');

    if (orphans) {
        const unassigned = orphans.filter((s: any) => !s.student_sections || s.student_sections.length === 0);
        const grouped: Record<string, number> = {};
        unassigned.forEach((s: any) => {
            const grade = s.admission?.grade_applied_for || 'Unknown';
            grouped[grade] = (grouped[grade] || 0) + 1;
        });
        console.log('Unassigned Count by Grade:');
        console.table(Object.entries(grouped).map(([grade, count]) => ({ grade, count })));
    }

    // 4. Grade Name Consistency
    console.log('4. Grade Name Consistency Check:');
    const { data: classes } = await supabase.from('classes').select('name');
    const { data: admissions } = await supabase.from('admissions').select('grade_applied_for');

    if (classes && admissions) {
        const classNames = new Set(classes.map(c => c.name));
        const uniqueApplied = new Set(admissions.map(a => a.grade_applied_for));
        const missing: string[] = [];
        uniqueApplied.forEach(g => {
            if (g && !classNames.has(g)) missing.push(g);
        });
        if (missing.length > 0) {
            console.warn('WARNING: Grades in admissions not found in classes table:', missing);
        } else {
            console.log('SUCCESS: All admission grades match existing classes.');
        }
    }

    console.log('\n--- DIAGNOSTICS COMPLETE ---');
}

runDiagnostics().catch(console.error);
