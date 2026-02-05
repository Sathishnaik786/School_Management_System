import dotenv from 'dotenv';
dotenv.config();

const requiredEnv = ['SUPABASE_URL'];

requiredEnv.forEach(key => {
    if (!process.env[key]) {
        console.error(`Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

if (!process.env.SUPABASE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing required environment variable: SUPABASE_KEY or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

export const env = {
    PORT: process.env.PORT || '3000',
    NODE_ENV: process.env.NODE_ENV || 'development',
    SUPABASE_URL: process.env.SUPABASE_URL!,
    // Prioritize the specific Service Role variable if set (common user pattern)
    SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY!,
};
