import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = ['SUPABASE_URL', 'SUPABASE_KEY'];

requiredEnv.forEach(key => {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

export const env = {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    SUPABASE_URL: process.env.SUPABASE_URL!,
    SUPABASE_KEY: process.env.SUPABASE_KEY!,
};
