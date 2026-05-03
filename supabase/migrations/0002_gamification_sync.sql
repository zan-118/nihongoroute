-- Add inventory and settings columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{"streakFreeze": 0}'::jsonb NOT NULL,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"notificationsEnabled": false}'::jsonb NOT NULL;
