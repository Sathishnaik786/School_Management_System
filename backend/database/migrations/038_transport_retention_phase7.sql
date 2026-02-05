-- Phase 7: Data Retention & Scaling Safeguards
-- Description: Indexes, scheduled cleanup for GPS data, and partitioning strategy.
-- Non-breaking: Adds indexes and cleanup function.

-- ==============================================
-- 1. INDEX REVIEW & OPTIMIZATION
-- ==============================================

-- 1.1 Critical Logs (Infinite Retention)
CREATE INDEX IF NOT EXISTS idx_transport_events_trip_time 
    ON public.transport_trip_events(trip_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_transport_audit_lookup 
    ON public.transport_audit_logs(entity_type, entity_id, changed_at);

-- 1.2 High Volume / Low Value (GPS Pings)
-- This table grows fastest. Needs efficient time-based access.
CREATE INDEX IF NOT EXISTS idx_transport_locations_cleanup 
    ON public.transport_trip_locations(recorded_at);

-- ==============================================
-- 2. SCHEDULING: GPS Retention Policy (7 Days)
-- ==============================================

-- Function to safely prune old GPS data
-- We use a LIMIT to prevent locking the table for too long if backlog is huge
CREATE OR REPLACE FUNCTION public.prune_transport_locations()
RETURNS void AS $$
BEGIN
    -- Delete location pings older than 7 days
    -- Use a CTE to isolate rows to prevent massive transaction lock
    WITH rows_to_delete AS (
        SELECT id FROM public.transport_trip_locations
        WHERE recorded_at < (NOW() - INTERVAL '7 days')
        LIMIT 10000 -- Batch size for safety
    )
    DELETE FROM public.transport_trip_locations
    WHERE id IN (SELECT id FROM rows_to_delete);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- 3. FUTURE PARTITIONING STRATEGY (DOCUMENTATION ONLY)
-- ==============================================

/*
STRATEGY FOR SCALE (10k+ Students):

1. transport_trip_events
   - Partition Key: timestamp (RANGE)
   - Strategy: Monthly Partitions (p2024_01, p2024_02...)
   - Benefit: Fast drop of old event logs if needed (though infinite retention preferred).

2. transport_trip_locations
   - Partition Key: recorded_at (RANGE)
   - Strategy: Weekly Partitions
   - Benefit: Dropping a partition is O(1) vs DELETE which is O(N).
   
MIGRATION PLAN (SAFE):
1. Rename existing table to transport_trip_events_old.
2. Create new partitioned table transport_trip_events_new.
3. Dual-write to both for 24h.
4. Backfill from old to new.
5. Drop old table.
*/

-- ==============================================
-- 4. PG_CRON: Implementation Example (Cloud Database)
-- ==============================================

/*
-- Requires pg_cron extension enabled
SELECT cron.schedule(
    '0 3 * * *', -- Run at 3:00 AM daily
    $$ SELECT public.prune_transport_locations(); $$
);
*/
