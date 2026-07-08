import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { router } from './routes';

export const app = express();

// Enable Trust Proxy (Required for Render/Heroku to get real IP)
app.set('trust proxy', 1);

// Global Middleware
app.use(compression()); // Enable Gzip compression

// Security Headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration (MUST be before Rate Limiter to handle 429 errors correctly)
const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://appsms.netlify.app',
    'https://appsms-076a.onrender.com',
    process.env.FRONTEND_URL || ''
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or postman)
        if (!origin) return callback(null, true);

        const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
        if (isLocal || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased from 100 to 1000 to prevent false positives in dev/demo
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

import { supabase } from './config/supabase';

// Health Check
app.get('/health', async (req, res) => {
    let dbStatus = 'unknown';
    let dbError = null;
    let testUserResult = null;
    const testUserId = 'b125789d-13df-47bf-b44a-f19998c8f64b';

    try {
        const queryRes = await supabase
            .from('users')
            .select('*')
            .eq('id', testUserId)
            .single();

        testUserResult = {
            exact_query: `supabase.from('users').select('*').eq('id', '${testUserId}').single()`,
            selected_columns: '*',
            filters: `id = ${testUserId}`,
            data: queryRes.data,
            error: queryRes.error,
            postgrest_error_code: queryRes.error?.code || null,
            status_code: queryRes.status,
            data_is_null: queryRes.data === null || queryRes.data === undefined
        };

        const { error } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (error) throw error;
        dbStatus = 'connected';
    } catch (e: any) {
        dbStatus = 'error';
        dbError = {
            message: e.message,
            code: e.code,
            details: e.details,
            hint: e.hint
        };
    }

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env_check: {
            supabase_url: process.env.SUPABASE_URL || null,
            supabase_project_ref: process.env.SUPABASE_URL ? (process.env.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase/) || [])[1] || 'unknown' : null,
            supabase_key_set: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
            frontend_url: process.env.FRONTEND_URL
        },
        db_check: {
            status: dbStatus,
            error: dbError
        },
        test_user_result: testUserResult
    });
});

// API Routes
app.use('/api', router);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(`[Error] ${req.method} ${req.path}:`, err);

    // Filter sensitive info from DB errors
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message || 'Something went wrong';

    res.status(err.status || 500).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});
