"use client";

/**
 * @file useSyncProgress.ts
 * @description Hook kustom offline-first selaku orkestrator utama sinkronisasi data progres belajar pengguna (Zustand & Supabase). Mengamati perubahan state lokal, mengonsolidasi data kotor (dirty), melakukan debouncing asinkron selama 2000ms, lalu mengeksekusi mutasi batch terenkripsi ke Supabase.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
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
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Sync local progress with Supabase.
 * Handles debouncing, dirty state tracking, and multi-tab sync.
 * 
 * @returns Sync status and manual trigger function.
 */
export function useSyncProgress() {
  // Memoize Supabase client to prevent recreation.
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();
  
  // Track store hydration status.
  const userHydrated = useStoreHydration(useUserStore);
  const srsHydrated = useStoreHydration(useSRSStore);
  
  // ==========================================
  // SELEKTOR STATE LOKAL (ZUSTAND STORES)
  // ==========================================
  
  // Select atomic properties to avoid infinite re-renders.
  const name = useUserStore((s) => s.name);
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);
  const todayReviewCount = useUserStore((s) => s.todayReviewCount);
  const lastStudyDate = useUserStore((s) => s.lastStudyDate);
  const studyDays = useUserStore((s) => s.studyDays);
  const inventory = useUserStore((s) => s.inventory);
  const isGuest = useUserStore((s) => s.isGuest);

  // Track size only to keep dependency array stable.
  const dirtyLessonsSize = useUserStore((s) => s.dirtyLessons.size);
  const dirtySrsSize = useSRSStore((s) => s.dirtySrs.size);

  // Get UI settings.
  const settings = useUIStore((s) => s.settings);

  const hasMounted = useHasMounted();

  // ==========================================
  // TIER 2 & TIER 3: ALUR ALIRAN DATA SINKRONISASI
  // ==========================================

  // Fetch active session from Supabase.
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    enabled: hasMounted,
  });

  // Listen to auth changes and invalidate cache.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      queryClient.setQueryData(["session"], session);
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase, queryClient]);

  // Fetch cloud data.
  const { cloudData, isFetching } = useCloudData(session, hasMounted);

  // Prepare cloud mutation.
  const syncMutation = useCloudMutation(session);

  // Listen to broadcast channel for multi-tab sync.
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

  // Track sync state and mutation ref.
  const lastSyncedProgress = useRef<string>("");
  const syncMutateRef = useRef(syncMutation.mutate);
  
  useEffect(() => {
    syncMutateRef.current = syncMutation.mutate;
  }, [syncMutation.mutate]);

  const isPending = syncMutation.isPending;

  // Serialize profile data to detect changes.
  const profileKey = useMemo(() => {
    const invLength = inventory?.achievements?.length || 0;
    const freeze = inventory?.streakFreeze || 0;
    const notifs = settings?.notificationsEnabled ? 1 : 0;
    return `${name}-${xp}-${streak}-${lastStudyDate}-${todayReviewCount}-${invLength}-${freeze}-${notifs}`;
  }, [name, xp, streak, lastStudyDate, todayReviewCount, inventory?.achievements?.length, inventory?.streakFreeze, settings?.notificationsEnabled]);

  // Serialize cloud profile data for post-merge sync.
  const cloudProfileKey = useMemo(() => {
    if (!cloudData) return "";
    const invLength = cloudData.inventory?.achievements?.length || 0;
    const freeze = cloudData.inventory?.streakFreeze || 0;
    const notifs = cloudData.settings?.notificationsEnabled ? 1 : 0;
    return `${cloudData.name}-${cloudData.xp}-${cloudData.streak}-${cloudData.lastStudyDate}-${cloudData.todayReviewCount}-${invLength}-${freeze}-${notifs}`;
  }, [cloudData]);

  // Update sync ref with cloud data.
  useEffect(() => {
    if (cloudProfileKey) {
      lastSyncedProgress.current = cloudProfileKey;
    }
  }, [cloudProfileKey]);

  // Debounce auto-sync by 2000ms on local changes.
  useEffect(() => {
    if (isFetching || isPending || !session?.user || isGuest || !userHydrated || !srsHydrated) return;

    const isProfileChanged = profileKey !== lastSyncedProgress.current;

    if (!isProfileChanged && dirtySrsSize === 0 && dirtyLessonsSize === 0) return;

    const timer = setTimeout(() => {
      const userState = useUserStore.getState();
      const srsState = useSRSStore.getState();
      const uiState = useUIStore.getState();
      const currentSrs = srsState.srs;
      const currentCompletedLessons = userState.completedLessons;
      const currentDirtySrs = srsState.dirtySrs;
      const currentDirtyLessons = userState.dirtyLessons;

      const currentProgress = {
        name: userState.name, 
        xp: userState.xp, 
        streak: userState.streak, 
        todayReviewCount: userState.todayReviewCount, 
        lastStudyDate: userState.lastStudyDate, 
        studyDays: userState.studyDays,
        inventory: userState.inventory, 
        settings: uiState.settings, 
        srs: currentSrs, 
        completedLessons: currentCompletedLessons
      };
      syncMutateRef.current({
        progress: currentProgress,
        dirtySrs: currentDirtySrs,
        dirtyLessons: currentDirtyLessons
      });
      lastSyncedProgress.current = profileKey;
    }, 2000);

    return () => clearTimeout(timer);
  }, [profileKey, dirtySrsSize, dirtyLessonsSize, session?.user, isFetching, isPending, isGuest, userHydrated, srsHydrated]);

  // Trigger manual sync immediately.
  const syncNow = useCallback(() => {
    const currentSrs = useSRSStore.getState().srs;
    const currentCompletedLessons = useUserStore.getState().completedLessons;
    const currentDirtySrs = useSRSStore.getState().dirtySrs;
    const currentDirtyLessons = useUserStore.getState().dirtyLessons;

    const currentProgress = {
      name, xp, streak, todayReviewCount, lastStudyDate, studyDays,
      inventory, settings, srs: currentSrs, completedLessons: currentCompletedLessons
    };
    syncMutation.mutate({
      progress: currentProgress,
      dirtySrs: currentDirtySrs,
      dirtyLessons: currentDirtyLessons
    });
  }, [name, xp, streak, todayReviewCount, lastStudyDate, studyDays, inventory, settings, syncMutation]);

  return { isLoading: isFetching, syncNow };
}