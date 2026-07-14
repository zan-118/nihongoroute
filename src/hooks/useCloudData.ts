"use client";

/**
 * @file useCloudData.ts
 * @description Hook kustom offline-first pengelola pemuatan data paralel dari awan Supabase (profil, user_srs, user_lessons). Mengintegrasikannya dengan aman ke Zustand lokal (IndexedDB) menggunakan timestamp terbaru (updated_at) dan melakukan resolusi konflik secara mulus.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { SRSState } from "@/lib/srs";
import { calculateLevel } from "@/lib/level";
import { getLocalDateString } from "@/lib/utils";
import { UserProgress, LessonProgress } from "@/store/types";
import { handleLegacyMigration } from "@/lib/supabase/sync";
import { Session } from "@supabase/supabase-js";
import { useStoreHydration } from "./useStoreHydration";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Hook to fetch and reconcile cloud progress data with local storage.
 * 
 * @param session - Active Supabase session.
 * @param hasMounted - Component mount status.
 * @returns Cloud data and fetching state.
 */
export function useCloudData(session: Session | null | undefined, hasMounted: boolean) {
  // Initialize Supabase client once.
  const supabase = useMemo(() => createClient(), []);
  
  // Get local store actions.
  const mergeProgress = useSRSStore((s) => s.mergeProgress);
  const setLoading = useUIStore((s) => s.setLoading);
  
  // Track guest migration status.
  const initialLoadDone = useRef(false);

  // Wait for local stores to hydrate.
  const userHydrated = useStoreHydration(useUserStore);
  const srsHydrated = useStoreHydration(useSRSStore);

  // Fetch unified progress from Supabase.
  const { data: cloudData, isLoading: isFetching } = useQuery({
    queryKey: ["user-progress", session?.user?.id],
    queryFn: async () => {
      // Guard: require auth and mount.
      if (!session?.user || !hasMounted) return null;

      // Migrate guest data on first load.
      if (!initialLoadDone.current) {
        await handleLegacyMigration(session.user.id, supabase);
        initialLoadDone.current = true;
      }

      // Fetch profile, SRS, and lessons in parallel.
      const [profileRes, srsRes, lessonsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, xp, level, streak, today_review_count, last_study_date, study_days, inventory, settings")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("user_srs")
          .select("word_id, interval, repetition, ease_factor, next_review, updated_at, custom_mnemonic")
          .eq("user_id", session.user.id),
        supabase
          .from("user_lessons")
          .select("lesson_id, is_completed, completed_at, updated_at")
          .eq("user_id", session.user.id)
      ]);

      const profile = profileRes.data;
      const srsData = srsRes.data;
      const lessonsData = lessonsRes.data;

      // Map database rows to local SRS state.
      const parsedSrs: Record<string, SRSState> = {};
      if (srsData) {
        srsData.forEach((row: { word_id: string; interval: number; repetition: number; ease_factor: number; next_review: string; updated_at: string; custom_mnemonic?: string }) => {
          parsedSrs[row.word_id] = {
            interval: row.interval,
            repetition: row.repetition,
            easeFactor: row.ease_factor,
            nextReview: new Date(row.next_review).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            customMnemonic: row.custom_mnemonic || undefined
          };
        });
      }

      // Map database rows to local lesson progress.
      const parsedLessons: Record<string, LessonProgress> = {};
      if (lessonsData) {
        lessonsData.forEach((row: { lesson_id: string; completed_at: string; updated_at: string; is_completed: boolean }) => {
          parsedLessons[row.lesson_id] = {
            completedAt: new Date(row.completed_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            isDeleted: !row.is_completed
          };
        });
      }

      // Reset review count if day changed.
      const today = getLocalDateString();
      let cloudReviewCount = profile?.today_review_count || 0;
      if (profile?.last_study_date !== today) {
        cloudReviewCount = 0;
      }

      // Normalize study days format.
      const sanitizedStudyDays: Record<string, number> = {};
      if (profile?.study_days) {
        Object.entries(profile.study_days).forEach(([date, val]) => {
          sanitizedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
        });
      }

      // Return unified progress object.
      return {
        id: session!.user.id,
        isGuest: false,
        name: profile?.full_name || null,
        xp: profile?.xp || 0,
        level: profile?.level || calculateLevel(profile?.xp || 0),
        streak: profile?.streak || 0,
        todayReviewCount: cloudReviewCount,
        lastStudyDate: profile?.last_study_date || null,
        studyDays: sanitizedStudyDays,
        srs: parsedSrs,
        completedLessons: parsedLessons,
        inventory: profile?.inventory || { streakFreeze: 0 },
        settings: profile?.settings || { notificationsEnabled: false },
        notifications: [],
      } as UserProgress;
    },
    enabled: hasMounted && !!session?.user && userHydrated && srsHydrated,
  });

  // Track last merged state to prevent loops.
  const lastMergedKey = useRef<string>("");
  
  // Merge cloud data to local store on change.
  useEffect(() => {
    if (cloudData && hasMounted) {
      const mergeKey = `${cloudData.xp}-${Object.keys(cloudData.srs).length}-${Object.keys(cloudData.completedLessons).length}-${cloudData.streak}-${cloudData.lastStudyDate}`;
      if (mergeKey !== lastMergedKey.current) {
        lastMergedKey.current = mergeKey;
        mergeProgress(cloudData);
      }
    }
  }, [cloudData, mergeProgress, hasMounted]);

  // Sync global loading state.
  useEffect(() => {
    if (hasMounted) {
      setLoading(isFetching);
    }
  }, [isFetching, setLoading, hasMounted]);

  return { cloudData, isFetching };
}