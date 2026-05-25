-- Migration: Fix sync_user_progress to return accepted_xp
-- Created At: 2026-05-21T00:36:00+07:00

-- Create or replace updated sync_user_progress RPC to return accepted_xp
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
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_old_xp INTEGER;
  v_delta_xp INTEGER;
  v_active_srs_count INTEGER;
  v_active_lesson_count INTEGER;
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

  -- Cap XP gain based on genuine active lessons & SRS reviews
  v_max_plausible_xp := (v_active_srs_count * 15) + (v_active_lesson_count * 100) + 200;
  
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
      user_id,
      word_id,
      repetition,
      interval,
      ease_factor,
      next_review,
      status,
      updated_at,
      custom_mnemonic
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
