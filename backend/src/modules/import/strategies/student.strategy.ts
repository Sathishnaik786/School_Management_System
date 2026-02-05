import { ImportStrategy, ValidationSummary, ExecutionSummary, FailedRow } from '../import.types';
import { supabase } from '../../../config/supabase';
import { z } from 'zod';

// Schema for a single row
const StudentRowSchema = z.object({
    student_code: z.string().min(1, "Student Code is required"),
    full_name: z.string().min(1, "Full Name is required"),
    gender: z.enum(['Male', 'Female', 'Other'], { errorMap: () => ({ message: "Gender must be Male, Female, or Other" }) }),
    dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of Birth must be YYYY-MM-DD"),
    grade_applied_for: z.string().min(1, "Grade/Class is required")
});

export class StudentImportStrategy implements ImportStrategy {

    async validate(rows: any[], schoolId: string): Promise<ValidationSummary> {
        const result: ValidationSummary = {
            isValid: true,
            totalRows: rows.length,
            validRows: [],
            failedRows: []
        };

        // 1. Bulk verify uniqueness of student_code (Performance optimization)
        const codes = rows.map(r => r.student_code).filter(c => c);

        let existingCodes = new Set<string>();
        if (codes.length > 0) {
            const { data } = await supabase
                .from('students')
                .select('student_code')
                .eq('school_id', schoolId)
                .in('student_code', codes);

            if (data) {
                data.forEach((s: any) => existingCodes.add(s.student_code));
            }
        }

        // 2. Row-by-row validation
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 1;
            const errors: any[] = [];

            // Zod Validation
            // Normalize header keys to lowercase? Assuming headers match schema keys for Phase 1.
            // Map common variances? (Name -> full_name) - skipping for Phase 1 (Strict headers).

            const parsed = StudentRowSchema.safeParse(row);

            if (!parsed.success) {
                parsed.error.errors.forEach(err => {
                    errors.push({
                        row: rowNum,
                        column: err.path.join('.'),
                        message: err.message,
                        value: row[err.path[0] as string]
                    });
                });
            } else {
                // Logic Validation
                if (existingCodes.has(row.student_code)) {
                    errors.push({
                        row: rowNum,
                        column: 'student_code',
                        message: `Student code '${row.student_code}' already exists`,
                        value: row.student_code
                    });
                }
            }

            if (errors.length > 0) {
                result.failedRows.push({ row: rowNum, errors, data: row });
            } else {
                result.validRows.push(row);
            }
        }

        result.isValid = result.failedRows.length === 0;
        return result;
    }

    async execute(validRows: any[], context: { schoolId: string; userId: string; jobId: string }): Promise<ExecutionSummary> {
        const result: ExecutionSummary = {
            totalRows: validRows.length,
            successCount: 0,
            failedCount: 0,
            failedRows: []
        };

        // Execute Sequentially for safety and granular error reporting
        for (let i = 0; i < validRows.length; i++) {
            const row = validRows[i];
            const rowNum = i + 1; // Relative to the valid batch, or we should track original index? For implementation simplicity, tracking index in batch.

            try {
                // 1. Create System Admission
                // We use the ADMIN user as the applicant
                const admissionPayload = {
                    school_id: context.schoolId,
                    academic_year_id: await this.getLatestAcademicYear(context.schoolId), // Dynamic fetch
                    applicant_user_id: context.userId,
                    student_name: row.full_name,
                    date_of_birth: row.dob,
                    gender: row.gender,
                    grade_applied_for: row.grade_applied_for,
                    status: 'approved',
                    submitted_at: new Date()
                };

                const { data: admission, error: admError } = await supabase
                    .from('admissions')
                    .insert(admissionPayload)
                    .select()
                    .single();

                if (admError) throw new Error(`Admission creation failed: ${admError.message}`);

                // 2. Create Student
                const studentPayload = {
                    school_id: context.schoolId,
                    admission_id: admission.id,
                    student_code: row.student_code,
                    full_name: row.full_name,
                    date_of_birth: row.dob,
                    gender: row.gender,
                    status: 'active'
                };

                const { error: stuError } = await supabase
                    .from('students')
                    .insert(studentPayload);

                if (stuError) {
                    // Rollback admission?
                    // Supabase JS doesn't support nested rollback easily without RPC.
                    // We attempt to delete the admission to keep clean state.
                    await supabase.from('admissions').delete().eq('id', admission.id);
                    throw new Error(`Student creation failed: ${stuError.message}`);
                }

                result.successCount++;

            } catch (err: any) {
                result.failedCount++;
                result.failedRows.push({
                    row: rowNum,
                    errors: [{ row: rowNum, message: err.message, value: 'DB_INSERT_FAIL' }],
                    data: row
                });
            }
        }

        return result;
    }

    private async getLatestAcademicYear(schoolId: string): Promise<string> {
        // Cache this ideally?
        const { data } = await supabase
            .from('academic_years')
            .select('id')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();

        if (data) return data.id;

        // Fallback: get any year
        const { data: anyData } = await supabase
            .from('academic_years')
            .select('id')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return anyData?.id || ''; // Should throw if no year exists, but Schema enforces NOT NULL, so insert will fail naturally if empty
    }
}
