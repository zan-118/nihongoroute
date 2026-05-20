-- Migration: Add custom_mnemonic to user_srs and update sync_user_progress RPC
-- Created At: 2026-05-21T00:27:17+07:00

-- 1. Add custom_mnemonic column to user_srs table if not exists
ALTER TABLE public.user_srs ADD COLUMN IF NOT EXISTS custom_mnemonic TEXT DEFAULT NULL;

-- 2. Drop existing sync_user_progress function first to avoid PG error
DROP FUNCTION IF EXISTS public.sync_user_progress(
  TEXT,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  JSONB,
  JSONB,
  JSONB,
  JSONB,
  JSONB
);

-- 3. Create updated sync_user_progress RPC to handle custom_mnemonic
CREATE OR REPLACE FUNCTION public.sync_user_progress(
  p_full_name TEXT,
  p_xp INTEGER,
  p_streak INTEGER,
  p_today_review_count INTEGER,
  p_last_study_date TEXT,
  p_study_days JSONB,
  p_inventory JSONB,
  p_settings JSONB,
  p_srs_updates JSONB,
  p_lesson_updates JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_item JSONB;
  v_old_xp INTEGER;
  v_delta_xp INTEGER;
  v_max_plausible_xp INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current XP from DB
  SELECT xp INTO v_old_xp FROM public.profiles WHERE id = v_user_id;
  
  v_delta_xp := COALESCE(p_xp, 0) - COALESCE(v_old_xp, 0);
  
  -- Anti-Cheat: Never allow XP to decrease
  IF v_delta_xp < 0 THEN v_delta_xp := 0; END IF;

  -- Cap XP gain
  v_max_plausible_xp := (jsonb_array_length(COALESCE(p_srs_updates, '[]'::jsonb)) * 15) + 
                        (jsonb_array_length(COALESCE(p_lesson_updates, '[]'::jsonb)) * 100) + 200;
  
  IF v_delta_xp > v_max_plausible_xp THEN
    v_delta_xp := v_max_plausible_xp;
  END IF;

  -- 1. Update Profile
  UPDATE public.profiles
  SET 
    full_name = p_full_name,
    xp = COALESCE(v_old_xp, 0) + v_delta_xp,
    streak = p_streak,
    today_review_count = p_today_review_count,
    last_study_date = p_last_study_date,
    study_days = p_study_days,
    inventory = p_inventory,
    settings = p_settings,
    updated_at = now()
  WHERE id = v_user_id;

  -- 2. Bulk Upsert SRS
  IF p_srs_updates IS NOT NULL THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_srs_updates)
    LOOP
      IF (v_item->>'is_deleted')::BOOLEAN = true THEN
        DELETE FROM public.user_srs 
        WHERE user_id = v_user_id AND word_id = v_item->>'word_id';
      ELSE
        INSERT INTO public.user_srs (
          user_id,
          word_id,
          repetition,
          interval,
          ease_factor,
          next_review,
          status,
          updated_at,
          custom_mnemonic
        ) VALUES (
          v_user_id,
          v_item->>'word_id',
          (v_item->>'repetition')::INTEGER,
          (v_item->>'interval')::INTEGER,
          (v_item->>'ease_factor')::REAL,
          (v_item->>'next_review')::TIMESTAMPTZ,
          COALESCE(v_item->>'status', 'learning'),
          COALESCE((v_item->>'updated_at')::TIMESTAMPTZ, now()),
          v_item->>'custom_mnemonic'
        )
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
    END LOOP;
  END IF;

  -- 3. Bulk Upsert Lesson Progress
  IF p_lesson_updates IS NOT NULL THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_lesson_updates)
    LOOP
      IF (v_item->>'is_deleted')::BOOLEAN = true THEN
        DELETE FROM public.user_lessons 
        WHERE user_id = v_user_id AND lesson_id = v_item->>'lesson_id';
      ELSE
        INSERT INTO public.user_lessons (
          user_id, lesson_id, is_completed, completed_at, updated_at
        ) VALUES (
          v_user_id,
          v_item->>'lesson_id',
          COALESCE((v_item->>'is_completed')::BOOLEAN, true),
          COALESCE((v_item->>'completed_at')::TIMESTAMPTZ, now()),
          COALESCE((v_item->>'updated_at')::TIMESTAMPTZ, now())
        )
        ON CONFLICT (user_id, lesson_id) 
        DO UPDATE SET
          is_completed = EXCLUDED.is_completed,
          completed_at = EXCLUDED.completed_at,
          updated_at = EXCLUDED.updated_at
        WHERE user_lessons.updated_at < EXCLUDED.updated_at;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;
