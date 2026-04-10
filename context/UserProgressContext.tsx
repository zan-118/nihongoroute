"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { calculateLevel } from "@/lib/level";
import { SRSState, createNewCardState } from "@/lib/srs";

interface UserProgress {
  xp: number;
  level: number;
  srs: Record<string, SRSState>;
}

interface ProgressContextType {
  progress: UserProgress;
  loading: boolean;
  updateProgress: (newXp: number, newSrs: Record<string, SRSState>) => void;
  addToSRS: (wordId: string) => void; // Fungsi baru
  exportData: () => void;
  importData: (jsonData: string) => boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "nihongopath_save_data";

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
      console.error("Gagal memuat data lokal:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = (newXp: number, newSrs: Record<string, SRSState>) => {
    const newState = {
      xp: newXp,
      level: calculateLevel(newXp),
      srs: newSrs,
    };
    setProgress(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  // Fungsi Baru: Menambahkan kata ke antrean belajar
  const addToSRS = (wordId: string) => {
    if (progress.srs[wordId]) return; // Cegah duplikat

    const newSrs = {
      ...progress.srs,
      [wordId]: createNewCardState(),
    };

    updateProgress(progress.xp, newSrs);
  };

  const exportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(progress));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `nihongopath-save-${new Date().toISOString().split("T")[0]}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.xp !== undefined && typeof parsed.xp === "number") {
        updateProgress(parsed.xp, parsed.srs || {});
        return true;
      }
      return false;
    } catch (e) {
      console.error("Gagal import data", e);
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

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context)
    throw new Error("useProgress harus digunakan di dalam ProgressProvider");
  return context;
};
