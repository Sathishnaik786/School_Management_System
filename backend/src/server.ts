import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT || 3000;

const server = app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);

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