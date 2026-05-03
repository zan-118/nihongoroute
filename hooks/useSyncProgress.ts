"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useProgressStore, UserProgress } from "@/store/useProgressStore";
import { SRSState } from "@/lib/srs";
import { calculateLevel } from "@/lib/level";
import { syncLocalToCloud } from "@/lib/supabase/sync";
import { getLocalDateString } from "@/lib/utils";
import { useEffect, useRef } from "react";

const STATS_STORAGE_KEY = "nihongo-progress";

export function useSyncProgress() {
  const supabase = createClient();
  const mergeProgress = useProgressStore((state) => state.mergeProgress);
  const setLoading = useProgressStore((state) => state.setLoading);
  const progress = useProgressStore((state) => state.progress);
  const dirtySrs = useProgressStore((state) => state.dirtySrs);
  const clearDirtySrs = useProgressStore((state) => state.clearDirtySrs);

  const initialLoadDone = useRef(false);

  // 1. QUERY: Load Data dari Cloud
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: cloudData, isLoading: isFetching } = useQuery({
    queryKey: ["user-progress", session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;

      // Cek apakah ada data lokal yang perlu migrasi (hanya sekali)
      if (!initialLoadDone.current) {
        const gamificationData = localStorage.getItem(STATS_STORAGE_KEY);
        if (gamificationData) {
          const parsedStats = JSON.parse(gamificationData);
          const currentProgress = { ...useProgressStore.getState().progress };
          currentProgress.streak = parsedStats.streak;
          currentProgress.todayReviewCount = parsedStats.todayReviewCount;
          currentProgress.lastStudyDate = parsedStats.lastStudyDate;
          
          const migratedStudyDays: Record<string, number> = {};
          if (parsedStats.studyDays) {
            Object.entries(parsedStats.studyDays).forEach(([date, val]) => {
              migratedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
            });
          }
          currentProgress.studyDays = migratedStudyDays;

          const syncSuccess = await syncLocalToCloud(session.user.id, currentProgress);
          if (syncSuccess) {
            localStorage.removeItem(STATS_STORAGE_KEY);
          }
        }
        initialLoadDone.current = true;
      }

      // Ambil data dari Cloud
      const [profileRes, srsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("xp, level, streak, today_review_count, last_study_date, study_days, inventory, settings")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("user_srs")
          .select("word_id, interval, repetition, ease_factor, next_review, updated_at")
          .eq("user_id", session.user.id)
      ]);

      const profile = profileRes.data;
      const srsData = srsRes.data;

      const parsedSrs: Record<string, SRSState> = {};
      if (srsData) {
        srsData.forEach((row) => {
          parsedSrs[row.word_id] = {
            interval: row.interval,
            repetition: row.repetition,
            easeFactor: row.ease_factor,
            nextReview: new Date(row.next_review).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
          };
        });
      }

      const today = getLocalDateString();
      let cloudReviewCount = profile?.today_review_count || 0;
      if (profile?.last_study_date !== today) {
        cloudReviewCount = 0;
      }

      const sanitizedStudyDays: Record<string, number> = {};
      if (profile?.study_days) {
        Object.entries(profile.study_days).forEach(([date, val]) => {
          sanitizedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
        });
      }

      return {
        xp: profile?.xp || 0,
        level: profile?.level || calculateLevel(profile?.xp || 0),
        streak: profile?.streak || 0,
        todayReviewCount: cloudReviewCount,
        lastStudyDate: profile?.last_study_date || null,
        studyDays: sanitizedStudyDays,
        srs: parsedSrs,
        inventory: profile?.inventory || { streakFreeze: 0 },
        settings: profile?.settings || { notificationsEnabled: false },
        notifications: useProgressStore.getState().progress.notifications || [],
      } as UserProgress;
    },
    enabled: !!session?.user,
  });

  // Sinkronkan Cloud Data ke Zustand jika ada perubahan (Gunakan Merge, bukan Overwrite)
  useEffect(() => {
    if (cloudData) {
      mergeProgress(cloudData);
    }
  }, [cloudData, mergeProgress]);

  useEffect(() => {
    setLoading(isFetching);
  }, [isFetching, setLoading]);

  // 2. MUTATION: Atomic Sync to Cloud via RPC
  const syncMutation = useMutation({
    mutationFn: async (data: { progress: UserProgress, dirtySrs: Set<string> }) => {
      if (!session?.user) return;

      const { progress, dirtySrs } = data;

      // Siapkan data SRS untuk dikirim sebagai JSON array
      const srsUpdates = Array.from(dirtySrs)
        .filter(id => progress.srs[id])
        .map(id => {
          const state = progress.srs[id];
          return {
            word_id: id,
            repetition: state.repetition,
            interval: state.interval,
            ease_factor: state.easeFactor,
            next_review: new Date(state.nextReview).toISOString(),
            status: state.interval > 21 ? 'graduated' : (state.interval > 1 ? 'reviewing' : 'learning'),
            is_deleted: !!state.isDeleted
          };
        });

      // Panggil RPC untuk update atomik
      const { error: rpcError } = await supabase.rpc('sync_user_progress', {
        p_xp: progress.xp,
        p_streak: progress.streak,
        p_today_review_count: progress.todayReviewCount,
        p_last_study_date: progress.lastStudyDate,
        p_study_days: progress.studyDays,
        p_inventory: progress.inventory,
        p_settings: progress.settings,
        p_srs_updates: srsUpdates
      });

      if (rpcError) throw rpcError;

      return { success: true, syncedWordIds: Array.from(dirtySrs) };
    },
    onSuccess: (result) => {
      if (result?.success && result.syncedWordIds) {
        clearDirtySrs(result.syncedWordIds);
        
        // Broadcast ke tab lain bahwa sinkronisasi berhasil
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const channel = new BroadcastChannel("nihongoroute_sync");
          channel.postMessage("SYNC_COMPLETE");
          channel.close();
        }
      }
    },
  });

  // Dengarkan broadcast dari tab lain
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.onmessage = (event) => {
      if (event.data === "SYNC_COMPLETE") {
        // Karena TanStack Query akan otomatis me-refetch saat window focus, 
        // kita bisa memicu refetch manual di sini jika diinginkan.
        // Untuk sekarang, kita biarkan queryKey ["user-progress"] yang mengaturnya.
      }
    };
    return () => channel.close();
  }, []);

  const lastSyncedProgress = useRef<string>(JSON.stringify(progress));

  // Debounced Auto-sync
  useEffect(() => {
    if (isFetching || !session?.user) return;

    const currentProgressStr = JSON.stringify({
      xp: progress.xp,
      streak: progress.streak,
      studyDays: progress.studyDays,
      inventory: progress.inventory,
      settings: progress.settings,
      lastStudyDate: progress.lastStudyDate,
      todayReviewCount: progress.todayReviewCount
    });

    const isProfileChanged = currentProgressStr !== lastSyncedProgress.current;

    if (!isProfileChanged && dirtySrs.size === 0) return;

    const timer = setTimeout(() => {
      syncMutation.mutate({ progress, dirtySrs });
      lastSyncedProgress.current = currentProgressStr;
    }, 2000);

    return () => clearTimeout(timer);
  }, [progress, dirtySrs, session?.user, isFetching, syncMutation]);

  return { isLoading: isFetching, syncNow: () => syncMutation.mutate({ progress, dirtySrs }) };
}
