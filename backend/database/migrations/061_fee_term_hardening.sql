-- =======================================================
-- MIGRATION: 061_fee_term_hardening
-- DESCRIPTION: Implements Term-specific fees and payment allocations for partial payment tracking.
-- =======================================================

BEGIN;

-- 1. Extend Fee Structures with Term
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='fee_structures' AND column_name='term') THEN
        ALTER TABLE public.fee_structures 
        ADD COLUMN term TEXT CHECK (term IN ('Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL', 'OTHER')) DEFAULT 'ANNUAL';
    END IF;
END $$;

-- 2. Create Payment Allocations Table
-- This allows one payment to be split across multiple fee items (e.g. Q1 Tuition + Lab Fee)
CREATE TABLE IF NOT EXISTS public.payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE NOT NULL,
    student_fee_id UUID REFERENCES public.student_fees(id) ON DELETE CASCADE NOT NULL,
    amount_allocated NUMERIC(10, 2) NOT NULL CHECK (amount_allocated > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent double-allocating same payment to same fee (though multiple allocations can exist if amounts differ)
    -- Actually, a single pairing is usually enough unless it's a very complex partial payment.
    UNIQUE (payment_id, student_fee_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_allocations_fee ON public.payment_allocations(student_fee_id);
CREATE INDEX IF NOT EXISTS idx_payment_allocations_payment ON public.payment_allocations(payment_id);

-- 3. Add Paid Amount Cache to Student Fees (Performance)
-- This avoids heavy joins during eligibility checks
ALTER TABLE public.student_fees 
ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS fee_status TEXT CHECK (fee_status IN ('UNPAID', 'PARTIAL', 'PAID')) DEFAULT 'UNPAID';

-- 4. Trigger to Maintain paid_amount and status
CREATE OR REPLACE FUNCTION public.fn_sync_fee_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid NUMERIC(10, 2);
    v_assigned NUMERIC(10, 2);
    v_student_fee_id UUID;
BEGIN
    -- Determine which student_fee to update
    IF TG_OP = 'DELETE' THEN
        v_student_fee_id := OLD.student_fee_id;
    ELSE
        v_student_fee_id := NEW.student_fee_id;
    END IF;

    -- Calculate total paid for this specific fee item
    SELECT COALESCE(SUM(amount_allocated), 0) INTO v_total_paid
    FROM public.payment_allocations
    WHERE student_fee_id = v_student_fee_id;

    -- Get assigned amount
    SELECT assigned_amount INTO v_assigned
    FROM public.student_fees
    WHERE id = v_student_fee_id;

    -- Update student_fees
    UPDATE public.student_fees
    SET 
        paid_amount = v_total_paid,
        fee_status = CASE 
            WHEN v_total_paid <= 0 THEN 'UNPAID'
            WHEN v_total_paid >= v_assigned THEN 'PAID'
            ELSE 'PARTIAL'
        END
    WHERE id = v_student_fee_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_fee_payment_status ON public.payment_allocations;
CREATE TRIGGER trg_sync_fee_payment_status
AFTER INSERT OR UPDATE OR DELETE ON public.payment_allocations
FOR EACH ROW EXECUTE FUNCTION public.fn_sync_fee_payment_status();

-- 5. Backfill existing data
-- For old student_fees, status is UNPAID (default). 
-- If there are payments, they aren't allocated yet. 
-- In Phase 3, we expect new payments to be allocated. 
-- Legacy payments will remain in the pool, but current term eligibility will use allocations.

-- 6. RPC for Atomic Payment + Allocation
-- This is the recommended "Senior Architect" way to ensure partial payments are split correctly
CREATE OR REPLACE FUNCTION public.fn_record_payment_with_allocation(
    p_student_id UUID,
    p_amount NUMERIC(10, 2),
    p_mode TEXT,
    p_ref TEXT,
    p_remarks TEXT,
    p_fee_ids UUID[] -- The fee items to pay for (ordered)
) RETURNS UUID AS $$
DECLARE
    v_payment_id UUID;
    v_remaining NUMERIC(10, 2) := p_amount;
    v_fee_id UUID;
    v_due NUMERIC(10, 2);
    v_allocated NUMERIC(10, 2);
BEGIN
    -- 1. Create Payment
    INSERT INTO public.payments (student_id, amount_paid, payment_mode, reference_no, remarks)
    VALUES (p_student_id, p_amount, p_mode, p_ref, p_remarks)
    RETURNING id INTO v_payment_id;

    -- 2. Allocate across provided fee IDs (Simple FIFO based on array order)
    FOREACH v_fee_id IN ARRAY p_fee_ids
    LOOP
        EXIT WHEN v_remaining <= 0;

        -- Calculate due for this fee
        SELECT (assigned_amount - paid_amount) INTO v_due
        FROM public.student_fees
        WHERE id = v_fee_id;

        IF v_due > 0 THEN
            v_allocated := LEAST(v_remaining, v_due);
            
            INSERT INTO public.payment_allocations (payment_id, student_fee_id, amount_allocated)
            VALUES (v_payment_id, v_fee_id, v_allocated);

            v_remaining := v_remaining - v_allocated;
        END IF;
    END LOOP;

    RETURN v_payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
