const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function inspect() {
    console.log("--- Table Inspection via Audit Logs ---");
    
    // Insert list of tables as JSON in audit_logs
    const correlation_id = '00000000-0000-0000-0000-000000001234';
    
    // Clear old audit log first
    await supabase.from('audit_logs').delete().eq('correlation_id', correlation_id);
    
    const { error: err1 } = await supabase.rpc('exec_transaction_queries', {
        sql_queries: [
            `INSERT INTO public.audit_logs (action, entity_name, entity_id, before_state, after_state, correlation_id)
             VALUES (
                 'INSPECT', 
                 'tables', 
                 '00000000-0000-0000-0000-000000000000',
                 NULL,
                 (SELECT json_agg(table_name) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE')::jsonb,
                 '${correlation_id}'
             )`
        ]
    });
    
    if (err1) {
        console.error("Error running SQL:", err1.message);
        return;
    }
    
    // Read it back
    const { data: logs, error: err2 } = await supabase
        .from('audit_logs')
        .select('after_state')
        .eq('correlation_id', correlation_id)
        .limit(1);
        
    if (err2) {
        console.error("Error reading audit logs:", err2.message);
    } else if (logs && logs.length > 0) {
        console.log("Tables list in DB:", logs[0].after_state);
    } else {
        console.log("No audit log entry found");
    }
    
    // Clean up
    await supabase.from('audit_logs').delete().eq('correlation_id', correlation_id);
}

inspect();
