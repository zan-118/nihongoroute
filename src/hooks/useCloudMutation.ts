"use client";

/**
 * @file useCloudMutation.ts
 * @description Hook kustom offline-first pengontrol sinkronisasi mutasi batch data belajar lokal kotor (dirty) ke awan Supabase via RPC sync_user_progress. Dilengkapi penanganan retry exponential backoff 3 kali dan broadcast sinyal multi-tab.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { SRSState } from "@/lib/srs";
import { Inventory, Settings, LessonProgress } from "@/store/types";
import { Session } from "@supabase/supabase-js";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Hook kustom untuk memicu mutasi data progres belajar kotor luring ke database awan.
 * 
 * @param {Session | null | undefined} session - Sesi aktif autentikasi Supabase
 * @returns {UseMutationResult} Status mutasi TanStack Query untuk eksekusi sinkronisasi
 */
export function useCloudMutation(session: Session | null | undefined) {
  const supabase = useMemo(() => createClient(), []);
  
  // Mengambil pengendali status visual sinkronisasi dari UIStore
  const setSyncing = useUIStore((s) => s.setSyncing);
  const setSyncError = useUIStore((s) => s.setSyncError);
  
  // Mengambil pengendali pembersih data kotor dari SRSStore
  const clearDirtySrs = useSRSStore((s) => s.clearDirtySrs);

  // Inisialisasi Mutasi Awan via TanStack Query (React Query)
  const syncMutation = useMutation({
    mutationFn: async (data: {
      progress: { 
        name: string | null;
        xp: number;
        streak: number;
        todayReviewCount: number;
        lastStudyDate: string | null;
        studyDays: Record<string, number>;
        inventory: Inventory;
        settings: Settings;
        srs: Record<string, SRSState>;
        completedLessons: Record<string, LessonProgress>;
      };
      dirtySrs: Set<string>;
      dirtyLessons: Set<string>;
    }) => {
      // Aktifkan indikator sinkronisasi di UI
      setSyncing(true);
      
      // Batalkan jika sesi pengguna tidak valid
      if (!session?.user) return;

      const { progress, dirtySrs, dirtyLessons } = data;

      // 1. Konversi data kartu SRS kotor (dirtySrs Set) menjadi array objek baris relasional
      const srsUpdates = Array.from(dirtySrs)
        .map(id => {
          const state = progress.srs[id];

          if (!state) {
            const now = new Date().toISOString();
            return {
              word_id: id,
              repetition: 0,
              interval: 1,
              ease_factor: 2.5,
              next_review: now,
              updated_at: now,
              status: 'learning',
              is_deleted: true,
              custom_mnemonic: null
            };
          }

          return {
            word_id: id,
            repetition: state.repetition,
            interval: state.interval,
            ease_factor: state.easeFactor,
            next_review: new Date(state.nextReview).toISOString(),
            updated_at: new Date(state.updatedAt).toISOString(),
            // Konversi klasifikasi status kartu berdasarkan panjang interval (SM-2)
            status: state.interval > 21 ? 'graduated' : (state.interval > 1 ? 'reviewing' : 'learning'),
            is_deleted: !!state.isDeleted,
            custom_mnemonic: state.customMnemonic || null
          };
        });

      // 2. Konversi data progres pelajaran kotor (dirtyLessons Set) menjadi array objek baris relasional
      const lessonUpdates = Array.from(dirtyLessons)
        .filter(id => progress.completedLessons[id])
        .map(id => {
          const state = progress.completedLessons[id];
          return {
            lesson_id: id,
            is_completed: !state.isDeleted,
            completed_at: new Date(state.completedAt).toISOString(),
            updated_at: new Date(state.updatedAt).toISOString(),
            is_deleted: !!state.isDeleted
          };
        });

      // 3. Eksekusi RPC Supabase: Panggil 'sync_user_progress' secara terpadu di server database
      const { data: rpcData, error: rpcError } = await supabase.rpc('sync_user_progress', {
        p_full_name: progress.name,
        p_xp: progress.xp,
        p_streak: progress.streak,
        p_today_review_count: progress.todayReviewCount,
        p_last_study_date: progress.lastStudyDate,
        p_study_days: progress.studyDays,
        p_inventory: progress.inventory,
        p_settings: progress.settings,
        p_srs_updates: srsUpdates,
        p_lesson_updates: lessonUpdates
      });

      if (rpcError) throw rpcError;

      // Menampung nilai Poin XP yang valid/disetujui oleh algoritma anti-cheat di sisi database
      const acceptedXp = (rpcData as { accepted_xp?: number })?.accepted_xp;

      return { 
        success: true, 
        syncedWordIds: Array.from(dirtySrs), 
        syncedLessonIds: Array.from(dirtyLessons),
        acceptedXp 
      };
    },
    onSuccess: (result) => {
      // Matikan indikator pemuatan dan error
      setSyncing(false);
      setSyncError(false);
      
      if (result?.success) {
        // Hapus status penanda kotor pada file lokal setelah database sukses menyimpan data
        if (result.syncedWordIds) clearDirtySrs(result.syncedWordIds);
        if (result.syncedLessonIds) useUserStore.getState().clearDirtyLessons(result.syncedLessonIds);
        
        // Perbarui Poin XP lokal agar sinkron dengan batasan anti-cheat server
        if (result.acceptedXp !== undefined) {
          useUserStore.getState().setGamification({ xp: result.acceptedXp });
        }
        
        // Multi-Tab Integrity: Siarkan pesan keberhasilan sinkronisasi ke seluruh tab aktif peramban
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const channel = new BroadcastChannel("nihongoroute_sync");
          channel.postMessage("SYNC_COMPLETE");
          channel.close();
        }
      }
    },
    onError: (error) => {
      console.error("Sinkronisasi gagal setelah beberapa kali percobaan ulang:", error);
      setSyncing(false);
      setSyncError(true);
    },
    // Pengaturan percobaan ulang (retry) 3 kali dengan jeda exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return syncMutation;
}
