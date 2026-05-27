-- Migration: Create supporters table for real-time payment gateway integration
-- Created At: 2026-05-27T12:19:00+07:00

CREATE TABLE IF NOT EXISTS public.supporters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    message TEXT,
    tier TEXT DEFAULT 'bronze', -- 'gold' | 'silver' | 'bronze'
    source TEXT NOT NULL,       -- 'trakteer' | 'saweria'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;

-- Allow public read access (SELECT only) for real-time UI rendering
CREATE POLICY "Allow public select access" 
ON public.supporters 
FOR SELECT 
USING (true);
