-- =======================================================
-- MIGRATION: 018_enhance_fee_structure
-- DESCRIPTION: Adds columns to support detailed fee charts (classes, schedule, discounts).
-- DATE: 2026-01-29
-- =======================================================

ALTER TABLE fee_structures
ADD COLUMN IF NOT EXISTS fee_details TEXT,        -- e.g. "Registration Fees (For new admission only)"
ADD COLUMN IF NOT EXISTS applicable_classes TEXT, -- e.g. "All Classes" or "Nur, LKG"
ADD COLUMN IF NOT EXISTS payment_schedule TEXT,   -- e.g. "One time only", "Per month"
ADD COLUMN IF NOT EXISTS discount_info TEXT;      -- e.g. "Sibling discount 25% applied"

-- Optional: Rename 'name' to 'fee_group' or keep 'name' as internal identifier if needed.
-- We will use 'name' as the main title if 'fee_details' is empty, 
-- or use 'fee_details' as the display text in the chart.

-- =======================================================
-- End of Migration
-- =======================================================
