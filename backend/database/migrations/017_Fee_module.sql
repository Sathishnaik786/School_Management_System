-- =======================================================
-- MIGRATION: 017_create_fee_management_tables
-- DESCRIPTION: Creates tables for Fee Structures, Student Fee Assignments, and Payments.
-- DATE: 2026-01-29
-- =======================================================

-- 1. Create Fee Structures Table
-- Defines the types of fees (e.g., "Term 1 Tuition", "Lab Fee")
CREATE TABLE IF NOT EXISTS fee_structures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) NOT NULL,
    name TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Student Fees Table (Assignments)
-- Links a student to a fee structure, creating a "bill" to be paid.
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) NOT NULL,
    fee_structure_id UUID REFERENCES fee_structures(id) NOT NULL,
    assigned_amount DECIMAL(10, 2) NOT NULL, -- Snapshot of amount at assignment time
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Payments Table
-- Records actual transactions.
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(id) NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_mode TEXT NOT NULL, -- 'CASH', 'ONLINE', 'CHEQUE'
    reference_no TEXT,
    remarks TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =======================================================
-- ROW LEVEL SECURITY (RLS)
-- =======================================================

-- Enable RLS on all new tables
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors on re-run
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON fee_structures;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON student_fees;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON payments;

-- Create Policies
-- For MVP: Allow all authenticated users (Staff, Admins, Parents) to read/write these tables.
-- Production Note: You should restrict WRITE access to 'ADMIN' and 'ACCOUNTANT' roles later.
CREATE POLICY "Enable all access for authenticated users" ON fee_structures FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON student_fees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable all access for authenticated users" ON payments FOR ALL USING (auth.role() = 'authenticated');

-- End of Migration
