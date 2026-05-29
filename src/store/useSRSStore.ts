/**
 * @file useSRSStore.ts
 * @description Zustand Store luring pengelola basis data lokal sistem Spaced Repetition (SRS) belajar bahasa Jepang. Di-persist otomatis ke IndexedDB peramban via idb-keyval. Menyimpan kartu lokal beserta metadata interval, kemudahan (e-factor), status repetisi, dan melacak data kotor (dirtySrs) untuk disinkronkan ke cloud.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { SRSState, createNewCardState } from "@/lib/srs";
import { getLocalDateString } from "@/lib/utils";
import { calculateLevel } from "@/lib/level";
import { calculateNewStreak, mergeGamification } from "@/lib/gamification";
import { useUserStore } from "./useUserStore";
import { useUIStore } from "./useUIStore";
import { UserProgress } from "./types";

// ==========================================
// ANTARMUKA STATE STORE
// ==========================================
/**
 * Mendefinisikan struktur state dan aksi untuk Zustand store pengulangan cerdas (SRS).
 * Mengelola kartu SRS lokal dan penandaan kartu yang belum tersinkronisasi ke cloud (dirty).
 */
interface SRSStateStore {
  srs: Record<string, SRSState>;
  dirtySrs: Set<string>;
  
  setSRS: (srs: Record<string, SRSState>) => void;
  setDirtySrs: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  clearDirtySrs: (syncedIds?: string[]) => void;
  
  updateProgress: (newXp: number, srsUpdates: Record<string, SRSState>) => void;
  addToSRS: (wordId: string) => void;
  removeFromSRS: (wordId: string) => void;
  updateCustomMnemonic: (wordId: string, text: string) => void;
  mergeProgress: (cloudData: UserProgress) => void;
  resetSRS: () => void;
}

// ==========================================
// ZUSTAND STORE UTAMA
// ==========================================
/**
 * Zustand Store untuk merekam kemajuan belajar spaced repetition (SRS) secara aman dan luring.
 */
export const useSRSStore = create<SRSStateStore>()(
  persist(
    (set, get) => ({
      srs: {},
      dirtySrs: new Set<string>(),

      setSRS: (srs) => set({ srs }),

      setDirtySrs: (updater) => set((state) => ({ 
        dirtySrs: typeof updater === 'function' ? updater(state.dirtySrs) : updater 
      })),

      clearDirtySrs: (syncedIds) => set((state) => {
        if (!syncedIds) return { dirtySrs: new Set() };
        const newDirty = new Set(state.dirtySrs);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtySrs: newDirty };
      }),

      updateProgress: (newXp, srsUpdates) => {
        // Ambil string tanggal hari ini di tingkat lokal
        const today = getLocalDateString();
        const userState = useUserStore.getState();
        
        const newDirty = new Set(get().dirtySrs);
        const newSrs = { ...get().srs };
        let srsChanged = false;

        // Tandai seluruh kata yang mengalami perubahan sebagai data kotor (dirtySrs)
        Object.keys(srsUpdates).forEach((id) => {
          newSrs[id] = srsUpdates[id];
          newDirty.add(id);
          srsChanged = true;
        });

        // 1. Jika ada perubahan kartu SRS lokal, hitung ulang progres gamifikasi & hari beruntun (streak)
        if (srsChanged) {
          const { streak, todayReviewCount, lastStudyDate, inventory, studyDays } = userState;
          
          // Kalkulasi streak baru dengan mendeteksi konsumsi item Streak Freeze luring
          const { streak: newStreak, streakFreezeUsed } = calculateNewStreak(
            streak,
            lastStudyDate,
            inventory,
            useUIStore.getState().addNotification
          );

          const newStudyDays = { ...studyDays };
          newStudyDays[today] = (newStudyDays[today] || 0) + 1;

          // Perbarui informasi gamifikasi lokal di dalam UserStore
          useUserStore.getState().setGamification({
            xp: newXp,
            level: calculateLevel(newXp),
            streak: newStreak,
            todayReviewCount: lastStudyDate === today ? todayReviewCount + 1 : 1,
            lastStudyDate: today,
            studyDays: newStudyDays,
            inventory: { 
              ...inventory, 
              streakFreeze: streakFreezeUsed ? inventory.streakFreeze - 1 : inventory.streakFreeze 
            }
          });
        } else {
          // Jika tidak ada perubahan kartu, cukup tambahkan perolehan Poin XP murni
          useUserStore.getState().addXP(newXp - userState.xp);
        }

        set({ srs: newSrs, dirtySrs: newDirty });
      },

      addToSRS: (wordId) => {
        // Abaikan jika kata sudah terdaftar di database luring SRS
        if (get().srs[wordId]) return;
        
        // Daftarkan sebagai kartu baru dengan status inisiasi belajar awal (learning)
        get().updateProgress(useUserStore.getState().xp, {
          [wordId]: createNewCardState(),
        });
      },

      removeFromSRS: (wordId) => {
        if (!get().srs[wordId]) return;
        
        const newDirty = new Set(get().dirtySrs);
        newDirty.add(wordId);
        
        const newSrs = { ...get().srs };
        newSrs[wordId] = {
          ...newSrs[wordId],
          isDeleted: true, // Berikan penanda dihapus agar disinkronkan ke cloud sebelum dihapus fisik
          updatedAt: Date.now()
        };
        set({ srs: newSrs, dirtySrs: newDirty });
      },

      updateCustomMnemonic: (wordId, text) => {
        const newSrs = { ...get().srs };
        const existing = newSrs[wordId] || createNewCardState();
        newSrs[wordId] = {
          ...existing,
          customMnemonic: text, // Simpan teks mnemonik kustom lokal
          updatedAt: Date.now()
        };
        
        const newDirty = new Set(get().dirtySrs);
        newDirty.add(wordId);
        set({ srs: newSrs, dirtySrs: newDirty });
      },

      mergeProgress: (cloudData) => {
        const localSrs = get().srs;
        const userState = useUserStore.getState();
        const uiState = useUIStore.getState();
        
        // 1. Integrasikan Kemajuan Gamifikasi Awan & Lokal (Extracted Helper)
        const mergedGamification = mergeGamification(userState, cloudData);

        // 2. Integrasikan Kemajuan Kartu SRS Awan & Lokal
        const mergedSrs = { ...cloudData.srs };
        
        // Memulihkan tipe Set pada dirtySrs lokal jika mengalami kegagalan serialisasi IndexedDB
        let recoveredDirty: Set<string>;
        try {
          const rawDirty = get().dirtySrs;
          recoveredDirty = rawDirty instanceof Set 
            ? rawDirty 
            : new Set(Array.isArray(rawDirty) ? rawDirty : []);
        } catch {
          recoveredDirty = new Set();
        }
        
        const newDirty = new Set(recoveredDirty);

        // Pindai dan selesaikan konflik kartu menggunakan timestamp terbaru (updatedAt)
        Object.entries(localSrs).forEach(([id, localState]) => {
          const cloudState = cloudData.srs[id];
          
          // Jika kartu dihapus lokal, hapus dari daftar gabungan dan tandai kotor untuk awan
          if (localState.isDeleted) {
            if (cloudState) {
              newDirty.add(id);
              delete mergedSrs[id];
            }
            return;
          }
          
          // Jika kartu tidak ada di awan, pertahankan kartu lokal dan tandai kotor
          if (!cloudState) {
            mergedSrs[id] = localState;
            newDirty.add(id);
          } else {
            // Resolusi Konflik: Ambil data dengan timestamp updatedAt terbaru
            if (localState.updatedAt > cloudState.updatedAt) {
              mergedSrs[id] = localState;
              newDirty.add(id);
            } else {
              mergedSrs[id] = cloudState;
              newDirty.delete(id); // Bersihkan dari antrean sinkronisasi jika data awan lebih baru
            }
          }
        });

        // 3. Integrasikan Riwayat Pelajaran Selesai Awan & Lokal
        const localLessons = userState.completedLessons || {};
        const cloudLessons = cloudData.completedLessons || {};
        const mergedLessons = { ...cloudLessons };
        const newDirtyLessons = new Set(userState.dirtyLessons);

        Object.entries(localLessons).forEach(([id, localState]) => {
          const cloudState = cloudLessons[id];
          if (localState.isDeleted) {
            if (cloudState && !cloudState.isDeleted) {
              newDirtyLessons.add(id);
              mergedLessons[id] = localState;
            }
            return;
          }
          if (!cloudState) {
            mergedLessons[id] = localState;
            newDirtyLessons.add(id);
          } else {
            // Resolusi Konflik: Bandingkan timestamp pelajaran
            if (localState.updatedAt > cloudState.updatedAt) {
              mergedLessons[id] = localState;
              newDirtyLessons.add(id);
            } else {
              mergedLessons[id] = cloudState;
              newDirtyLessons.delete(id);
            }
          }
        });

        // 4. Perbarui Informasi di Seluruh Stores Lokal
        useUserStore.getState().setGamification({
          ...mergedGamification,
          name: cloudData.name || userState.name,
          lastStudyDate: cloudData.lastStudyDate,
          completedLessons: mergedLessons,
        });

        useUserStore.getState().setDirtyLessons(newDirtyLessons);

        uiState.toggleNotifications(cloudData.settings.notificationsEnabled);

        set({ srs: mergedSrs, dirtySrs: newDirty });
      },

      resetSRS: () => set({ srs: {}, dirtySrs: new Set() }),
    }),
    {
      name: "nihongoroute_srs_data",
      storage: {
        getItem: async (name) => {
          const data = await get(name);
          if (!data) return null;
          
          try {
            // Parsing manual untuk memulihkan struktur Set (reviver)
            const parsed = JSON.parse(data, (key, value) => {
              if (key === 'dirtySrs' && Array.isArray(value)) {
                return new Set(value);
              }
              return value;
            });
            return parsed;
          } catch (e) {
            console.error("Gagal mengurai data SRS store:", e);
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            // Serialisasi manual untuk menangani konversi tipe Set ke Array (replacer)
            const stringified = JSON.stringify(value, (key, val) => {
              if (val instanceof Set) {
                return Array.from(val);
              }
              return val;
            });
            await idbSet(name, stringified);
          } catch (e) {
            console.error("Gagal menyimpan data SRS store:", e);
          }
        },
        removeItem: async (name) => await del(name),
      },
    }
  )
);

if (typeof window !== "undefined") {
  (window as unknown as Record<string, typeof useSRSStore>).useSRSStore = useSRSStore;
}

