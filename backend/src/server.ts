import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT || 3000;

const server = app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);

    // Run historical data cleanup once on boot
    const runDbCleanup = async () => {
        try {
            const { supabase } = await import('./config/supabase');
            const sqlQueries = [
                `UPDATE public.admission_leads 
                 SET counselor_id = (SELECT id FROM public.users WHERE email = 'counselor@edu.in' LIMIT 1), updated_at = NOW() 
                 WHERE counselor_id IS NULL AND (status = 'converted' OR id IN (SELECT lead_id FROM public.admission_applications))`,
                `INSERT INTO public.admission_leads (id, enquiry_id, counselor_id, status, created_at, updated_at)
                 SELECT 
                     uuid_generate_v4(), 
                     e.id, 
                     (SELECT id FROM public.users WHERE email = 'counselor@edu.in' LIMIT 1), 
                     'converted', 
                     NOW(), 
                     NOW()
                 FROM public.admission_enquiries e
                 LEFT JOIN public.admission_leads l ON l.enquiry_id = e.id
                 WHERE e.status = 'converted' AND l.id IS NULL`
            ];
            const { data, error } = await supabase.rpc('exec_transaction_queries', { sql_queries: sqlQueries });
            if (error) {
                console.error('[Startup] DB cleanup RPC error:', error.message);
            } else {
                console.log('[Startup] DB cleanup executed successfully:', data);
            }
        } catch (err: any) {
            console.error('[Startup] DB cleanup error:', err.message);
        }
    };
    runDbCleanup();

    // Diagnostic: Log active project configuration
    try {
        const urlMatch = env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase/);
        const projectRef = urlMatch ? urlMatch[1] : 'unknown';
        console.log(`[Startup] Active SUPABASE_URL: ${env.SUPABASE_URL}`);
        console.log(`[Startup] Active Project Reference: ${projectRef}`);
        console.log(`[Startup] Active Environment: ${env.NODE_ENV}`);
        console.log(`[Startup] Active Port: ${PORT}`);

        const keyParts = env.SUPABASE_KEY.split('.');
        if (keyParts.length === 3) {
            const payload = JSON.parse(Buffer.from(keyParts[1], 'base64').toString());
            console.log(`[Startup] SUPABASE_KEY Role: ${payload.role}`);
            console.log(`[Startup] SUPABASE_KEY Issuer Ref: ${payload.ref}`);
            if (payload.role !== 'service_role') {
                console.error('🚨 CRITICAL ERROR: You are using an ANON key. Please use the SERVICE_ROLE key in Render Environment Variables!');
            }
        }
    } catch (e) {
        console.error('[Startup] Could not parse SUPABASE_KEY. Is it a valid JWT?');
    }
});

// Graceful Shutdown
const shutdown = () => {
    console.log('Shutting down server...');
    server.close(() => {
        console.log('Server closed. Exit.');
        process.exit(0);
    });

    // Force shutdown if taking too long
    setTimeout(() => {
        console.error('Forced shutdown.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);