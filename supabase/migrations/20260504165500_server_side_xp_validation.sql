-- Fix C6: Server-Side XP validation and delta merge
-- Replaces absolute XP trust with validated delta XP calculation

CREATE OR REPLACE FUNCTION public.sync_user_progress(
  p_full_name TEXT,
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
  v_old_xp INTEGER;
  v_delta_xp INTEGER;
  v_max_plausible_xp INTEGER;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current XP from DB to calculate delta
  SELECT xp INTO v_old_xp FROM public.profiles WHERE id = v_user_id;
  
  -- Calculate how much XP the client is claiming to have gained
  v_delta_xp := COALESCE(p_xp, 0) - COALESCE(v_old_xp, 0);
  
  -- 1. Anti-Cheat & Multi-device correction
  -- Never allow XP to decrease via sync
  IF v_delta_xp < 0 THEN
    v_delta_xp := 0;
  END IF;

  -- Cap the XP gain based on the number of items synced + buffer for daily missions
  -- 15 XP per card max + 100 XP buffer for local daily missions/achievements
  v_max_plausible_xp := (jsonb_array_length(COALESCE(p_srs_updates, '[]'::jsonb)) * 15) + 100;
  
  IF v_delta_xp > v_max_plausible_xp THEN
    v_delta_xp := v_max_plausible_xp;
  END IF;

  -- 2. Update Profile using the validated server-side delta
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

  -- 3. Bulk Upsert SRS
  FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(p_srs_updates, '[]'::jsonb))
  LOOP
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
        COALESCE((v_item->>'updated_at')::TIMESTAMPTZ, now())
      )
      ON CONFLICT (user_id, word_id) 
      DO UPDATE SET
        repetition = EXCLUDED.repetition,
        interval = EXCLUDED.interval,
        ease_factor = EXCLUDED.ease_factor,
        next_review = EXCLUDED.next_review,
        status = EXCLUDED.status,
        updated_at = EXCLUDED.updated_at
      WHERE user_srs.updated_at < EXCLUDED.updated_at;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('success', true, 'accepted_xp', COALESCE(v_old_xp, 0) + v_delta_xp);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke execute from anon and public explicitly again just in case
REVOKE EXECUTE ON FUNCTION public.sync_user_progress FROM public;
REVOKE EXECUTE ON FUNCTION public.sync_user_progress FROM anon;
GRANT EXECUTE ON FUNCTION public.sync_user_progress TO authenticated;
