"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { SRSState } from "@/lib/srs";
import { calculateLevel } from "@/lib/level";
import { getLocalDateString } from "@/lib/utils";
import { UserProgress, LessonProgress } from "@/store/types";
import { handleLegacyMigration } from "@/lib/supabase/sync";
import { Session } from "@supabase/supabase-js";

export function useCloudData(session: Session | null | undefined, hasMounted: boolean) {
  const supabase = createClient();
  const mergeProgress = useSRSStore((s) => s.mergeProgress);
  const setLoading = useUIStore((s) => s.setLoading);
  const initialLoadDone = useRef(false);

  const { data: cloudData, isLoading: isFetching } = useQuery({
    queryKey: ["user-progress", session?.user?.id],
    queryFn: async () => {
      if (!session?.user || !hasMounted) return null;

      // Cek apakah ada data lokal yang perlu migrasi (hanya sekali)
      if (!initialLoadDone.current) {
        await handleLegacyMigration(session.user.id, supabase);
        initialLoadDone.current = true;
      }

      // Ambil data dari Cloud
      const [profileRes, srsRes, lessonsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, xp, level, streak, today_review_count, last_study_date, study_days, inventory, settings")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("user_srs")
          .select("word_id, interval, repetition, ease_factor, next_review, updated_at")
          .eq("user_id", session.user.id),
        supabase
          .from("user_lessons")
          .select("lesson_id, is_completed, completed_at, updated_at")
          .eq("user_id", session.user.id)
      ]);

      const profile = profileRes.data;
      const srsData = srsRes.data;
      const lessonsData = lessonsRes.data;

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

      const parsedLessons: Record<string, LessonProgress> = {};
      if (lessonsData) {
        lessonsData.forEach((row) => {
          parsedLessons[row.lesson_id] = {
            completedAt: new Date(row.completed_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            isDeleted: !row.is_completed
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
    enabled: hasMounted && !!session?.user,
  });

  // Sinkronkan Cloud Data ke Zustand jika ada perubahan
  useEffect(() => {
    if (cloudData && hasMounted) {
      mergeProgress(cloudData);
    }
  }, [cloudData, mergeProgress, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      setLoading(isFetching);
    }
  }, [isFetching, setLoading, hasMounted]);

  return { cloudData, isFetching };
}
