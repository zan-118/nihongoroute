-- Migration: Sync repository migrations with live database resources
-- Created At: 2026-06-09T08:00:00+07:00
--
-- Purpose:
-- - Capture live resources that were used by the app/scripts but missing from
--   earlier checked-in migrations.
-- - Make the progress sync conflict target explicit with a unique index.
-- - Normalize user-owned foreign keys to cascade on auth user deletion.
-- - Keep public content tables RLS-protected while readable by anon/authenticated roles.

-- ---------------------------------------------------------------------------
-- Content/status helper constraints
-- ---------------------------------------------------------------------------

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft'::text,
  ADD COLUMN IF NOT EXISTS warnings jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence jsonb DEFAULT '{"level": "high", "reasons": [], "confidence_rank": 3}'::jsonb,
  ADD COLUMN IF NOT EXISTS audit_log jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS generation_context jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.reading_material
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'published'::text,
  ADD COLUMN IF NOT EXISTS warnings jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence jsonb DEFAULT '{"level": "high", "reasons": [], "confidence_rank": 3}'::jsonb,
  ADD COLUMN IF NOT EXISTS audit_log jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS generation_context jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.listening_material
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'published'::text,
  ADD COLUMN IF NOT EXISTS warnings jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confidence jsonb DEFAULT '{"level": "high", "reasons": [], "confidence_rank": 3}'::jsonb,
  ADD COLUMN IF NOT EXISTS audit_log jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS generation_context jsonb DEFAULT '{}'::jsonb;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'lessons_status_check'
      AND conrelid = 'public.lessons'::regclass
  ) THEN
    ALTER TABLE public.lessons
      ADD CONSTRAINT lessons_status_check
      CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'approved'::text, 'published'::text, 'rejected'::text]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reading_material_status_check'
      AND conrelid = 'public.reading_material'::regclass
  ) THEN
    ALTER TABLE public.reading_material
      ADD CONSTRAINT reading_material_status_check
      CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'approved'::text, 'published'::text, 'rejected'::text]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listening_material_status_check'
      AND conrelid = 'public.listening_material'::regclass
  ) THEN
    ALTER TABLE public.listening_material
      ADD CONSTRAINT listening_material_status_check
      CHECK (status = ANY (ARRAY['draft'::text, 'review'::text, 'approved'::text, 'published'::text, 'rejected'::text]));
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Kanji live-schema compatibility
-- ---------------------------------------------------------------------------

ALTER TABLE public.kanji
  ADD COLUMN IF NOT EXISTS english text,
  ADD COLUMN IF NOT EXISTS frequency_rank integer;

UPDATE public.kanji
SET english = COALESCE(english, meaning)
WHERE english IS NULL;

UPDATE public.kanji
SET meaning = COALESCE(meaning, english)
WHERE meaning IS NULL;

ALTER TABLE public.kanji
  ALTER COLUMN english SET NOT NULL,
  ALTER COLUMN meaning SET NOT NULL;

-- ---------------------------------------------------------------------------
-- Live/public content tables used by app and scripts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.expressions (
  id text PRIMARY KEY,
  text text NOT NULL,
  reading text NOT NULL,
  meanings jsonb,
  common boolean DEFAULT false,
  misc jsonb,
  jlpt_level text,
  created_at timestamptz DEFAULT now(),
  indonesia jsonb
);

CREATE TABLE IF NOT EXISTS public.radicals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  character text NOT NULL UNIQUE,
  stroke_count integer,
  kangxi_number integer,
  meaning text,
  kanji_list jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sentences (
  id text PRIMARY KEY,
  japanese text NOT NULL,
  english text,
  created_at timestamptz DEFAULT now(),
  indonesia text
);

CREATE TABLE IF NOT EXISTS public.tts_cache (
  id text PRIMARY KEY,
  text text NOT NULL,
  voice text NOT NULL,
  rate text NOT NULL,
  audio_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ---------------------------------------------------------------------------
-- User progress integrity
-- ---------------------------------------------------------------------------

-- Ensure ON CONFLICT (user_id, word_id) has a valid unique target.
-- If older environments already accumulated duplicate rows, keep the newest row.
WITH ranked_user_srs AS (
  SELECT
    id,
    row_number() OVER (
      PARTITION BY user_id, word_id
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.user_srs
)
DELETE FROM public.user_srs us
USING ranked_user_srs ranked
WHERE us.id = ranked.id
  AND ranked.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS user_srs_user_id_word_id_key
  ON public.user_srs(user_id, word_id);

-- Normalize auth-owned foreign keys with deletion behavior expected by the app.
DELETE FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = p.id
);

DELETE FROM public.user_srs us
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = us.user_id
);

DELETE FROM public.user_lessons ul
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users u WHERE u.id = ul.user_id
);

UPDATE public.user_feedback uf
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = uf.user_id
  );

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_srs DROP CONSTRAINT IF EXISTS user_srs_user_id_fkey;
ALTER TABLE public.user_srs
  ADD CONSTRAINT user_srs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_lessons DROP CONSTRAINT IF EXISTS user_lessons_user_id_fkey;
ALTER TABLE public.user_lessons
  ADD CONSTRAINT user_lessons_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.user_feedback DROP CONSTRAINT IF EXISTS user_feedback_user_id_fkey;
ALTER TABLE public.user_feedback
  ADD CONSTRAINT user_feedback_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Indexes for current query patterns
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_expressions_common ON public.expressions(common);
CREATE INDEX IF NOT EXISTS idx_expressions_jlpt_level ON public.expressions(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_radicals_character ON public.radicals(character);
CREATE INDEX IF NOT EXISTS idx_sentences_japanese ON public.sentences(japanese);
CREATE INDEX IF NOT EXISTS idx_tts_cache_voice_rate ON public.tts_cache(voice, rate);
CREATE INDEX IF NOT EXISTS idx_tts_cache_created_at ON public.tts_cache(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_srs_user_id ON public.user_srs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_srs_user_next_review ON public.user_srs(user_id, next_review);
CREATE INDEX IF NOT EXISTS idx_user_lessons_user_id ON public.user_lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_vocab_jlpt_level ON public.vocab(jlpt_level);
CREATE INDEX IF NOT EXISTS idx_grammar_jlpt_order ON public.grammar(jlpt_level, order_number);
CREATE INDEX IF NOT EXISTS idx_course_categories_order ON public.course_categories(order_number);

-- ---------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------

ALTER TABLE public.expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_cache ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.expressions TO anon, authenticated;
GRANT SELECT ON public.radicals TO anon, authenticated;
GRANT SELECT ON public.sentences TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'expressions'
      AND policyname = 'Allow public read access for expressions'
  ) THEN
    CREATE POLICY "Allow public read access for expressions"
      ON public.expressions FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'radicals'
      AND policyname = 'Allow public read access for radicals'
  ) THEN
    CREATE POLICY "Allow public read access for radicals"
      ON public.radicals FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sentences'
      AND policyname = 'Allow public read access for sentences'
  ) THEN
    CREATE POLICY "Allow public read access for sentences"
      ON public.sentences FOR SELECT USING (true);
  END IF;
END $$;

-- tts_cache intentionally has RLS enabled without public read policies.
-- App access goes through server-only service-role route handlers/scripts.

-- ---------------------------------------------------------------------------
-- Supabase Storage bucket used by /api/tts and generation scripts
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tts-cache',
  'tts-cache',
  true,
  10485760,
  ARRAY['audio/mpeg', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Allow public read access to tts-cache'
  ) THEN
    CREATE POLICY "Allow public read access to tts-cache"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'tts-cache');
  END IF;
END $$;
