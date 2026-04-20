-- ==========================================
-- SUPABASE SCHEMA FOR NIHONGOROUTE PROGRESS
-- ==========================================

-- 1. Create Profiles Table (XP, Level, user stats)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create User SRS Table (Word/Card progress)
CREATE TABLE IF NOT EXISTS public.user_srs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'learning', -- misal: 'learning', 'reviewing', 'graduated'
  interval INTEGER NOT NULL DEFAULT 0,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, word_id) -- Ensures a user only has one SRS entry per word
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_srs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- User SRS Policies
CREATE POLICY "Users can view own SRS data" 
ON public.user_srs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SRS data" 
ON public.user_srs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SRS data" 
ON public.user_srs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own SRS data" 
ON public.user_srs FOR DELETE 
USING (auth.uid() = user_id);

-- ==========================================
-- TRIGGERS FOR UPDATED_AT
-- ==========================================

-- Trigger for updating updated_at column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER user_srs_updated_at
BEFORE UPDATE ON public.user_srs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
