-- ═══════════════════════════════════════════════════════════════════════════
-- NihongoRoute - Consolidated Initial Schema
-- Generated: 2026-06-20 from live database 
-- This is the single source-of-truth migration for the entire database.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── EXTENSIONS ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Course Categories
CREATE TABLE public.course_categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    order_number integer DEFAULT 0,
    type text,
    description text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 2. Profiles (Extends auth.users)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    xp integer DEFAULT 0 NOT NULL,
    level integer DEFAULT 1 NOT NULL,
    streak integer DEFAULT 0 NOT NULL,
    today_review_count integer DEFAULT 0 NOT NULL,
    last_study_date text,
    study_days jsonb DEFAULT '{}'::jsonb NOT NULL,
    inventory jsonb DEFAULT '{"streakFreeze": 0}'::jsonb NOT NULL,
    settings jsonb DEFAULT '{"notificationsEnabled": false}'::jsonb NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Kanji Library
CREATE TABLE public.kanji (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    character text NOT NULL UNIQUE,
    english text NOT NULL,
    meaning text NOT NULL,
    onyomi text,
    kunyomi text,
    romaji text,
    jlpt_level varchar,
    grade_level text,
    stroke_order_svg text,
    radicals jsonb DEFAULT '[]'::jsonb,
    mnemonics jsonb DEFAULT '[]'::jsonb,
    examples jsonb DEFAULT '[]'::jsonb,
    show_in_flashcard boolean DEFAULT true,
    frequency_rank integer,
    slug text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 4. Vocab Library
CREATE TABLE public.vocab (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    word text NOT NULL,
    furigana text,
    romaji text,
    hinshi jsonb DEFAULT '[]'::jsonb,
    transitivity text,
    conjugations jsonb DEFAULT '{}'::jsonb,
    is_common boolean DEFAULT false,
    slug text NOT NULL UNIQUE,
    meaning_id text,
    jlpt_level varchar,
    pitch_accent text,
    audio_url text,
    usage_notes text,
    mnemonic text,
    related_kanji jsonb DEFAULT '[]'::jsonb,
    synonyms jsonb DEFAULT '[]'::jsonb,
    antonyms jsonb DEFAULT '[]'::jsonb,
    examples jsonb DEFAULT '[]'::jsonb,
    show_in_flashcard boolean DEFAULT true,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Grammar Library
CREATE TABLE public.grammar (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    meaning text NOT NULL,
    formation text,
    formation_furigana text,
    formation_romaji text,
    notes text,
    jlpt_level varchar,
    slug text NOT NULL UNIQUE,
    examples jsonb DEFAULT '[]'::jsonb,
    order_number integer,
    related_grammar text[],
    grammar_family text,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 6. Lessons
CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid REFERENCES public.course_categories(id),
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    order_number integer DEFAULT 0,
    summary text,
    content text,
    dialogue jsonb DEFAULT '[]'::jsonb,
    content_blocks jsonb DEFAULT '[]'::jsonb,
    vocab_list jsonb DEFAULT '[]'::jsonb,
    kanji_list jsonb DEFAULT '[]'::jsonb,
    grammar_list jsonb DEFAULT '[]'::jsonb,
    listening_list jsonb DEFAULT '[]'::jsonb,
    reading_list jsonb DEFAULT '[]'::jsonb,
    quizzes jsonb DEFAULT '[]'::jsonb,
    estimated_minutes integer DEFAULT 5,
    is_premium boolean DEFAULT false,
    is_published boolean DEFAULT false,
    seo jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'draft'::text
      CHECK (status = ANY (ARRAY['draft','review','approved','published','rejected'])),
    warnings jsonb DEFAULT '[]'::jsonb,
    confidence jsonb DEFAULT '{"level": "high", "reasons": [], "confidence_rank": 3}'::jsonb,
    audit_log jsonb DEFAULT '[]'::jsonb,
    generation_context jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Expressions
CREATE TABLE public.expressions (
    id text PRIMARY KEY,
    text text NOT NULL,
    reading text NOT NULL,
    meanings jsonb,
    common boolean DEFAULT false,
    misc jsonb,
    jlpt_level text,
    indonesia jsonb,
    created_at timestamptz DEFAULT now()
);

-- 8. Radicals
CREATE TABLE public.radicals (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    character text NOT NULL UNIQUE,
    stroke_count integer,
    kangxi_number integer,
    meaning text,
    kanji_list jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- 9. Sentences
CREATE TABLE public.sentences (
    id text PRIMARY KEY,
    japanese text NOT NULL,
    english text,
    indonesia text,
    jlpt_level text,
    furigana text,
    created_at timestamptz DEFAULT now()
);

-- 10. TTS Cache
CREATE TABLE public.tts_cache (
    id text PRIMARY KEY,
    text text NOT NULL,
    voice text NOT NULL,
    rate text NOT NULL,
    audio_url text NOT NULL,
    model_used text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Supporters
CREATE TABLE public.supporters (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    amount numeric NOT NULL,
    message text,
    tier text DEFAULT 'bronze'::text,
    source text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 12. Cheatsheets
CREATE TABLE public.cheatsheets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    category text,
    items jsonb DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 13. User SRS Data
CREATE TABLE public.user_srs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word_id text NOT NULL,
    interval integer DEFAULT 1 NOT NULL,
    repetition integer DEFAULT 0 NOT NULL,
    ease_factor real DEFAULT 2.5 NOT NULL,
    next_review timestamptz,
    status text DEFAULT 'learning' NOT NULL,
    custom_mnemonic text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    UNIQUE(user_id, word_id)
);

-- 14. User Lesson Progress
CREATE TABLE public.user_lessons (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id text NOT NULL,
    is_completed boolean DEFAULT true NOT NULL,
    completed_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, lesson_id)
);

-- 15. User Feedback
CREATE TABLE public.user_feedback (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['bug','suggestion','compliment'])),
    message text NOT NULL,
    route text,
    status text DEFAULT 'pending' NOT NULL CHECK (status = ANY (ARRAY['pending','investigating','resolved','rejected'])),
    admin_reply text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- 16. JLPT Exam Templates
CREATE TABLE public.jlpt_exam_templates (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    title text NOT NULL,
    description text,
    jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5','N4','N3','N2','N1'])),
    time_limit_minutes integer NOT NULL CHECK (time_limit_minutes > 0),
    passing_score integer NOT NULL DEFAULT 90 CHECK (passing_score >= 0),
    is_published boolean NOT NULL DEFAULT false,
    generation_mode text NOT NULL DEFAULT 'fixed' CHECK (generation_mode = ANY (ARRAY['fixed','random_by_quota'])),
    quota_config jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(quota_config) = 'object'),
    category_id uuid REFERENCES public.course_categories(id) ON DELETE SET NULL,
    legacy_sanity_id text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 17. JLPT Passages
CREATE TABLE public.jlpt_passages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5','N4','N3','N2','N1'])),
    session_type text NOT NULL CHECK (session_type = ANY (ARRAY['vocabulary','grammar','reading','listening'])),
    mondai_number integer CHECK (mondai_number IS NULL OR mondai_number > 0),
    title text,
    content_html text,
    transcript_html text,
    audio_path text,
    visual_path text,
    source_label text,
    is_published boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 18. JLPT Questions
CREATE TABLE public.jlpt_questions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5','N4','N3','N2','N1'])),
    session_type text NOT NULL CHECK (session_type = ANY (ARRAY['vocabulary','grammar','reading','listening'])),
    mondai_number integer NOT NULL CHECK (mondai_number > 0),
    question_number integer CHECK (question_number IS NULL OR question_number > 0),
    passage_id uuid REFERENCES public.jlpt_passages(id) ON DELETE SET NULL,
    prompt_html text,
    visual_path text,
    audio_path text,
    choices jsonb NOT NULL CHECK (jsonb_typeof(choices) = 'array'),
    correct_choice_index integer NOT NULL CHECK (correct_choice_index >= 0),
    explanation_html text,
    difficulty integer CHECK (difficulty IS NULL OR (difficulty >= 1 AND difficulty <= 5)),
    source_type text CHECK (source_type IS NULL OR source_type = ANY (ARRAY['vocab','grammar','kanji','listening','reading','custom'])),
    source_id text,
    source_reference text,
    is_published boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 19. JLPT Exam Template Questions (Junction)
CREATE TABLE public.jlpt_exam_template_questions (
    template_id uuid NOT NULL REFERENCES public.jlpt_exam_templates(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.jlpt_questions(id) ON DELETE RESTRICT,
    position integer NOT NULL CHECK (position > 0),
    section_order integer NOT NULL DEFAULT 0 CHECK (section_order >= 0),
    PRIMARY KEY (template_id, question_id),
    UNIQUE (template_id, position)
);

-- 20. User Exam Sessions
CREATE TABLE public.user_exam_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id uuid REFERENCES public.jlpt_exam_templates(id) ON DELETE SET NULL,
    jlpt_level text NOT NULL CHECK (jlpt_level = ANY (ARRAY['N5','N4','N3','N2','N1'])),
    status text NOT NULL DEFAULT 'in_progress' CHECK (status = ANY (ARRAY['in_progress','completed','abandoned'])),
    question_order uuid[] NOT NULL DEFAULT '{}'::uuid[],
    payload_snapshot jsonb NOT NULL,
    answers_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(answers_snapshot) = 'object'),
    score_breakdown jsonb,
    total_score integer CHECK (total_score IS NULL OR total_score >= 0),
    started_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 21. User Exam Answers
CREATE TABLE public.user_exam_answers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id uuid NOT NULL REFERENCES public.user_exam_sessions(id) ON DELETE CASCADE,
    question_id uuid NOT NULL REFERENCES public.jlpt_questions(id) ON DELETE RESTRICT,
    selected_choice_index integer CHECK (selected_choice_index IS NULL OR selected_choice_index >= 0),
    is_correct boolean NOT NULL DEFAULT false,
    answered_at timestamptz,
    UNIQUE (session_id, question_id)
);

-- 22. Community Posts
CREATE TABLE public.community_posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now(),
    likes_users jsonb DEFAULT '[]'::jsonb,
    comments_count integer DEFAULT 0,
    category varchar DEFAULT 'Umum'::character varying
);

-- 23. Community Comments
CREATE TABLE public.community_comments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- 24. Notifications
CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    type varchar NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    post_id uuid REFERENCES public.community_posts(id) ON DELETE CASCADE,
    read boolean DEFAULT false NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 25. Listening Materials
CREATE TABLE public.listening (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    difficulty text,
    estimated_minutes integer DEFAULT 5,
    body text NOT NULL,
    hiragana text,
    translation text,
    audio_url text,
    image_url text,
    video_url text,
    quizzes jsonb DEFAULT '[]'::jsonb,
    seo jsonb DEFAULT '{}'::jsonb,
    jlpt_level text CHECK (jlpt_level IS NULL OR jlpt_level = ANY (ARRAY['N5','N4','N3','N2','N1'])),
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft','review','approved','published','rejected'])),
    warnings jsonb DEFAULT '[]'::jsonb,
    audit_log jsonb DEFAULT '[]'::jsonb,
    confidence jsonb DEFAULT '{"level": "high", "reasons": [], "confidence_rank": 3}'::jsonb,
    generation_context jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- 26. Reading Materials
CREATE TABLE public.reading (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text NOT NULL UNIQUE,
    difficulty text,
    estimated_minutes integer DEFAULT 5,
    body text NOT NULL,
    hiragana text,
    translation text,
    audio_url text,
    image_url text,
    video_url text,
    quizzes jsonb DEFAULT '[]'::jsonb,
    seo jsonb DEFAULT '{}'::jsonb,
    jlpt_level text CHECK (jlpt_level IS NULL OR jlpt_level = ANY (ARRAY['N5','N4','N3','N2','N1'])),
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft','review','approved','published','rejected'])),
    warnings jsonb DEFAULT '[]'::jsonb,
    audit_log jsonb DEFAULT '[]'::jsonb,
    confidence jsonb DEFAULT '{"level": "high", "reasons": [], "confidence_rank": 3}'::jsonb,
    generation_context jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now() NOT NULL
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════

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

-- New User Handler (Triggered by auth.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, xp, level, settings)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    0,
    1,
    '{"notificationsEnabled": false}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
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

-- Community Post Comments Count Trigger
CREATE OR REPLACE FUNCTION public.update_community_post_comments_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_posts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

-- Fungsi trigger untuk mengotomatisasi penyisipan notifikasi saat feedback di-update
CREATE OR REPLACE FUNCTION public.handle_feedback_update_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_type_label text;
    v_status_label text;
BEGIN
    -- Kirim notifikasi jika status atau admin_reply berubah, dan user_id terasosiasi
    IF (OLD.status IS DISTINCT FROM NEW.status OR OLD.admin_reply IS DISTINCT FROM NEW.admin_reply) 
       AND NEW.user_id IS NOT NULL THEN
       
        -- Mapping tipe feedback ke label bahasa Indonesia
        v_type_label := CASE NEW.type
            WHEN 'bug' THEN 'Bug'
            WHEN 'suggestion' THEN 'Saran'
            WHEN 'compliment' THEN 'Pujian'
            ELSE 'Laporan'
        END;

        -- Mapping status feedback ke label bahasa Indonesia
        v_status_label := CASE NEW.status
            WHEN 'pending' THEN 'Menunggu'
            WHEN 'investigating' THEN 'Sedang Diperiksa'
            WHEN 'resolved' THEN 'Selesai'
            WHEN 'rejected' THEN 'Ditolak'
            ELSE NEW.status
        END;

        -- Sisipkan notifikasi baru ke tabel notifications
        INSERT INTO public.notifications (
            user_id,
            sender_id,
            type,
            title,
            message,
            post_id,
            read,
            created_at
        ) VALUES (
            NEW.user_id,
            NULL,
            CASE WHEN NEW.status = 'resolved' THEN 'success' ELSE 'info' END,
            'Tanggapan Masukan',
            'Laporan ' || v_type_label || ' Anda sekarang: [' || v_status_label || '].' || 
            CASE WHEN NEW.admin_reply IS NOT NULL AND NEW.admin_reply <> '' THEN ' Balasan admin: ' || NEW.admin_reply ELSE '' END,
            NULL,
            false,
            now()
        );
    END IF;
    RETURN NEW;
END;
$$;

-- MAIN SYNC RPC (sync_user_progress) - 10-arg version with anti-cheat & daily bonus cap
CREATE OR REPLACE FUNCTION public.sync_user_progress(
  p_full_name text,
  p_xp integer,
  p_streak integer,
  p_today_review_count integer,
  p_last_study_date text,
  p_study_days jsonb,
  p_inventory jsonb,
  p_settings jsonb,
  p_srs_updates jsonb,
  p_lesson_updates jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_old_xp INTEGER;
  v_delta_xp INTEGER;
  v_active_srs_count INTEGER;
  v_active_lesson_count INTEGER;
  v_old_inventory JSONB;
  v_accumulated_bonus_xp INTEGER;
  v_remaining_bonus_xp INTEGER;
  v_bonus_delta INTEGER;
  v_today TEXT;
  v_final_inventory JSONB;
  v_achievement_bonus_xp INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current XP and inventory from DB
  SELECT xp, inventory INTO v_old_xp, v_old_inventory FROM public.profiles WHERE id = v_user_id;

  v_delta_xp := COALESCE(p_xp, 0) - COALESCE(v_old_xp, 0);

  -- Anti-Cheat: Never allow XP to decrease
  IF v_delta_xp < 0 THEN v_delta_xp := 0; END IF;

  -- Count active SRS updates (non-deleted)
  IF p_srs_updates IS NOT NULL AND jsonb_typeof(p_srs_updates) = 'array' THEN
    SELECT COALESCE(count(*), 0) INTO v_active_srs_count
    FROM jsonb_array_elements(p_srs_updates) x
    WHERE NOT COALESCE((x->>'is_deleted')::BOOLEAN, false);
  ELSE
    v_active_srs_count := 0;
  END IF;

  -- Count active Lesson updates (non-deleted)
  IF p_lesson_updates IS NOT NULL AND jsonb_typeof(p_lesson_updates) = 'array' THEN
    SELECT COALESCE(count(*), 0) INTO v_active_lesson_count
    FROM jsonb_array_elements(p_lesson_updates) x
    WHERE NOT COALESCE((x->>'is_deleted')::BOOLEAN, false);
  ELSE
    v_active_lesson_count := 0;
  END IF;

  -- Calculate achievements bonus XP from new achievements compared to old ones
  IF p_inventory IS NOT NULL AND p_inventory->'achievements' IS NOT NULL AND jsonb_typeof(p_inventory->'achievements') = 'array' THEN
    SELECT COALESCE(SUM(
      CASE
        WHEN x->>'id' LIKE '%gold%' THEN 1000
        WHEN x->>'id' LIKE '%silver%' THEN 250
        WHEN x->>'id' LIKE '%bronze%' THEN 50
        ELSE 0
      END
    ), 0) INTO v_achievement_bonus_xp
    FROM jsonb_array_elements(p_inventory->'achievements') x
    WHERE NOT (
      v_old_inventory IS NOT NULL
      AND v_old_inventory->'achievements' IS NOT NULL
      AND jsonb_typeof(v_old_inventory->'achievements') = 'array'
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(v_old_inventory->'achievements') y
        WHERE y->>'id' = x->>'id'
      )
    );
  ELSE
    v_achievement_bonus_xp := 0;
  END IF;

  IF v_achievement_bonus_xp IS NULL THEN
    v_achievement_bonus_xp := 0;
  END IF;

  -- Dynamic Daily Quest / Bonus XP Capping Logic
  v_today := COALESCE(p_last_study_date, to_char(now(), 'YYYY-MM-DD'));

  IF v_old_inventory IS NOT NULL AND v_old_inventory->'daily_bonus_xp' IS NOT NULL AND v_old_inventory->'daily_bonus_xp'->>'date' = v_today THEN
    v_accumulated_bonus_xp := COALESCE((v_old_inventory->'daily_bonus_xp'->>'amount')::INTEGER, 0);
  ELSE
    v_accumulated_bonus_xp := 0;
  END IF;

  -- Remaining allowed bonus XP for today (max 150 per day cumulative)
  v_remaining_bonus_xp := 150 - v_accumulated_bonus_xp;
  IF v_remaining_bonus_xp < 0 THEN v_remaining_bonus_xp := 0; END IF;

  -- The part of delta XP that is bonus (not from SRS/lessons/achievements)
  v_bonus_delta := v_delta_xp - ((v_active_srs_count * 15) + (v_active_lesson_count * 100) + v_achievement_bonus_xp);
  IF v_bonus_delta < 0 THEN v_bonus_delta := 0; END IF;

  -- Cap bonus delta to the remaining daily allowance
  IF v_bonus_delta > v_remaining_bonus_xp THEN
    v_bonus_delta := v_remaining_bonus_xp;
  END IF;

  -- Recompute accepted delta XP
  v_delta_xp := (v_active_srs_count * 15) + (v_active_lesson_count * 100) + v_achievement_bonus_xp + v_bonus_delta;

  -- Update inventory JSONB with the new cumulative daily bonus amount
  v_final_inventory := COALESCE(p_inventory, '{}'::jsonb);
  v_final_inventory := jsonb_set(
    v_final_inventory,
    '{daily_bonus_xp}',
    jsonb_build_object('date', v_today, 'amount', v_accumulated_bonus_xp + v_bonus_delta)
  );

  -- 1. Update Profile
  UPDATE public.profiles
  SET
    full_name = p_full_name,
    xp = COALESCE(v_old_xp, 0) + v_delta_xp,
    streak = p_streak,
    today_review_count = p_today_review_count,
    last_study_date = p_last_study_date,
    study_days = p_study_days,
    inventory = v_final_inventory,
    settings = p_settings,
    updated_at = now()
  WHERE id = v_user_id;

  -- 2. Bulk Set-Based Updates & Deletes for SRS
  IF p_srs_updates IS NOT NULL AND jsonb_typeof(p_srs_updates) = 'array' AND jsonb_array_length(p_srs_updates) > 0 THEN
    -- A. Bulk Delete
    DELETE FROM public.user_srs
    WHERE user_id = v_user_id
      AND word_id IN (
        SELECT value->>'word_id'
        FROM jsonb_array_elements(p_srs_updates)
        WHERE (value->>'is_deleted')::BOOLEAN = true
      );

    -- B. Bulk Upsert
    INSERT INTO public.user_srs (
      user_id, word_id, repetition, interval, ease_factor,
      next_review, status, updated_at, custom_mnemonic
    )
    SELECT
      v_user_id,
      x->>'word_id',
      (x->>'repetition')::INTEGER,
      (x->>'interval')::INTEGER,
      (x->>'ease_factor')::REAL,
      (x->>'next_review')::TIMESTAMPTZ,
      COALESCE(x->>'status', 'learning'),
      COALESCE((x->>'updated_at')::TIMESTAMPTZ, now()),
      x->>'custom_mnemonic'
    FROM jsonb_array_elements(p_srs_updates) x
    WHERE NOT COALESCE((x->>'is_deleted')::BOOLEAN, false)
    ON CONFLICT (user_id, word_id)
    DO UPDATE SET
      repetition = EXCLUDED.repetition,
      interval = EXCLUDED.interval,
      ease_factor = EXCLUDED.ease_factor,
      next_review = EXCLUDED.next_review,
      status = EXCLUDED.status,
      updated_at = EXCLUDED.updated_at,
      custom_mnemonic = EXCLUDED.custom_mnemonic
    WHERE user_srs.updated_at < EXCLUDED.updated_at;
  END IF;

  -- 3. Bulk Set-Based Updates & Deletes for Lesson Progress
  IF p_lesson_updates IS NOT NULL AND jsonb_typeof(p_lesson_updates) = 'array' AND jsonb_array_length(p_lesson_updates) > 0 THEN
    -- A. Bulk Delete
    DELETE FROM public.user_lessons
    WHERE user_id = v_user_id
      AND lesson_id IN (
        SELECT value->>'lesson_id'
        FROM jsonb_array_elements(p_lesson_updates)
        WHERE (value->>'is_deleted')::BOOLEAN = true
      );

    -- B. Bulk Upsert
    INSERT INTO public.user_lessons (
      user_id, lesson_id, is_completed, completed_at, updated_at
    )
    SELECT
      v_user_id,
      x->>'lesson_id',
      COALESCE((x->>'is_completed')::BOOLEAN, true),
      COALESCE((x->>'completed_at')::TIMESTAMPTZ, now()),
      COALESCE((x->>'updated_at')::TIMESTAMPTZ, now())
    FROM jsonb_array_elements(p_lesson_updates) x
    WHERE NOT COALESCE((x->>'is_deleted')::BOOLEAN, false)
    ON CONFLICT (user_id, lesson_id)
    DO UPDATE SET
      is_completed = EXCLUDED.is_completed,
      completed_at = EXCLUDED.completed_at,
      updated_at = EXCLUDED.updated_at
    WHERE user_lessons.updated_at < EXCLUDED.updated_at;
  END IF;

  RETURN jsonb_build_object('success', true, 'accepted_xp', COALESCE(v_old_xp, 0) + v_delta_xp);
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_validate_profile_integrity BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION validate_profile_integrity();

-- User SRS
CREATE TRIGGER set_user_srs_updated_at BEFORE UPDATE ON public.user_srs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER user_srs_updated_at BEFORE UPDATE ON public.user_srs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_protect_srs_logic BEFORE INSERT OR UPDATE ON public.user_srs
  FOR EACH ROW EXECUTE FUNCTION protect_srs_logic();

-- JLPT Exam
CREATE TRIGGER update_jlpt_exam_templates_updated_at BEFORE UPDATE ON public.jlpt_exam_templates
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_jlpt_passages_updated_at BEFORE UPDATE ON public.jlpt_passages
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_jlpt_questions_updated_at BEFORE UPDATE ON public.jlpt_questions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER update_user_exam_sessions_updated_at BEFORE UPDATE ON public.user_exam_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Community Comments → update post comments_count
CREATE TRIGGER update_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION update_community_post_comments_count();

-- Auth trigger (on auth.users)
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User Feedback
CREATE TRIGGER set_user_feedback_updated_at BEFORE UPDATE ON public.user_feedback
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER tr_feedback_update_notification AFTER UPDATE ON public.user_feedback
  FOR EACH ROW EXECUTE FUNCTION public.handle_feedback_update_notification();

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles
CREATE INDEX profiles_xp_idx ON public.profiles USING btree (xp DESC);
CREATE INDEX idx_profiles_xp ON public.profiles USING btree (xp DESC);

-- User SRS
CREATE INDEX idx_user_srs_next_review ON public.user_srs USING btree (next_review);
CREATE INDEX idx_user_srs_user_id ON public.user_srs USING btree (user_id);
CREATE INDEX idx_user_srs_user_next_review ON public.user_srs USING btree (user_id, next_review);

-- User Lessons
CREATE INDEX idx_user_lessons_user_id ON public.user_lessons USING btree (user_id);

-- User Feedback
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback USING btree (user_id);

-- Vocab
CREATE INDEX idx_vocab_word_furigana ON public.vocab USING btree (word, furigana);
CREATE INDEX idx_vocab_jlpt ON public.vocab USING btree (jlpt_level);
CREATE INDEX idx_vocab_furigana ON public.vocab USING btree (furigana);

-- Grammar
CREATE INDEX idx_grammar_slug ON public.grammar USING btree (slug);
CREATE INDEX idx_grammar_jlpt_order ON public.grammar USING btree (jlpt_level, order_number);

-- Kanji
CREATE INDEX idx_kanji_character ON public.kanji USING btree (character);

-- Lessons
CREATE INDEX idx_lessons_category ON public.lessons USING btree (category_id);

-- Course Categories
CREATE INDEX idx_course_categories_order ON public.course_categories USING btree (order_number);

-- Sentences
CREATE INDEX idx_sentences_jlpt_level ON public.sentences USING btree (jlpt_level);
CREATE INDEX idx_sentences_japanese_trgm ON public.sentences USING gin (japanese gin_trgm_ops);

-- JLPT Exam Templates
CREATE INDEX idx_jlpt_exam_templates_published_slug ON public.jlpt_exam_templates USING btree (slug) WHERE is_published = true;
CREATE INDEX idx_jlpt_exam_templates_category_id ON public.jlpt_exam_templates USING btree (category_id);

-- JLPT Passages
CREATE INDEX idx_jlpt_passages_level_session_mondai ON public.jlpt_passages USING btree (jlpt_level, session_type, mondai_number) WHERE is_published = true;

-- JLPT Questions
CREATE INDEX idx_jlpt_questions_level_session_mondai ON public.jlpt_questions USING btree (jlpt_level, session_type, mondai_number) WHERE is_published = true;
CREATE INDEX idx_jlpt_questions_passage_id ON public.jlpt_questions USING btree (passage_id);
CREATE INDEX idx_jlpt_questions_source ON public.jlpt_questions USING btree (source_type, source_id) WHERE source_type IS NOT NULL AND source_id IS NOT NULL;

-- JLPT Exam Template Questions
CREATE INDEX idx_jlpt_exam_template_questions_template_position ON public.jlpt_exam_template_questions USING btree (template_id, position);
CREATE INDEX idx_jlpt_exam_template_questions_question_id ON public.jlpt_exam_template_questions USING btree (question_id);

-- User Exam Sessions
CREATE INDEX idx_user_exam_sessions_user_status_started ON public.user_exam_sessions USING btree (user_id, status, started_at DESC);
CREATE INDEX idx_user_exam_sessions_template_id ON public.user_exam_sessions USING btree (template_id);

-- User Exam Answers
CREATE INDEX idx_user_exam_answers_session_id ON public.user_exam_answers USING btree (session_id);
CREATE INDEX idx_user_exam_answers_question_id ON public.user_exam_answers USING btree (question_id);

-- Notifications
CREATE INDEX idx_notifications_user_id_created_at ON public.notifications USING btree (user_id, created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_srs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanji ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocab ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grammar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheatsheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sentences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tts_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_exam_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jlpt_exam_template_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- User SRS
CREATE POLICY "Users can view their own SRS data" ON public.user_srs FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own SRS data" ON public.user_srs FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own SRS data" ON public.user_srs FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their own SRS data" ON public.user_srs FOR DELETE USING ((select auth.uid()) = user_id);

-- User Lessons
CREATE POLICY "Users can manage own lesson progress" ON public.user_lessons FOR ALL USING ((select auth.uid()) = user_id);

-- User Feedback
CREATE POLICY "Allow public inserts on user_feedback" ON public.user_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can view feedback" ON public.user_feedback FOR SELECT USING (false);
CREATE POLICY "Users can view their own feedback" ON public.user_feedback FOR SELECT USING (auth.uid() = user_id);

-- Public Read: Library Tables
CREATE POLICY "Allow public read access for library" ON public.course_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access for library" ON public.kanji FOR SELECT USING (true);
CREATE POLICY "Allow public read access for library" ON public.vocab FOR SELECT USING (true);
CREATE POLICY "Allow public read access for library" ON public.grammar FOR SELECT USING (true);
CREATE POLICY "Allow public read access for library" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Allow public read access for library" ON public.listening FOR SELECT USING (true);
CREATE POLICY "Allow public read access for library" ON public.reading FOR SELECT USING (true);
CREATE POLICY "Cheatsheets are viewable by everyone" ON public.cheatsheets FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.expressions FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.radicals FOR SELECT USING (true);
CREATE POLICY "Public read" ON public.sentences FOR SELECT USING (true);
CREATE POLICY "Allow public read access to tts_cache" ON public.tts_cache FOR SELECT USING (true);
CREATE POLICY "Allow public select access" ON public.supporters FOR SELECT USING (true);

-- JLPT Exam Policies
CREATE POLICY "Allow public read access for published jlpt exam templates"
  ON public.jlpt_exam_templates FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access for published jlpt passages"
  ON public.jlpt_passages FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access for published jlpt questions"
  ON public.jlpt_questions FOR SELECT USING (is_published = true);
CREATE POLICY "Allow public read access for published jlpt template questions"
  ON public.jlpt_exam_template_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.jlpt_exam_templates template
      JOIN public.jlpt_questions question ON question.id = jlpt_exam_template_questions.question_id
      WHERE template.id = jlpt_exam_template_questions.template_id
        AND template.is_published = true
        AND question.is_published = true
    )
  );

-- User Exam Session Policies
CREATE POLICY "Users can view their own exam sessions"
  ON public.user_exam_sessions FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their own exam sessions"
  ON public.user_exam_sessions FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their own exam sessions"
  ON public.user_exam_sessions FOR UPDATE
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- User Exam Answers Policies
CREATE POLICY "Users can view answers for their own exam sessions"
  ON public.user_exam_answers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.user_exam_sessions exam_session
    WHERE exam_session.id = user_exam_answers.session_id
      AND exam_session.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can insert answers for their own exam sessions"
  ON public.user_exam_answers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_exam_sessions exam_session
    WHERE exam_session.id = user_exam_answers.session_id
      AND exam_session.user_id = (select auth.uid())
  ));
CREATE POLICY "Users can update answers for their own exam sessions"
  ON public.user_exam_answers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.user_exam_sessions exam_session
    WHERE exam_session.id = user_exam_answers.session_id
      AND exam_session.user_id = (select auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_exam_sessions exam_session
    WHERE exam_session.id = user_exam_answers.session_id
      AND exam_session.user_id = (select auth.uid())
  ));

-- Community Posts Policies
CREATE POLICY "Allow anyone to read posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- Community Comments Policies
CREATE POLICY "Allow anyone to read comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to create comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own comments" ON public.community_comments FOR DELETE USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Allow users to read their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own notifications (read status)" ON public.notifications FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to delete their own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- GRANTS
-- ═══════════════════════════════════════════════════════════════════════════

GRANT SELECT ON public.expressions TO anon, authenticated;
GRANT SELECT ON public.listening TO anon, authenticated;
GRANT SELECT ON public.reading TO anon, authenticated;
GRANT SELECT ON public.radicals TO anon, authenticated;
GRANT SELECT ON public.sentences TO anon, authenticated;
GRANT SELECT ON public.jlpt_exam_templates TO anon, authenticated;
GRANT SELECT ON public.jlpt_passages TO anon, authenticated;
GRANT SELECT ON public.jlpt_questions TO anon, authenticated;
GRANT SELECT ON public.jlpt_exam_template_questions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_exam_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_exam_answers TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════════════════════════════════════════

-- TTS Cache Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tts-cache', 'tts-cache', true, 10485760,
  ARRAY['audio/mpeg', 'audio/mp3']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Allow public read access to tts-cache"
  ON storage.objects FOR SELECT USING (bucket_id = 'tts-cache');

-- Exam Assets Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'exam-assets', 'exam-assets', true, 52428800,
  ARRAY['audio/mpeg', 'audio/mp3', 'audio/ogg', 'image/png', 'image/jpeg', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Allow public read access to exam-assets"
  ON storage.objects FOR SELECT USING (bucket_id = 'exam-assets');
