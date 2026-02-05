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
app.use(helmet());

// CORS Configuration (MUST be before Rate Limiter to handle 429 errors correctly)
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://appsms.netlify.app',
        'https://appsms-076a.onrender.com',
        process.env.FRONTEND_URL || ''
    ].filter(Boolean), // Allow valid origins
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
    try {
        const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
        if (error) throw error;
        dbStatus = 'connected';
    } catch (e: any) {
        dbStatus = 'error';
        dbError = e.message;
    }

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env_check: {
            supabase_url: !!process.env.SUPABASE_URL,
            supabase_key_set: !!(process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
            frontend_url: process.env.FRONTEND_URL
        },
        db_check: {
            status: dbStatus,
            error: dbError
        }
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
