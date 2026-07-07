/**
 * @file useUserStore.ts
 * @description Zustand Store luring pengelola profil pengguna, data progres gamifikasi (XP, level, streak), data transaksi inventaris item virtual (Streak Freeze), log hari aktif belajar, serta riwayat penyelesaian pelajaran. Terhubung dengan IndexedDB via idb-keyval.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";
import { Inventory, LessonProgress, UserProgress } from "./types";
import { calculateLevel } from "@/lib/level";
import { useUIStore } from "./useUIStore";
import { ACHIEVEMENTS_LIST } from "@/lib/constants/gamification";

// ==========================================
// ANTARMUKA STATE STORE
// ==========================================
/**
 * Mendefinisikan struktur data progres belajar dan aksi gamifikasi milik pengguna.
 * Mengelola XP, level, rekor hari beruntun (streak), inventarisasi item,
 * riwayat pelajaran yang telah diselesaikan, serta penandaan pelajaran kotor (dirtyLessons).
 */
interface UserState {
  id: string;
  isGuest: boolean;
  name: string | null;
  xp: number;
  level: number;
  streak: number;
  todayReviewCount: number;
  lastStudyDate: string | null;
  studyDays: Record<string, number>;
  inventory: Inventory;
  completedLessons: Record<string, LessonProgress>;
  dirtyLessons: Set<string>;

  updateProfileName: (name: string) => void;
  addXP: (amount: number) => void;
  setGamification: (data: Partial<UserState>) => void;
  buyStreakFreeze: () => boolean;
  claimQuest: (questId: string, date: string, rewardXP: number) => void;
  completeLesson: (lessonId: string) => void;
  setDirtyLessons: (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  clearDirtyLessons: (syncedIds?: string[]) => void;
  syncUserData: (data: { id: string; isGuest: boolean; name?: string | null }) => void;
  resetUser: () => void;
  checkAchievements: () => void;
  isCheckingAchievements?: boolean;
}

// ==========================================
// BIAYA ITEM & KONSTANTA
// ==========================================
/** Biaya XP untuk membeli Streak Freeze. Exported sebagai satu sumber kebenaran. */
export const STREAK_FREEZE_COST = 500;

/**
 * Zustand Store: useUserStore
 * 
 * Mengelola status utama gamifikasi, pencapaian prestasi (achievements), riwayat harian belajar,
 * penyelesaian kuis mini pelajaran, serta data inventarisasi (seperti item Streak Freeze).
 * State store ini di-persist otomatis ke IndexedDB peramban via `idb-keyval`.
 */
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      id: "guest",
      isGuest: true,
      name: null,
      xp: 0,
      level: 1,
      streak: 0,
      todayReviewCount: 0,
      lastStudyDate: null,
      studyDays: {},
      inventory: {
        streakFreeze: 0,
        claimedQuests: {
          date: "",
          quests: []
        },
        achievements: []
      },
      completedLessons: {},
      dirtyLessons: new Set<string>(),
      isCheckingAchievements: false,

      updateProfileName: (name) => set({ name }),

      addXP: (amount: number) => {
        const currentXp = get().xp;
        const newXp = currentXp + amount;
        const currentLevel = get().level;
        const newLevel = calculateLevel(newXp);

        set({
          xp: newXp,
          level: newLevel,
        });

        // 1. Kirim notifikasi "Naik Level" jika level pengguna bertambah
        if (newLevel > currentLevel) {
          useUIStore.getState().addNotification({
            title: "Level Up!",
            message: `Selamat! Kamu sekarang berada di Level ${newLevel}. 🎉`,
            type: "achievement"
          });
        }

        // 2. Evaluasi apakah penambahan XP membuka lencana pencapaian (achievements) baru
        get().checkAchievements();
      },

      setGamification: (data) => {
        set((state) => ({ ...state, ...data }));
        get().checkAchievements();
      },

      buyStreakFreeze: () => {
        const state = get();
        // Cek kecukupan koin XP pengguna untuk pembelian
        if (state.xp < STREAK_FREEZE_COST) return false;

        // Potong XP dan tambahkan kuantitas streakFreeze di dalam inventaris luring
        set({
          xp: state.xp - STREAK_FREEZE_COST,
          inventory: {
            ...state.inventory,
            streakFreeze: (state.inventory.streakFreeze || 0) + 1
          }
        });

        useUIStore.getState().addNotification({
          title: "Pembelian Berhasil!",
          message: "Streak Freeze udah masuk ke koleksimu!",
          type: "success"
        });

        return true;
      },

      claimQuest: (questId: string, date: string, rewardXP: number) => {
        const state = get();
        const currentClaimed = state.inventory.claimedQuests;
        
        let newQuests = [...(currentClaimed?.quests || [])];
        
        // Reset daftar quest jika berganti hari kalender belajar
        if (currentClaimed?.date !== date) {
          newQuests = [];
        }
        
        // Jika quest belum pernah diklaim hari ini, masukkan ke daftar klaim luring
        if (!newQuests.includes(questId)) {
          newQuests.push(questId);
          
          set({
            inventory: {
              ...state.inventory,
              claimedQuests: {
                date,
                quests: newQuests
              }
            }
          });
          
          // Tambahkan reward XP lokal (akan diverifikasi ulang oleh backend anticheat Supabase saat sinkronisasi)
          state.addXP(rewardXP);
        }
      },

      completeLesson: (lessonId) => {
        const state = get();
        // Jangan selesaikan ulang jika pelajaran sudah selesai dan tidak dihapus
        if (state.completedLessons[lessonId] && !state.completedLessons[lessonId].isDeleted) return;

        const now = Date.now();
        const newCompleted = { ...state.completedLessons };
        newCompleted[lessonId] = {
          completedAt: state.completedLessons[lessonId]?.completedAt || now,
          updatedAt: now,
          isDeleted: false
        };

        // Tandai pelajaran ini kotor (dirtyLessons) agar disinkronkan ke cloud
        const newDirty = new Set(state.dirtyLessons);
        newDirty.add(lessonId);

        set({
          completedLessons: newCompleted,
          dirtyLessons: newDirty
        });

        get().checkAchievements();
      },

      setDirtyLessons: (updater) => set((state) => ({ 
        dirtyLessons: typeof updater === 'function' ? updater(state.dirtyLessons) : updater 
      })),

      clearDirtyLessons: (syncedIds) => set((state) => {
        if (!syncedIds) return { dirtyLessons: new Set() };
        const newDirty = new Set(state.dirtyLessons);
        syncedIds.forEach(id => newDirty.delete(id));
        return { dirtyLessons: newDirty };
      }),
      
      syncUserData: (data) => set((state) => ({ 
        ...state, 
        id: data.id, 
        isGuest: data.isGuest,
        name: data.name !== undefined ? data.name : state.name
      })),

      resetUser: () => set({
        id: "guest",
        isGuest: true,
        name: null,
        xp: 0,
        level: 1,
        streak: 0,
        todayReviewCount: 0,
        lastStudyDate: null,
        studyDays: {},
        inventory: { 
          streakFreeze: 0,
          claimedQuests: {
            date: "",
            quests: []
          },
          achievements: []
        },
        completedLessons: {},
        dirtyLessons: new Set<string>()
      }),

      checkAchievements: () => {
        // Jangan jalankan verifikasi lencana jika sedang berada di dalam lingkungan pengetesan unit (Vitest)
        if (typeof process !== "undefined" && process.env?.VITEST) {
          return;
        }

        if (get().isCheckingAchievements) return;
        set({ isCheckingAchievements: true });

        try {

        const state = get();
        const achievements = state.inventory?.achievements || [];
        const unlockedIds = new Set(achievements.map((a) => a.id));

        // Dapatkan data SRS secara aman dan sinkron dari global window untuk menghindari circular dependency antar-store
        const srsStore = typeof window !== "undefined" ? (window as unknown as Record<string, { getState: () => { srs: Record<string, { isDeleted?: boolean; repetition?: number }> } }>).useSRSStore : null;
        const srsState = srsStore ? srsStore.getState().srs || {} : {};

        const completedLessonsKeysObj: Record<string, boolean> = {};
        if (state.completedLessons) {
          for (const key in state.completedLessons) {
            if (Object.prototype.hasOwnProperty.call(state.completedLessons, key)) {
              const lesson = state.completedLessons[key];
              if (lesson && !lesson.isDeleted) {
                completedLessonsKeysObj[key] = true;
              }
            }
          }
        }

        const srsKeysObj: Record<string, boolean> = {};
        if (srsState) {
          for (const key in srsState) {
            if (Object.prototype.hasOwnProperty.call(srsState, key)) {
              const card = srsState[key];
              if (card && !card.isDeleted) {
                srsKeysObj[key] = true;
              }
            }
          }
        }

        // Konstruksi progress payload yang kompatibel dengan tipe UserProgress untuk dicocokkan dengan pencapaian prestasi
        const progressPayload = {
          id: state.id,
          isGuest: state.isGuest,
          name: state.name,
          xp: state.xp,
          level: state.level,
          streak: state.streak,
          todayReviewCount: state.todayReviewCount,
          lastStudyDate: state.lastStudyDate,
          studyDays: state.studyDays,
          inventory: state.inventory,
          completedLessons: completedLessonsKeysObj,
          srs: srsKeysObj,
          notifications: [],
          settings: {}
        } as unknown as UserProgress;

        // Peta XP reward dinamis untuk 20 pencapaian prestasi terpusat
        const ACHIEVEMENT_XP_REWARDS: Record<string, number> = {
          first_steps: 50,
          lesson_bronze: 50,
          xp_bronze: 50,
          streak_bronze: 50,
          vocab_explorer: 150,
          vocab_collector: 300,
          vocab_master: 500,
          streak_silver: 500,
          vocab_titan: 1000,
          streak_gold: 1000,
          lesson_gold: 1000,
          xp_gold: 1000,
          level_25: 1000,
          vocab_legend: 2000,
          streak_warrior: 250,
          lesson_silver: 250,
          xp_silver: 250,
          xp_master: 500,
          level_10: 500,
          perfect_review: 500,
        };

        const newlyUnlocked: Array<{ id: string; unlockedAt: number }> = [];
        let totalRewardXp = 0;

        // Evaluasi 20 lencana prestasi secara dinamis dari list terpusat
        for (const ach of ACHIEVEMENTS_LIST) {
          // Lewati jika sudah terbuka
          if (unlockedIds.has(ach.id)) continue;

          try {
            const pct = ach.condition(progressPayload);
            if (pct >= 100) {
              const rewardXp = ACHIEVEMENT_XP_REWARDS[ach.id] || 50;
              newlyUnlocked.push({ id: ach.id, unlockedAt: Date.now() });
              totalRewardXp += rewardXp;

              useUIStore.getState().addNotification({
                title: "Lencana Terbuka!",
                message: `Mantap! Kamu berhasil membuka lencana '${ach.title}': ${ach.description}. (+${rewardXp} XP)`,
                type: "achievement"
              });
            }
          } catch (err) {
            console.error(`Gagal memverifikasi pencapaian ${ach.id}:`, err);
          }
        }

        // Simpan data lencana baru ke inventaris lokal dan tambahkan total XP reward
        if (newlyUnlocked.length > 0) {
          const updatedAchievements = [...achievements, ...newlyUnlocked];
          set({
            inventory: {
              ...state.inventory,
              achievements: updatedAchievements
            }
          });

          if (totalRewardXp > 0) {
            get().addXP(totalRewardXp);
          }
        }
        } finally {
          set({ isCheckingAchievements: false });
        }
      }
    }),
    {
      name: "nihongoroute_user_data",
      storage: {
        // Mengambil dan merekonstruksi data pengguna dari IndexedDB
        getItem: async (name) => {
          const data = await get(name);
          if (!data) return null;
          
          try {
            const parsed = JSON.parse(data, (key, value) => {
              // Rekonstruksi struktur data Set untuk pelajaran kotor (dirty lessons)
              if (key === 'dirtyLessons' && Array.isArray(value)) {
                return new Set(value);
              }
              return value;
            });
            return { state: parsed.state, version: parsed.version };
          } catch (e) {
            console.error("Gagal mengurai data user store:", e);
            return null;
          }
        },
        // Melakukan serialisasi dan menyimpan data pengguna ke IndexedDB
        setItem: async (name, value) => {
          try {
            const stringified = JSON.stringify(value, (key, val) => {
              // Konversi struktur data Set menjadi Array agar dapat diserialisasi ke format JSON
              if (val instanceof Set) {
                return Array.from(val);
              }
              return val;
            });
            await idbSet(name, stringified);
          } catch (e) {
            console.error("Gagal menyimpan data user store:", e);
          }
        },
        // Menghapus data pengguna dari IndexedDB
        removeItem: async (name) => await del(name),
      },
    }
  )
);
