-- ==========================================
-- ADD SOCIAL FIELDS TO PROFILES
-- ==========================================

-- 1. Add missing columns for social display
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Update RLS to allow global selection of profiles (for Leaderboard)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- 3. Add index on XP for faster leaderboard queries
CREATE INDEX IF NOT EXISTS profiles_xp_idx ON public.profiles (xp DESC);
