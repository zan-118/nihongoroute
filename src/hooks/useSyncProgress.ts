"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useEffect, useRef, useMemo } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useCloudData } from "./useCloudData";
import { useCloudMutation } from "./useCloudMutation";

export function useSyncProgress() {
  const supabase = createClient();
  
  // User Store Selectors
  const name = useUserStore((s) => s.name);
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);
  const todayReviewCount = useUserStore((s) => s.todayReviewCount);
  const lastStudyDate = useUserStore((s) => s.lastStudyDate);
  const studyDays = useUserStore((s) => s.studyDays);
  const inventory = useUserStore((s) => s.inventory);
  const completedLessons = useUserStore((s) => s.completedLessons);
  const dirtyLessons = useUserStore((s) => s.dirtyLessons);
  const isGuest = useUserStore((s) => s.isGuest);

  // SRS Store Selectors
  const srs = useSRSStore((s) => s.srs);
  const dirtySrs = useSRSStore((s) => s.dirtySrs);

  // UI Store Selectors
  const settings = useUIStore((s) => s.settings);

  const hasMounted = useHasMounted();

  // 1. SESSION QUERY
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    enabled: hasMounted,
  });

  // 2. CLOUD DATA FETCHING (Extracted)
  const { isFetching } = useCloudData(session, hasMounted);

  // 3. CLOUD MUTATION (Extracted)
  const syncMutation = useCloudMutation(session);

  // 4. BROADCAST SYNC
  const queryClient = useQueryClient();
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.onmessage = (event) => {
      if (event.data === "SYNC_COMPLETE") {
        queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // 5. DEBOUNCED AUTO-SYNC
  const currentProgressData = useMemo(() => ({
    name, xp, streak, todayReviewCount, lastStudyDate, studyDays, inventory, settings, srs, completedLessons
  }), [name, xp, streak, todayReviewCount, lastStudyDate, studyDays, inventory, settings, srs, completedLessons]);

  const lastSyncedProgress = useRef<string>(JSON.stringify(currentProgressData));

  useEffect(() => {
    if (isFetching || !session?.user || isGuest) return;

    const currentProgressStr = JSON.stringify({
      name, xp, streak, studyDays, inventory, settings, lastStudyDate, todayReviewCount, completedLessons
    });

    const isProfileChanged = currentProgressStr !== lastSyncedProgress.current;

    if (!isProfileChanged && dirtySrs.size === 0 && dirtyLessons.size === 0) return;

    const timer = setTimeout(() => {
      syncMutation.mutate({ progress: currentProgressData, dirtySrs, dirtyLessons });
      lastSyncedProgress.current = currentProgressStr;
    }, 2000);

    return () => clearTimeout(timer);
  }, [name, xp, streak, studyDays, inventory, settings, lastStudyDate, todayReviewCount, srs, dirtySrs, dirtyLessons, session?.user, isFetching, isGuest, syncMutation, currentProgressData, completedLessons]);

  return { isLoading: isFetching, syncNow: () => syncMutation.mutate({ progress: currentProgressData, dirtySrs, dirtyLessons }) };
}
