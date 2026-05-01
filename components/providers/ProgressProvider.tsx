"use client";

import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useProgressStore, UserProgress } from "@/store/useProgressStore";
import { calculateLevel } from "@/lib/level";
import { syncLocalToCloud } from "@/lib/supabase/sync";
import { SRSState } from "@/lib/srs";

const STATS_STORAGE_KEY = "nihongo-progress";

export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const setAuth = useProgressStore((state) => state.setAuth);
  const setProgress = useProgressStore((state) => state.setProgress);
  const setLoading = useProgressStore((state) => state.setLoading);
  const progress = useProgressStore((state) => state.progress);
  const loading = useProgressStore((state) => state.loading);
  const dirtySrs = useProgressStore((state) => state.dirtySrs);
  const clearDirtySrs = useProgressStore((state) => state.clearDirtySrs);
  
  const supabase = createClient();

  // AUTHENTICATION LISTENER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Siswa";
      setAuth(!!session?.user, session?.user ? userFullName : null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Siswa";
      setAuth(!!session?.user, session?.user ? userFullName : null);
      
      if (event === "SIGNED_IN" && session?.user) {
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem("nihongo_welcomed")) {
          toast.success(`Okaeri, ${userFullName}!`, {
            description: "Senang kamu kembali, mari taklukkan tantangan hari ini!",
          });
          sessionStorage.setItem("nihongo_welcomed", "true");
        }
      } else if (event === "SIGNED_OUT") {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.removeItem("nihongo_welcomed");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, setAuth]);

  // DATA INITIALIZATION
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const gamificationData = localStorage.getItem(STATS_STORAGE_KEY);
          const currentProgress = useProgressStore.getState().progress;

          if (gamificationData) {
            const parsedStats = JSON.parse(gamificationData);
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

          const { data: profile } = await supabase
            .from("profiles")
            .select("xp, level, streak, today_review_count, last_study_date, study_days")
            .eq("id", session.user.id)
            .single();

          const { data: srsData } = await supabase
            .from("user_srs")
            .select("word_id, interval, repetition, ease_factor, next_review")
            .eq("user_id", session.user.id);

          const parsedSrs: Record<string, SRSState> = {};
          if (srsData) {
            (srsData as Array<{ word_id: string; interval: number; repetition: number; ease_factor: number; next_review: string }>).forEach((row) => {
              parsedSrs[row.word_id] = {
                interval: row.interval,
                repetition: row.repetition,
                easeFactor: row.ease_factor,
                nextReview: new Date(row.next_review).getTime(),
              };
            });
          }

          const today = new Date().toISOString().split("T")[0];
          const cloudStreak = profile?.streak || 0;
          let cloudReviewCount = profile?.today_review_count || 0;
          const cloudLastDate = profile?.last_study_date || null;

          if (cloudLastDate !== today) {
            cloudReviewCount = 0;
          }

          const sanitizedStudyDays: Record<string, number> = {};
          if (profile?.study_days) {
            Object.entries(profile.study_days).forEach(([date, val]) => {
              sanitizedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
            });
          }

          const cloudProgress: UserProgress = {
            xp: profile?.xp || 0,
            level: profile?.level || calculateLevel(profile?.xp || 0),
            streak: cloudStreak,
            todayReviewCount: cloudReviewCount,
            lastStudyDate: cloudLastDate,
            studyDays: sanitizedStudyDays,
            srs: parsedSrs,
          };

          setProgress(cloudProgress);
        }
      } catch (err) {
        console.error("Gagal memuat data progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [supabase, setProgress, setLoading]);

  // CLOUD SYNCING
  useEffect(() => {
    if (loading) return;

    const debounceTimer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        try {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            xp: progress.xp,
            level: progress.level,
            streak: progress.streak,
            today_review_count: progress.todayReviewCount,
            last_study_date: progress.lastStudyDate,
            study_days: progress.studyDays,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          if (dirtySrs.size > 0) {
            const entriesToSync = Array.from(dirtySrs)
              .filter(id => progress.srs[id])
              .map(id => {
                const state = progress.srs[id];
                return {
                  user_id: session.user.id,
                  word_id: id,
                  repetition: state.repetition,
                  interval: state.interval,
                  ease_factor: state.easeFactor,
                  next_review: new Date(state.nextReview).toISOString(),
                  status: state.interval > 21 ? 'graduated' : (state.interval > 1 ? 'reviewing' : 'learning'),
                  updated_at: new Date().toISOString(),
                };
              });

            if (entriesToSync.length > 0) {
              const { error } = await supabase.from("user_srs").upsert(entriesToSync, { onConflict: 'user_id,word_id' });
              if (!error) {
                clearDirtySrs();
              } else {
                throw error;
              }
            }
          }
        } catch (err) {
          console.error("Gagal melakukan partial sync ke cloud (offline?):", err);
        }
      }
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [progress, loading, dirtySrs, supabase, clearDirtySrs]);

  return <>{children}</>;
};
