import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SRSState, createNewCardState } from "@/lib/srs";
import { calculateLevel } from "@/lib/level";

export interface UserProgress {
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  srs: Record<string, SRSState>;
}

export interface ProgressState {
  progress: UserProgress;
  loading: boolean;
  dirtySrs: Set<string>;
  isAuthenticated: boolean;
  userFullName: string | null;
  
  // Actions
  setProgress: (progress: UserProgress) => void;
  setLoading: (loading: boolean) => void;
  setAuth: (isAuthenticated: boolean, userFullName: string | null) => void;
  setDirtySrs: (dirtySrs: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  
  updateProgress: (newXp: number, newSrs: Record<string, SRSState>) => void;
  addToSRS: (wordId: string) => void;
  exportData: () => void;
  importData: (jsonData: string) => boolean;
  clearDirtySrs: () => void;
}

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  streak: 0,
  todayReviewCount: 0,
  lastStudyDate: null,
  studyDays: {},
  srs: {},
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: defaultProgress,
      loading: true,
      dirtySrs: new Set(),
      isAuthenticated: false,
      userFullName: null,

      setProgress: (progress) => set({ progress }),
      setLoading: (loading) => set({ loading }),
      setAuth: (isAuthenticated, userFullName) => set({ isAuthenticated, userFullName }),
      
      setDirtySrs: (updater) => set((state) => ({ 
        dirtySrs: typeof updater === 'function' ? updater(state.dirtySrs) : updater 
      })),
      
      clearDirtySrs: () => set({ dirtySrs: new Set() }),

      updateProgress: (newXp, newSrs) => {
        const state = get();
        const today = new Date().toISOString().split("T")[0];
        
        // We can't put Sets easily in persist, but dirtySrs doesn't need to persist to local storage.
        const newDirty = new Set(state.dirtySrs);
        let srsChanged = false;

        Object.keys(newSrs).forEach((id) => {
          if (JSON.stringify(newSrs[id]) !== JSON.stringify(state.progress.srs[id])) {
            newDirty.add(id);
            srsChanged = true;
          }
        });

        let { streak, todayReviewCount, lastStudyDate } = state.progress;
        const { studyDays } = state.progress;
        const newStudyDays = { ...studyDays };

        if (srsChanged) {
          todayReviewCount += 1;

          if (lastStudyDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastStudyDate === yesterdayStr) {
              streak += 1;
            } else {
              streak = 1;
            }

            lastStudyDate = today;
            newStudyDays[today] = (newStudyDays[today] || 0) + 1;
          } else {
            newStudyDays[today] = (newStudyDays[today] || 0) + 1;
          }
        }

        set({
          dirtySrs: newDirty,
          progress: {
            ...state.progress,
            xp: newXp,
            level: calculateLevel(newXp),
            srs: newSrs,
            streak,
            todayReviewCount,
            lastStudyDate,
            studyDays: newStudyDays,
          },
        });
      },

      addToSRS: (wordId) => {
        const state = get();
        if (state.progress.srs[wordId]) return;

        const newDirty = new Set(state.dirtySrs);
        newDirty.add(wordId);

        state.updateProgress(state.progress.xp, {
          ...state.progress.srs,
          [wordId]: createNewCardState(),
        });
        
        // The updateProgress already modifies dirtySrs, but doing it again to be safe
        set({ dirtySrs: newDirty });
      },

      exportData: () => {
        if (typeof window === "undefined") return;
        const state = get();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.progress));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `nihongoroute-save-${new Date().toISOString().split("T")[0]}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      },

      importData: (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData);
          if (parsed.xp !== undefined && typeof parsed.xp === "number") {
            set({ progress: parsed as UserProgress });
            return true;
          }
          return false;
        } catch (e) {
          console.error("Gagal mengurai file data import:", e);
          return false;
        }
      },
    }),
    {
      name: "nihongoroute_save_data",
      partialize: (state) => ({ progress: state.progress }), // Only save progress to localStorage
    }
  )
);

export const useProgress = useProgressStore;
