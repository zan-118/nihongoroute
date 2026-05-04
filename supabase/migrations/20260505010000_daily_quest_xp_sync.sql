-- Fix daily quest XP rubber-banding
-- Updates sync_user_progress to validate daily quests from inventory

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
  v_old_inventory JSONB;
  v_client_claimed JSONB;
  v_server_claimed JSONB;
  v_quest_xp INTEGER;
  v_claim_date TEXT;
  v_final_inventory JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current XP and inventory from DB to calculate delta
  SELECT xp, inventory INTO v_old_xp, v_old_inventory FROM public.profiles WHERE id = v_user_id;
  
  v_delta_xp := COALESCE(p_xp, 0) - COALESCE(v_old_xp, 0);
  IF v_delta_xp < 0 THEN
    v_delta_xp := 0;
  END IF;

  -- Quest Validation Logic
  v_quest_xp := 0;
  v_client_claimed := p_inventory->'claimedQuests';
  v_server_claimed := v_old_inventory->'claimedQuests';
  v_final_inventory := p_inventory;
  
  IF v_client_claimed IS NOT NULL THEN
    v_claim_date := v_client_claimed->>'date';
    
    -- If server has a different date or no date, reset server claimed quests
    IF v_server_claimed IS NULL OR v_server_claimed->>'date' != v_claim_date THEN
      v_server_claimed := jsonb_build_object('date', v_claim_date, 'quests', '[]'::jsonb);
    END IF;
    
    -- Check newly claimed quests
    FOR v_item IN SELECT * FROM jsonb_array_elements_text(COALESCE(v_client_claimed->'quests', '[]'::jsonb))
    LOOP
      IF NOT (v_server_claimed->'quests') ? v_item THEN
        -- Add XP based on quest ID
        IF v_item = 'q_review_10' THEN
          v_quest_xp := v_quest_xp + 20;
        ELSIF v_item = 'q_review_50' THEN
          v_quest_xp := v_quest_xp + 100;
        ELSIF v_item = 'q_xp_500' THEN
          v_quest_xp := v_quest_xp + 150;
        END IF;
        
        -- Append to server claimed array
        v_server_claimed := jsonb_set(
          v_server_claimed,
          '{quests}',
          (v_server_claimed->'quests') || to_jsonb(v_item)
        );
      END IF;
    END LOOP;
    
    -- Force the inventory to use the server-validated quests
    v_final_inventory := jsonb_set(v_final_inventory, '{claimedQuests}', v_server_claimed);
  END IF;

  -- Cap the XP gain based on the number of items synced + strictly calculated quest XP
  -- 15 XP per card max + calculated quest XP
  v_max_plausible_xp := (jsonb_array_length(COALESCE(p_srs_updates, '[]'::jsonb)) * 15) + v_quest_xp;
  
  -- Add a small buffer for things like Mock Exams which might be 20 XP and aren't strictly tracked yet.
  v_max_plausible_xp := v_max_plausible_xp + 100;
  
  IF v_delta_xp > v_max_plausible_xp THEN
    v_delta_xp := v_max_plausible_xp;
  END IF;

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

  -- Bulk Upsert SRS
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
