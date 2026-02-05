import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import { router } from './routes';

export const app = express();

// Global Middleware
app.use(cors({
    origin: true, // Reflect request origin (Permissive for Dev)
    credentials: true
}));
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
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
