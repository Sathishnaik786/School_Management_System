import { Router } from 'express';
import { checkPermission } from '../../rbac/rbac.middleware';
import { PERMISSIONS } from '../../rbac/permissions';
import { supabase } from '../../config/supabase';

export const feesRouter = Router();

// ======================================
// STRUCTURES (Admin)
// ======================================
feesRouter.get('/structures',
    checkPermission(PERMISSIONS.FEES_VIEW),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        // Optionally filter by academic year from query or assume all
        // Fix: Use 'academic_years' table name for relation, aliased as 'academic_year'
        const { data, error } = await supabase
            .from('fee_structures')
            .select('*, academic_year:academic_years(year_label)')
            .eq('school_id', schoolId);

        if (error) {
            console.error("GET /fees/structures error:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    }
);

feesRouter.post('/structures',
    checkPermission(PERMISSIONS.FEES_SETUP),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const { academic_year_id, name, amount, fee_details, applicable_classes, payment_schedule, discount_info } = req.body;

        const { data, error } = await supabase
            .from('fee_structures')
            .insert({
                school_id: schoolId,
                academic_year_id,
                name,
                amount,
                fee_details,
                applicable_classes,
                payment_schedule,
                discount_info
            })
            .select()
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data);
    }
);

feesRouter.delete('/structures/:id',
    checkPermission(PERMISSIONS.FEES_SETUP),
    async (req, res) => {
        const { id } = req.params;
        const { error } = await supabase.from('fee_structures').delete().eq('id', id);
        if (error) return res.status(500).json({ error: error.message });
        res.json({ message: "Deleted" });
    }
);

// ======================================
// ASSIGNMENT (Admin)
// ======================================
// ======================================
// ASSIGNMENT (Admin)
// ======================================
feesRouter.post('/assign/:studentId',
    checkPermission(PERMISSIONS.FEES_ASSIGN),
    async (req, res) => {
        const { studentId } = req.params;
        const { fee_structure_id, assigned_amount } = req.body;
        const userId = req.context!.user.id;

        try {
            // 1. Fetch Student (for admission_id)
            const { data: student, error: stuError } = await supabase
                .from('students')
                .select('id, admission_id, full_name')
                .eq('id', studentId)
                .single();

            if (stuError || !student) return res.status(404).json({ error: "Student not found" });

            // 2. Fetch Fee Structure Name (for logging)
            const { data: feeStruct } = await supabase
                .from('fee_structures')
                .select('name')
                .eq('id', fee_structure_id)
                .single();

            const feeName = feeStruct?.name || 'Unknown Fee';

            // 3. Assign Fee
            const { data, error } = await supabase
                .from('student_fees')
                .insert({ student_id: studentId, fee_structure_id, assigned_amount })
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });

            // 4. Log to Timeline
            if (student.admission_id) {
                await supabase.from('admission_audit_logs').insert({
                    admission_id: student.admission_id,
                    action: 'FEE_ASSIGNED',
                    performed_by: userId,
                    remarks: `Assigned Fee Structure: ${feeName} - Amount: ${assigned_amount}`
                });
            }

            res.status(201).json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// PAYMENTS
// ======================================
feesRouter.post('/payments',
    checkPermission(PERMISSIONS.PAYMENT_RECORD),
    async (req, res) => {
        const userId = req.context!.user.id;
        const { student_id, amount_paid, payment_mode, reference_no, remarks } = req.body;

        try {
            // 1. Fetch Student (for admission_id)
            const { data: student, error: stuError } = await supabase
                .from('students')
                .select('id, admission_id, full_name')
                .eq('id', student_id)
                .single();

            if (stuError || !student) return res.status(404).json({ error: "Student not found" });

            // 2. Record Payment
            const { data, error } = await supabase
                .from('payments')
                .insert({ student_id, amount_paid, payment_mode, reference_no, remarks })
                .select()
                .single();

            if (error) return res.status(500).json({ error: error.message });

            // 3. Log to Timeline
            if (student.admission_id) {
                await supabase.from('admission_audit_logs').insert({
                    admission_id: student.admission_id,
                    action: 'PAYMENT_RECEIVED',
                    performed_by: userId,
                    remarks: `Payment Received: ${amount_paid} via ${payment_mode} (Ref: ${reference_no || 'N/A'})`
                });
            }

            res.status(201).json(data);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// ADMIN LEDGER (Bulk View)
// ======================================
feesRouter.get('/admin/ledger',
    checkPermission(PERMISSIONS.FEES_VIEW),
    async (req, res) => {
        const schoolId = req.context!.user.school_id;
        const { page = 1, limit = 50, sectionId, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        try {
            // 1. Fetch Students (with pagination)
            // Note: leveraging student_sections to get class info.
            let query = supabase
                .from('students')
                .select(`
                    id, full_name, student_code, 
                    sections:student_sections!inner(
                        section:section_id(name, class:class_id(name))
                    )
                `, { count: 'exact' })
                .eq('school_id', schoolId)
                .eq('status', 'active');

            if (sectionId) {
                query = query.eq('sections.section_id', sectionId);
            }

            if (search) {
                query = query.or(`full_name.ilike.%${search}%,student_code.ilike.%${search}%`);
            }

            query = query.range(offset, offset + Number(limit) - 1);

            const { data: students, count, error } = await query;
            if (error) throw error;

            if (!students || students.length === 0) {
                return res.json({ data: [], meta: { total: 0, page: Number(page), limit: Number(limit) } });
            }

            const studentIds = students.map(s => s.id);

            // 2. Bulk Fetch Fees with Structure Name
            const { data: fees } = await supabase
                .from('student_fees')
                .select('student_id, assigned_amount, fee_structure:fee_structure_id(name)')
                .in('student_id', studentIds);
            const { data: payments } = await supabase.from('payments').select('student_id, amount_paid, remarks').in('student_id', studentIds);

            // 3. Aggregate
            const feeMap: Record<string, number> = {};
            const payMap: Record<string, number> = {};
            const testDataMap: Record<string, boolean> = {};

            fees?.forEach((f: any) => {
                feeMap[f.student_id] = (feeMap[f.student_id] || 0) + Number(f.assigned_amount);
                if (f.fee_structure?.name === 'TEST_ADMIN_SEED') {
                    testDataMap[f.student_id] = true;
                }
            });
            payments?.forEach((p: any) => {
                payMap[p.student_id] = (payMap[p.student_id] || 0) + Number(p.amount_paid);
                if (p.remarks === 'ADMIN_TEST_SEED') {
                    testDataMap[p.student_id] = true;
                }
            });

            // 4. Map Results
            const ledger = students.map((s: any) => {
                const total = feeMap[s.id] || 0;
                const paid = payMap[s.id] || 0;
                // Just take the first section found (current active)
                const sectionData = s.sections?.[0]?.section;

                return {
                    id: s.id,
                    full_name: s.full_name,
                    student_code: s.student_code,
                    class_name: sectionData?.class?.name || '-',
                    section_name: sectionData?.name || '-',
                    total_fee: total,
                    total_paid: paid,
                    balance: total - paid,
                    is_test_data: !!testDataMap[s.id]
                };
            });

            res.json({
                data: ledger,
                meta: {
                    total: count,
                    page: Number(page),
                    limit: Number(limit)
                }
            });

        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
);

// ======================================
// VIEWS (Student Ledger)
// ======================================
feesRouter.get('/student/:studentId',
    // Check PERMISSIONS.FEES_VIEW (Staff) OR check if Parent owns student
    // For simplicity, we use a middleware or custom logic.
    // Let's use checkPermission for Basic Access, then custom logic if needed? 
    // Actually, Parents hit `/my` endpoint usually. This is for Admin View.
    checkPermission(PERMISSIONS.FEES_VIEW),
    async (req, res) => {
        const { studentId } = req.params;

        // 1. Get Assigned Fees
        const { data: fees } = await supabase
            .from('student_fees')
            .select(`
                id, assigned_amount,
                fee_structure:fee_structure_id(name, amount)
            `)
            .eq('student_id', studentId);

        // 2. Get Payments
        const { data: payments } = await supabase
            .from('payments')
            .select('*')
            .eq('student_id', studentId)
            .order('payment_date', { ascending: false });

        const totalFees = fees?.reduce((sum, f) => sum + Number(f.assigned_amount), 0) || 0;
        const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;
        const balance = totalFees - totalPaid;

        res.json({
            fees: fees || [],
            payments: payments || [],
            summary: {
                totalFees,
                totalPaid,
                balance
            }
        });
    }
);

feesRouter.get('/my',
    checkPermission(PERMISSIONS.DASHBOARD_VIEW_PARENT),
    async (req, res) => {
        const userId = req.context!.user.id;

        // 1. Get Children
        const { data: links } = await supabase.from('student_parents').select('student_id').eq('parent_user_id', userId);
        if (!links || links.length === 0) return res.json([]);

        const results = [];

        for (const link of links) {
            const sid = link.student_id;
            // Reuse logic (could be refactored to helper)
            const { data: fees } = await supabase
                .from('student_fees')
                .select('assigned_amount, fee_type, status, fee_structure:fee_structure_id(name)')
                .eq('student_id', sid);
            const { data: payments } = await supabase.from('payments').select('*').eq('student_id', sid);
            const { data: student } = await supabase.from('students').select('full_name, student_code').eq('id', sid).single();

            const totalFees = fees?.reduce((sum, f) => sum + Number(f.assigned_amount), 0) || 0;
            const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount_paid), 0) || 0;

            results.push({
                student: student,
                fees,
                payments,
                summary: { totalFees, totalPaid, balance: totalFees - totalPaid }
            });
        }

        res.json(results);
    }
);
