/**
 * @file UserProgressContext.tsx
 * @description Manajer state global untuk progres pengguna (XP, Level, SRS).
 * Menangani penyimpanan lokal (LocalStorage) dengan sistem debouncing untuk performa.
 * @module UserProgressContext
 */

"use client";

// ======================
// IMPORTS
// ======================
import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateLevel } from "@/lib/level";
import { SRSState, createNewCardState } from "@/lib/srs";

// ======================
// TYPES / INTERFACES
// ======================

/**
 * Representasi data progres inti pengguna.
 */
export interface UserProgress {
  xp: number;
  level: number;
  srs: Record<string, SRSState>;
}

/**
 * Kontrak API untuk Progress Context.
 */
export interface ProgressContextType {
  progress: UserProgress;
  loading: boolean;
  updateProgress: (newXp: number, newSrs: Record<string, SRSState>) => void;
  addToSRS: (wordId: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
}

// ======================
// CONFIG / CONSTANTS
// ======================
const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "nihongoroute_save_data";
const STATS_STORAGE_KEY = "nihongo-progress";

// ======================
// PROVIDER COMPONENT
// ======================

/**
 * ProgressProvider: Pembungkus aplikasi yang menyediakan akses ke data progres.
 * 
 * @param {Object} props - Properti komponen.
 * @param {React.ReactNode} props.children - Node anak yang akan dibungkus.
 * @returns {JSX.Element} Provider context progres.
 */
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

  // ======================
  // DATA INITIALIZATION
  // ======================

  // Muat data saat aplikasi pertama kali di-render di client
  useEffect(() => {
    try {
      const localData = localStorage.getItem(STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        setProgress({
          xp: parsed.xp || 0,
          level: calculateLevel(parsed.xp || 0),
          srs: parsed.srs || {},
        });
      }
    } catch (err) {
      console.warn(
        "Gagal memuat data save lokal, menggunakan state default:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ======================
  // BUSINESS LOGIC (SAVE)
  // ======================

  /**
   * DEBOUNCED SAVE LOGIC:
   * Menunda penyimpanan ke LocalStorage hingga aktivitas perubahan state berhenti selama 1.5 detik.
   */
  useEffect(() => {
    if (loading) return;

    const debounceTimer = setTimeout(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      }
    }, 1500);

    return () => clearTimeout(debounceTimer);
  }, [progress, loading]);

  /**
   * SAFETY SAVE:
   * Memastikan data tersimpan saat tab/browser ditutup secara paksa.
   */
  useEffect(() => {
    if (loading) return;

    const handleBeforeUnload = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [progress, loading]);

  // ======================
  // HELPER FUNCTIONS
  // ======================

  /**
   * Memperbarui progress XP dan status SRS.
   * 
   * @param {number} newXp - Nilai XP baru.
   * @param {Record<string, SRSState>} newSrs - Dataset SRS yang diperbarui.
   */
  const updateProgress = (newXp: number, newSrs: Record<string, SRSState>) => {
    const newState = {
      xp: newXp,
      level: calculateLevel(newXp),
      srs: newSrs,
    };
    setProgress(newState);
  };

  /**
   * Mendaftarkan kata/kartu baru ke dalam sistem SRS user.
   * 
   * @param {string} wordId - ID dokumen kartu.
   */
  const addToSRS = (wordId: string) => {
    // Abaikan jika kartu sudah ada di dalam memori
    if (progress.srs[wordId]) return;

    const newSrs = {
      ...progress.srs,
      [wordId]: createNewCardState(),
    };

    updateProgress(progress.xp, newSrs);
  };

  /**
   * Mengekspor data utama dan statistik menjadi file JSON untuk backup manual.
   */
  const exportData = () => {
    if (typeof window === "undefined") return;

    const statsData = localStorage.getItem(STATS_STORAGE_KEY);
    const fullPayload = {
      ...progress,
      stats: statsData ? JSON.parse(statsData) : null,
    };

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(fullPayload));

    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `nihongoroute-save-${new Date().toISOString().split("T")[0]}.json`,
    );

    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  /**
   * Mengimpor data JSON dan memulihkan sesi belajar user.
   * 
   * @param {string} jsonData - String JSON hasil ekspor.
   * @returns {boolean} Status keberhasilan impor.
   */
  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);

      if (parsed.xp !== undefined && typeof parsed.xp === "number") {
        // 1. Pulihkan data utama (XP & SRS)
        updateProgress(parsed.xp, parsed.srs || {});

        // 2. Pulihkan data statistik jika tersedia di file backup
        if (parsed.stats && typeof window !== "undefined") {
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

  // ======================
  // RENDER
  // ======================
  return (
    <ProgressContext.Provider
      value={{
        progress,
        loading,
        updateProgress,
        addToSRS,
        exportData,
        importData,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

// ======================
// CUSTOM HOOK
// ======================

/**
 * useProgress: Hook untuk mengakses data progres di seluruh aplikasi.
 * 
 * @returns {ProgressContextType} Objek context progres.
 */
export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress harus digunakan di dalam ProgressProvider");
  }
  return context;
};
