-- 🌀 NihongoRoute - Database Performance & Security Optimization Migration
-- Target: Resolve Supabase security/performance advisor linter warnings

-- ─── 1. SECURE FUNCTIONS WITH search_path ─────────────────────────

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Set Updated At (Legacy Name)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Profile Integrity Validator
CREATE OR REPLACE FUNCTION public.validate_profile_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.level := floor(sqrt(NEW.xp / 50)) + 1;
  IF NEW.level > 100 THEN NEW.level := 100; END IF;
  RETURN NEW;
END;
$$;

-- SRS Logic Protector
CREATE OR REPLACE FUNCTION public.protect_srs_logic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.ease_factor < 1.3 THEN NEW.ease_factor := 1.3;
  ELSIF NEW.ease_factor > 5.0 THEN NEW.ease_factor := 5.0;
  END IF;
  IF NEW.interval < 1 THEN NEW.interval := 1; END IF;
  RETURN NEW;
END;
$$;

-- Vocab Examples Updater
CREATE OR REPLACE FUNCTION public.update_vocab_examples(p_ids uuid[], p_examples jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.vocab AS v
  SET examples = t.examples
  FROM (
    SELECT 
      p_ids[i] AS id, 
      p_examples->(i-1) AS examples
    FROM generate_series(1, array_length(p_ids, 1)) AS i
  ) AS t
  WHERE v.id = t.id;
END;
$$;


-- ─── 2. INDEX FOREIGN KEYS FOR JOINS & CASCADES ───────────────────

CREATE INDEX IF NOT EXISTS idx_exams_category_id ON public.exams(category_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);


-- ─── 3. OPTIMIZE RLS POLICIES FOR PERFORMANCE & CLEANUP DUPLICATES ──

-- Table: public.profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Table: public.user_srs
DROP POLICY IF EXISTS "Users can view their own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can insert their own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can update their own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can delete their own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can view own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can insert own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can update own SRS data" ON public.user_srs;
DROP POLICY IF EXISTS "Users can delete own SRS data" ON public.user_srs;

CREATE POLICY "Users can view their own SRS data" ON public.user_srs FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own SRS data" ON public.user_srs FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own SRS data" ON public.user_srs FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own SRS data" ON public.user_srs FOR DELETE USING ((select auth.uid()) = user_id);

-- Table: public.user_lessons
DROP POLICY IF EXISTS "Users can manage own lesson progress" ON public.user_lessons;

CREATE POLICY "Users can manage own lesson progress" ON public.user_lessons FOR ALL USING ((select auth.uid()) = user_id);

-- Table: public.listening_material
DROP POLICY IF EXISTS "Allow public read access" ON public.listening_material;
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.listening_material;

CREATE POLICY "Allow public read access" ON public.listening_material FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access" ON public.listening_material FOR ALL USING ((select auth.role()) = 'authenticated');

-- Table: public.user_feedback
DROP POLICY IF EXISTS "Allow public inserts on user_feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Only admins can view feedback" ON public.user_feedback;

CREATE POLICY "Allow public inserts on user_feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view feedback" ON public.user_feedback FOR SELECT USING (false);

-- Table: public.grammar
DROP POLICY IF EXISTS "Allow anyone to manage library" ON public.grammar;
DROP POLICY IF EXISTS "Allow public read access for library" ON public.grammar;
DROP POLICY IF EXISTS "Allow anyone to insert grammar" ON public.grammar;
DROP POLICY IF EXISTS "Allow anyone to update grammar" ON public.grammar;
DROP POLICY IF EXISTS "Allow anyone to delete grammar" ON public.grammar;

CREATE POLICY "Allow public read access for library" ON public.grammar FOR SELECT USING (true);
CREATE POLICY "Allow anyone to insert grammar" ON public.grammar FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anyone to update grammar" ON public.grammar FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anyone to delete grammar" ON public.grammar FOR DELETE USING (true);

-- Table: public.kanji
DROP POLICY IF EXISTS "Allow anyone to manage library" ON public.kanji;
DROP POLICY IF EXISTS "Allow public read access for library" ON public.kanji;
DROP POLICY IF EXISTS "Allow anyone to insert kanji" ON public.kanji;
DROP POLICY IF EXISTS "Allow anyone to update kanji" ON public.kanji;
DROP POLICY IF EXISTS "Allow anyone to delete kanji" ON public.kanji;

CREATE POLICY "Allow public read access for library" ON public.kanji FOR SELECT USING (true);
CREATE POLICY "Allow anyone to insert kanji" ON public.kanji FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anyone to update kanji" ON public.kanji FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anyone to delete kanji" ON public.kanji FOR DELETE USING (true);

-- Table: public.reading_material
DROP POLICY IF EXISTS "Allow anyone to manage library" ON public.reading_material;
DROP POLICY IF EXISTS "Allow public read access for library" ON public.reading_material;
DROP POLICY IF EXISTS "Allow anyone to insert reading_material" ON public.reading_material;
DROP POLICY IF EXISTS "Allow anyone to update reading_material" ON public.reading_material;
DROP POLICY IF EXISTS "Allow anyone to delete reading_material" ON public.reading_material;

CREATE POLICY "Allow public read access for library" ON public.reading_material FOR SELECT USING (true);
CREATE POLICY "Allow anyone to insert reading_material" ON public.reading_material FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anyone to update reading_material" ON public.reading_material FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow anyone to delete reading_material" ON public.reading_material FOR DELETE USING (true);
