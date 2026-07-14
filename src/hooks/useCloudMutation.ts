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
import { buildLessonUpdates, buildSrsUpdates } from "@/lib/cloud-sync-payload";
import { Inventory, Settings, LessonProgress } from "@/store/types";
import { Session } from "@supabase/supabase-js";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Custom hook to synchronize offline-first local study progress to Supabase cloud database.
 * Handles batch updates, exponential backoff retries, and multi-tab synchronization signals.
 * 
 * @param session - Active Supabase authentication session.
 * @returns TanStack Query mutation object for executing the sync.
 */
export function useCloudMutation(session: Session | null | undefined) {
  // Memoize Supabase client instance to prevent recreation on re-renders
  const supabase = useMemo(() => createClient(), []);
  
  // Mengambil pengendali status visual sinkronisasi dari UIStore
  const setSyncing = useUIStore((s) => s.setSyncing);
  const setSyncError = useUIStore((s) => s.setSyncError);
  
  // Mengambil pengendali pembersih data kotor dari SRSStore
  const clearDirtySrs = useSRSStore((s) => s.clearDirtySrs);

  // Inisialisasi Mutasi Awan via TanStack Query (React Query)
  const syncMutation = useMutation({
    /**
     * Performs the network request to sync local progress with the remote database.
     * 
     * @param data - The local progress data and sets of dirty item IDs.
     * @returns Sync result containing status and synced IDs.
     */
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
      const srsUpdates = buildSrsUpdates(progress.srs, dirtySrs);

      // 2. Konversi data progres pelajaran kotor (dirtyLessons Set) menjadi array objek baris relasional
      const lessonUpdates = buildLessonUpdates(progress.completedLessons, dirtyLessons);

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
    /**
     * Callback executed upon successful mutation. Clears dirty flags and broadcasts sync event.
     */
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
    /**
     * Callback executed when mutation fails after all retries.
     */
    onError: (error) => {
      console.error("Sinkronisasi gagal setelah beberapa kali percobaan ulang:", error);
      setSyncing(false);
      setSyncError(true);
    },
    // Pengaturan percobaan ulang (retry) 3 kali dengan jeda exponential backoff
    retry: 3,
    // Exponential backoff delay calculation: 2^attempt * 1000ms, capped at 10 seconds
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  return syncMutation;
}