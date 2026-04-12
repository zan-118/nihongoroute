"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateLevel } from "@/lib/level";
import { SRSState, createNewCardState } from "@/lib/srs";

/* ============================= */
/* INTERFACES & TYPES */
/* ============================= */

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
}

/* ============================= */
/* CONSTANTS */
/* ============================= */

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
);
const STORAGE_KEY = "nihongoroute_save_data";
const STATS_STORAGE_KEY = "nihongo-progress";

/* ============================= */
/* PROVIDER COMPONENT */
/* ============================= */

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

  /**
   * Memperbarui progress XP dan status SRS, lalu menyimpannya ke LocalStorage.
   */
  const updateProgress = (newXp: number, newSrs: Record<string, SRSState>) => {
    const newState = {
      xp: newXp,
      level: calculateLevel(newXp),
      srs: newSrs,
    };
    setProgress(newState);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    }
  };

  /**
   * Mendaftarkan kata/kartu baru ke dalam sistem SRS user.
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
   * Mengekspor data utama dan statistik menjadi file JSON.
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

/* ============================= */
/* CUSTOM HOOK */
/* ============================= */

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress harus digunakan di dalam ProgressProvider");
  }
  return context;
};
