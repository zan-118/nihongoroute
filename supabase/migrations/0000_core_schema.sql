-- ==========================================
-- NIHONGOROUTE CORE SCHEMA (UNIFIED)
-- ==========================================

-- 1. PROFILES TABLE
-- Menyimpan informasi user, gamifikasi, dan pengaturan.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  today_review_count INTEGER NOT NULL DEFAULT 0,
  last_study_date TEXT, -- Format: YYYY-MM-DD
  study_days JSONB NOT NULL DEFAULT '{}'::jsonb, -- Heatmap data
  inventory JSONB NOT NULL DEFAULT '{"streakFreeze": 0}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{"notificationsEnabled": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. USER SRS TABLE
-- Menyimpan data Spaced Repetition untuk setiap kata/kanji.
CREATE TABLE IF NOT EXISTS public.user_srs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'learning', -- 'learning', 'reviewing', 'graduated'
  repetition INTEGER NOT NULL DEFAULT 0,
  interval INTEGER NOT NULL DEFAULT 1,
  ease_factor REAL NOT NULL DEFAULT 2.5,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT user_srs_user_word_unique UNIQUE(user_id, word_id)
);

-- 3. USER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'compliment')),
  message TEXT NOT NULL,
  route TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==========================================
-- INDEXING FOR PERFORMANCE
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles (xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_srs_next_review ON public.user_srs (user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_user_srs_updated_at ON public.user_srs (updated_at);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_srs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Profiles: Public viewable (for Leaderboard), owner can update
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- SRS: Private to owner
DROP POLICY IF EXISTS "Users can manage own SRS data" ON public.user_srs;
CREATE POLICY "Users can manage own SRS data" ON public.user_srs FOR ALL USING (auth.uid() = user_id);

-- Feedback: Owner can insert, nobody can view (except admins)
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;
CREATE POLICY "Users can insert own feedback" ON public.user_feedback FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ==========================================
-- TRIGGER FUNCTIONS
-- ==========================================

-- 1. Update updated_at automatically
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Validate Profile Integrity (Server-side Logic)
CREATE OR REPLACE FUNCTION validate_profile_integrity()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate level based on XP
  NEW.level := floor(sqrt(NEW.xp / 50)) + 1;
  IF NEW.level > 100 THEN NEW.level := 100; END IF;

  -- Anti-Cheat: Prevent massive XP spikes (> 5000 XP in one sync)
  IF (NEW.xp - OLD.xp) > 5000 THEN
    RAISE EXCEPTION 'Anomaly in XP growth detected. Update rejected.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Protect SRS Logic Integrity
CREATE OR REPLACE FUNCTION protect_srs_logic()
RETURNS TRIGGER AS $$
BEGIN
  -- Clamp Ease Factor within SM-2 safe range
  IF NEW.ease_factor < 1.3 THEN NEW.ease_factor := 1.3;
  ELSIF NEW.ease_factor > 5.0 THEN NEW.ease_factor := 5.0;
  END IF;
  
  -- Prevent negative intervals
  IF NEW.interval < 1 THEN NEW.interval := 1; END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Atomic Sync Function (RPC)
-- Melakukan update Profile dan SRS dalam satu transaksi database.
CREATE OR REPLACE FUNCTION sync_user_progress(
  p_xp INTEGER,
  p_streak INTEGER,
  p_today_review_count INTEGER,
  p_last_study_date TEXT,
  p_study_days JSONB,
  p_inventory JSONB,
  p_settings JSONB,
  p_srs_updates JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_item JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Update Profile
  UPDATE public.profiles
  SET 
    xp = p_xp,
    streak = p_streak,
    today_review_count = p_today_review_count,
    last_study_date = p_last_study_date,
    study_days = p_study_days,
    inventory = p_inventory,
    settings = p_settings,
    updated_at = now()
  WHERE id = v_user_id;

  -- 2. Bulk Upsert SRS
  -- Iterasi melalui array JSON untuk melakukan upsert atau delete setiap kartu
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_srs_updates)
  LOOP
    -- Jika ditandai dihapus, hapus dari database
    IF (v_item->>'is_deleted')::BOOLEAN = true THEN
      DELETE FROM public.user_srs 
      WHERE user_id = v_user_id AND word_id = v_item->>'word_id';
    ELSE
      INSERT INTO public.user_srs (
        user_id, word_id, repetition, interval, ease_factor, next_review, status, updated_at
      ) VALUES (
        v_user_id,
        v_item->>'word_id',
        (v_item->>'repetition')::INTEGER,
        (v_item->>'interval')::INTEGER,
        (v_item->>'ease_factor')::REAL,
        (v_item->>'next_review')::TIMESTAMPTZ,
        v_item->>'status',
        now()
      )
      ON CONFLICT (user_id, word_id) 
      DO UPDATE SET
        repetition = EXCLUDED.repetition,
        interval = EXCLUDED.interval,
        ease_factor = EXCLUDED.ease_factor,
        next_review = EXCLUDED.next_review,
        status = EXCLUDED.status,
        updated_at = now();
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- TRIGGERS
-- ==========================================

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_srs_updated_at BEFORE UPDATE ON public.user_srs FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER tr_validate_profile_integrity BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION validate_profile_integrity();
CREATE TRIGGER tr_protect_srs_logic BEFORE UPDATE OR INSERT ON public.user_srs FOR EACH ROW EXECUTE FUNCTION protect_srs_logic();
