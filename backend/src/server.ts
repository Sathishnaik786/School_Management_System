import { app } from './app';
import { env } from './config/env';

const PORT = env.PORT || 3000;

const server = app.listen(Number(PORT), () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
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