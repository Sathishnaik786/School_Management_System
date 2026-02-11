
// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY);

async function fix() {
    const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
        CREATE TABLE IF NOT EXISTS public.exam_halls (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
            hall_name TEXT NOT NULL,
            capacity INTEGER NOT NULL CHECK (capacity > 0),
            location TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.exam_halls ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "School users view halls" ON public.exam_halls FOR SELECT USING (school_id = public.get_my_school_id());
    `});

    if (error) console.error('SQL Error:', error.message);
    else console.log('SQL Executed.');
}

fix();
