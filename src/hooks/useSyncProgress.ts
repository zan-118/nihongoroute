"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useCloudData } from "./useCloudData";
import { useCloudMutation } from "./useCloudMutation";
import { useStoreHydration } from "./useStoreHydration";

export function useSyncProgress() {
  const supabase = useMemo(() => createClient(), []);
  
  const userHydrated = useStoreHydration(useUserStore);
  const srsHydrated = useStoreHydration(useSRSStore);
  
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
  // Use refs for values that change references frequently (objects/Sets from Zustand)
  // to prevent the auto-sync effect from firing on every mergeProgress call.
  const srsRef = useRef(srs);
  const dirtySrsRef = useRef(dirtySrs);
  const dirtyLessonsRef = useRef(dirtyLessons);
  const completedLessonsRef = useRef(completedLessons);

  useEffect(() => { srsRef.current = srs; }, [srs]);
  useEffect(() => { dirtySrsRef.current = dirtySrs; }, [dirtySrs]);
  useEffect(() => { dirtyLessonsRef.current = dirtyLessons; }, [dirtyLessons]);
  useEffect(() => { completedLessonsRef.current = completedLessons; }, [completedLessons]);

  const lastSyncedProgress = useRef<string>("");
  const syncMutateRef = useRef(syncMutation.mutate);
  
  useEffect(() => {
    syncMutateRef.current = syncMutation.mutate;
  }, [syncMutation.mutate]);

  const isPending = syncMutation.isPending;

  // Stable serialization key for profile data (excludes srs/dirtySrs which use refs)
  const profileKey = useMemo(() => JSON.stringify({
    name, xp, streak, studyDays, inventory, settings, lastStudyDate, todayReviewCount
  }), [name, xp, streak, studyDays, inventory, settings, lastStudyDate, todayReviewCount]);

  // Track dirtySrs.size and dirtyLessons.size as primitives to avoid Set reference instability
  const dirtySrsSize = dirtySrs.size;
  const dirtyLessonsSize = dirtyLessons.size;

  useEffect(() => {
    if (isFetching || isPending || !session?.user || isGuest || !userHydrated || !srsHydrated) return;

    const isProfileChanged = profileKey !== lastSyncedProgress.current;

    if (!isProfileChanged && dirtySrsSize === 0 && dirtyLessonsSize === 0) return;

    const timer = setTimeout(() => {
      const currentProgress = {
        name, xp, streak, todayReviewCount, lastStudyDate, studyDays,
        inventory, settings, srs: srsRef.current, completedLessons: completedLessonsRef.current
      };
      syncMutateRef.current({
        progress: currentProgress,
        dirtySrs: dirtySrsRef.current,
        dirtyLessons: dirtyLessonsRef.current
      });
      lastSyncedProgress.current = profileKey;
    }, 2000);

    return () => clearTimeout(timer);
  }, [profileKey, dirtySrsSize, dirtyLessonsSize, session?.user, isFetching, isPending, isGuest, userHydrated, srsHydrated, name, xp, streak, todayReviewCount, lastStudyDate, studyDays, inventory, settings]);

  const syncNow = useCallback(() => {
    const currentProgress = {
      name, xp, streak, todayReviewCount, lastStudyDate, studyDays,
      inventory, settings, srs: srsRef.current, completedLessons: completedLessonsRef.current
    };
    syncMutation.mutate({
      progress: currentProgress,
      dirtySrs: dirtySrsRef.current,
      dirtyLessons: dirtyLessonsRef.current
    });
  }, [name, xp, streak, todayReviewCount, lastStudyDate, studyDays, inventory, settings, syncMutation]);

  return { isLoading: isFetching, syncNow };
}
