"use client";

// ======================
// IMPORTS
// ======================
import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateLevel } from "@/lib/level";
import { SRSState, createNewCardState } from "@/lib/srs";
import { createClient } from "@/lib/supabase/client";
import { syncLocalToCloud } from "@/lib/supabase/sync";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

// ======================
// TYPES / INTERFACES
// ======================

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  srs: Record<string, SRSState>;
}

export interface ProgressContextType {
  progress: UserProgress;
  loading: boolean;
  updateProgress: (newXp: number, newSrs: Record<string, SRSState>) => void;
  addToSRS: (wordId: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  isAuthenticated: boolean;
  userFullName: string | null;
}

// ======================
// CONFIG / CONSTANTS
// ======================
const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

const STORAGE_KEY = "nihongoroute_save_data";
const STATS_STORAGE_KEY = "nihongo-progress";

// ======================
// PROVIDER COMPONENT
// ======================

export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [progress, setProgress] = useState<UserProgress>({
    xp: 0,
    level: 1,
    streak: 0,
    todayReviewCount: 0,
    lastStudyDate: null,
    studyDays: {},
    srs: {},
  });
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [dirtySrs, setDirtySrs] = useState<Set<string>>(new Set());
  const supabase = createClient();

  // ======================
  // AUTH LISTENER
  // ======================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      if (event === "SIGNED_IN" && session?.user) {
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem("nihongo_welcomed")) {
          const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Siswa";
          toast.success(`Okaeri, ${name}!`, {
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
  }, [supabase.auth]);

  // ======================
  // DATA INITIALIZATION
  // ======================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Muat Cache Lokal Segera (Instant UI)
        const localCache = localStorage.getItem(STORAGE_KEY);
        if (localCache) {
          const parsed = JSON.parse(localCache);
          setProgress(prev => ({ ...prev, ...parsed, srs: parsed.srs || {} }));
        }

        if (session?.user) {
          // 2. Cek Migrasi Guest -> User
          if (localCache) {
            const parsed = JSON.parse(localCache);
            const gamificationData = localStorage.getItem(STATS_STORAGE_KEY);
            if (gamificationData) {
              const parsedStats = JSON.parse(gamificationData);
              parsed.streak = parsedStats.streak;
              parsed.todayReviewCount = parsedStats.todayReviewCount;
              parsed.lastStudyDate = parsedStats.lastStudyDate;
              
              // Konversi studyDays migrasi
              const migratedStudyDays: Record<string, number> = {};
              if (parsedStats.studyDays) {
                Object.entries(parsedStats.studyDays).forEach(([date, val]) => {
                  migratedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
                });
              }
              parsed.studyDays = migratedStudyDays;
            }

            const syncSuccess = await syncLocalToCloud(session.user.id, parsed);
            if (syncSuccess) {
              localStorage.removeItem(STATS_STORAGE_KEY);
            }
          }

          // 3. Tarik data terbaru dari Cloud
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
            srsData.forEach((row) => {
              parsedSrs[row.word_id] = {
                interval: row.interval,
                repetition: row.repetition,
                easeFactor: row.ease_factor,
                nextReview: new Date(row.next_review).getTime(),
              };
            });
          }

          const today = new Date().toISOString().split("T")[0];
          let cloudStreak = profile?.streak || 0;
          let cloudReviewCount = profile?.today_review_count || 0;
          const cloudLastDate = profile?.last_study_date || null;

          // Reset review harian jika hari sudah berganti
          if (cloudLastDate !== today) {
            cloudReviewCount = 0;
          }

          // Konversi studyDays lama (boolean) ke numerik jika perlu
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
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudProgress));
        } else {
          // Mode Guest: Jika tidak ada di cache (meskipun sudah dimuat di atas), muat lagi untuk kepastian
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            const sanitizedStudyDays: Record<string, number> = {};
            if (parsed.studyDays) {
              Object.entries(parsed.studyDays).forEach(([date, val]) => {
                sanitizedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
              });
            }

            setProgress({
              xp: parsed.xp || 0,
              level: calculateLevel(parsed.xp || 0),
              streak: parsed.streak || 0,
              todayReviewCount: parsed.todayReviewCount || 0,
              lastStudyDate: parsed.lastStudyDate || null,
              studyDays: sanitizedStudyDays,
              srs: parsed.srs || {},
            });
          } else {
            // Reset jika logout
            setProgress({
              xp: 0,
              level: 1,
              streak: 0,
              todayReviewCount: 0,
              lastStudyDate: null,
              studyDays: {},
              srs: {},
            });
          }
        }
      } catch (err) {
        console.error("Gagal memuat data progress:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session, supabase]);

  // ======================
  // BUSINESS LOGIC (SAVE)
  // ======================
  useEffect(() => {
    if (loading) return;

    const debounceTimer = setTimeout(async () => {
      // SELALU simpan ke LocalStorage (Cache) untuk dukungan offline
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      }

      if (session?.user) {
        try {
          // 1. Update Profile
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

          // 2. Partial Update SRS
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
                setDirtySrs(new Set());
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
  }, [progress, loading, session, supabase, dirtySrs]);

  // ======================
  // HELPER FUNCTIONS
  // ======================
  const updateProgress = (newXp: number, newSrs: Record<string, SRSState>) => {
    const today = new Date().toISOString().split("T")[0];
    const newDirty = new Set(dirtySrs);
    let srsChanged = false;

    Object.keys(newSrs).forEach(id => {
      if (JSON.stringify(newSrs[id]) !== JSON.stringify(progress.srs[id])) {
        newDirty.add(id);
        srsChanged = true;
      }
    });
    
    setDirtySrs(newDirty);
    
    setProgress(prev => {
      let { streak, todayReviewCount, lastStudyDate } = prev;
      let studyDays = { ...prev.studyDays } as Record<string, number>;

      // Logika Review Count & Streak
      if (srsChanged) {
        todayReviewCount += 1;
        
        if (lastStudyDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          if (lastStudyDate === yesterdayStr) {
            streak += 1;
          } else {
            // Jika absen lebih dari sehari, reset streak jadi 1
            streak = 1;
          }
          
          lastStudyDate = today;
          studyDays = { ...studyDays, [today]: (studyDays[today] || 0) + 1 };
        } else {
          // Jika hari yang sama, tetap update hitungan aktivitas di studyDays
          studyDays = { ...studyDays, [today]: (studyDays[today] || 0) + 1 };
        }
      }

      return {
        ...prev,
        xp: newXp,
        level: calculateLevel(newXp),
        srs: newSrs,
        streak,
        todayReviewCount,
        lastStudyDate,
        studyDays,
      };
    });
  };

  const addToSRS = (wordId: string) => {
    if (progress.srs[wordId]) return;
    
    setDirtySrs(prev => new Set(prev).add(wordId));
    updateProgress(progress.xp, {
      ...progress.srs,
      [wordId]: createNewCardState(),
    });
  };

  const exportData = () => {
    if (typeof window === "undefined") return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(progress));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nihongoroute-save-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.xp !== undefined && typeof parsed.xp === "number") {
        setProgress(parsed as UserProgress);
        return true;
      }
      return false;
    } catch (e) {
      console.error("Gagal mengurai file data import:", e);
      return false;
    }
  };

  const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Siswa";

  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        updateProgress,
        addToSRS,
        exportData,
        importData,
        isAuthenticated: !!session?.user,
        userFullName,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress harus digunakan di dalam ProgressProvider");
  return context;
};
