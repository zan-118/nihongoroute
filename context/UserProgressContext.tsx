/**
 * @file UserProgressContext.tsx
 * @description Manajer state global untuk progres pengguna (XP, Level, SRS).
 * Menangani penyimpanan lokal (LocalStorage) dengan sinkronisasi ke Supabase.
 * @module UserProgressContext
 */

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
    srs: {},
  });
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
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
            description: "Autentikasi berhasil. Selamat belajar!",
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
        if (session?.user) {
          // Mode Cloud: Cek apakah ada data lokal yang perlu disinkronkan
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            const syncSuccess = await syncLocalToCloud(session.user.id, parsed);
            if (syncSuccess) {
              localStorage.removeItem(STORAGE_KEY); // Hapus setelah berhasil
            }
          }

          // Muat data dari Supabase
          const { data: profile } = await supabase
            .from("profiles")
            .select("xp, level")
            .eq("id", session.user.id)
            .single();

          const { data: srsData } = await supabase
            .from("user_srs")
            .select("*")
            .eq("user_id", session.user.id);

          const parsedSrs: Record<string, SRSState> = {};
          if (srsData) {
            srsData.forEach((row) => {
              parsedSrs[row.word_id] = {
                interval: row.interval,
                repetition: 0, // Repetition default untuk Supabase
                easeFactor: row.ease_factor,
                nextReview: new Date(row.next_review).getTime(),
              };
            });
          }

          setProgress({
            xp: profile?.xp || 0,
            level: profile?.level || calculateLevel(profile?.xp || 0),
            srs: parsedSrs,
          });
        } else {
          // Mode Guest: Muat dari LocalStorage
          const localData = localStorage.getItem(STORAGE_KEY);
          if (localData) {
            const parsed = JSON.parse(localData);
            setProgress({
              xp: parsed.xp || 0,
              level: calculateLevel(parsed.xp || 0),
              srs: parsed.srs || {},
            });
          } else {
            // Reset jika logout
            setProgress({ xp: 0, level: 1, srs: {} });
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
      if (session?.user) {
        // Simpan ke Supabase (Cloud)
        try {
          await supabase.from("profiles").upsert({
            id: session.user.id,
            xp: progress.xp,
            level: progress.level,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

          const srsEntries = Object.entries(progress.srs).map(([wordId, state]) => ({
            user_id: session.user.id,
            word_id: wordId,
            interval: state.interval,
            ease_factor: state.easeFactor,
            next_review: new Date(state.nextReview).toISOString(),
            status: state.interval > 21 ? 'graduated' : (state.interval > 1 ? 'reviewing' : 'learning'),
            updated_at: new Date().toISOString(),
          }));

          if (srsEntries.length > 0) {
            await supabase.from("user_srs").upsert(srsEntries, { onConflict: 'user_id,word_id' });
          }
        } catch (err) {
          console.error("Gagal menyimpan ke cloud:", err);
        }
      } else {
        // Simpan ke LocalStorage (Guest)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        }
      }
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [progress, loading, session, supabase]);

  useEffect(() => {
    if (loading || session?.user) return; // Hanya untuk guest
    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [progress, loading, session]);

  // ======================
  // HELPER FUNCTIONS
  // ======================
  const updateProgress = (newXp: number, newSrs: Record<string, SRSState>) => {
    setProgress({
      xp: newXp,
      level: calculateLevel(newXp),
      srs: newSrs,
    });
  };

  const addToSRS = (wordId: string) => {
    if (progress.srs[wordId]) return;
    updateProgress(progress.xp, {
      ...progress.srs,
      [wordId]: createNewCardState(),
    });
  };

  const exportData = () => {
    if (typeof window === "undefined") return;
    const statsData = localStorage.getItem(STATS_STORAGE_KEY);
    const fullPayload = {
      ...progress,
      stats: statsData ? JSON.parse(statsData) : null,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullPayload));
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
        updateProgress(parsed.xp, parsed.srs || {});
        if (parsed.stats && typeof window !== "undefined" && !session?.user) {
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(parsed.stats));
        }
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
