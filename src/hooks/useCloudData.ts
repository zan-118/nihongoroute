"use client";

/**
 * @file useCloudData.ts
 * @description Hook kustom offline-first pengelola pemuatan data paralel dari awan Supabase (profil, user_srs, user_lessons). Mengintegrasikannya dengan aman ke Zustand lokal (IndexedDB) menggunakan timestamp terbaru (updated_at) dan melakukan resolusi konflik secara mulus.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSRSStore } from "@/store/useSRSStore";
import { useUserStore } from "@/store/useUserStore";
import { useUIStore } from "@/store/useUIStore";
import { SRSState } from "@/lib/srs";
import { calculateLevel } from "@/lib/level";
import { getLocalDateString } from "@/lib/utils";
import { UserProgress, LessonProgress } from "@/store/types";
import { handleLegacyMigration } from "@/lib/supabase/sync";
import { Session } from "@supabase/supabase-js";
import { useStoreHydration } from "./useStoreHydration";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Hook kustom untuk mengambil dan merekonsiliasi seluruh data kemajuan belajar dari database awan ke luring.
 * 
 * @param {Session | null | undefined} session - Sesi aktif autentikasi Supabase
 * @param {boolean} hasMounted - Status apakah komponen pemanggil hook telah dimuat penuh di peramban
 * @returns {Object} Hasil kemajuan belajar awan dan status pemuatan data
 */
export function useCloudData(session: Session | null | undefined, hasMounted: boolean) {
  const supabase = useMemo(() => createClient(), []);
  
  // Mengambil tindakan penggabungan progres ke local stores
  const mergeProgress = useSRSStore((s) => s.mergeProgress);
  const setLoading = useUIStore((s) => s.setLoading);
  
  // Ref untuk menjamin penanganan migrasi data tamu hanya dieksekusi sekali di awal sesi
  const initialLoadDone = useRef(false);

  // Menunggu status hidrasi Zustand lokal (IndexedDB) selesai sepenuhnya sebelum fetching
  const userHydrated = useStoreHydration(useUserStore);
  const srsHydrated = useStoreHydration(useSRSStore);

  // TanStack Query untuk menarik progress terpadu dari Supabase
  const { data: cloudData, isLoading: isFetching } = useQuery({
    queryKey: ["user-progress", session?.user?.id],
    queryFn: async () => {
      // Penjaga: Sesi harus terautentikasi dan komponen terpasang di layar
      if (!session?.user || !hasMounted) return null;

      // Cek dan eksekusi migrasi jika ada riwayat belajar lokal dari akun Guest (tamu)
      if (!initialLoadDone.current) {
        await handleLegacyMigration(session.user.id, supabase);
        initialLoadDone.current = true;
      }

      // Ambil seluruh modul data secara paralel via Promise.all (menghindari waterfall latency)
      const [profileRes, srsRes, lessonsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, xp, level, streak, today_review_count, last_study_date, study_days, inventory, settings")
          .eq("id", session.user.id)
          .single(),
        supabase
          .from("user_srs")
          .select("word_id, interval, repetition, ease_factor, next_review, updated_at, custom_mnemonic")
          .eq("user_id", session.user.id),
        supabase
          .from("user_lessons")
          .select("lesson_id, is_completed, completed_at, updated_at")
          .eq("user_id", session.user.id)
      ]);

      const profile = profileRes.data;
      const srsData = srsRes.data;
      const lessonsData = lessonsRes.data;

      // 1. Parsing data kartu SRS awan ke bentuk record luring
      const parsedSrs: Record<string, SRSState> = {};
      if (srsData) {
        srsData.forEach((row) => {
          parsedSrs[row.word_id] = {
            interval: row.interval,
            repetition: row.repetition,
            easeFactor: row.ease_factor,
            nextReview: new Date(row.next_review).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            customMnemonic: row.custom_mnemonic || undefined
          };
        });
      }

      // 2. Parsing data riwayat pelajaran awan ke bentuk record luring
      const parsedLessons: Record<string, LessonProgress> = {};
      if (lessonsData) {
        lessonsData.forEach((row) => {
          parsedLessons[row.lesson_id] = {
            completedAt: new Date(row.completed_at).getTime(),
            updatedAt: new Date(row.updated_at).getTime(),
            isDeleted: !row.is_completed
          };
        });
      }

      // 3. Rekonsiliasi hitungan ulasan harian berdasarkan kecocokan tanggal lokal hari ini
      const today = getLocalDateString();
      let cloudReviewCount = profile?.today_review_count || 0;
      if (profile?.last_study_date !== today) {
        cloudReviewCount = 0;
      }

      // 4. Sanitasi data log hari belajar pengguna
      const sanitizedStudyDays: Record<string, number> = {};
      if (profile?.study_days) {
        Object.entries(profile.study_days).forEach(([date, val]) => {
          sanitizedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
        });
      }

      // Kembalikan objek UserProgress yang terpadu
      return {
        id: session!.user.id,
        isGuest: false,
        name: profile?.full_name || null,
        xp: profile?.xp || 0,
        level: profile?.level || calculateLevel(profile?.xp || 0),
        streak: profile?.streak || 0,
        todayReviewCount: cloudReviewCount,
        lastStudyDate: profile?.last_study_date || null,
        studyDays: sanitizedStudyDays,
        srs: parsedSrs,
        completedLessons: parsedLessons,
        inventory: profile?.inventory || { streakFreeze: 0 },
        settings: profile?.settings || { notificationsEnabled: false },
        notifications: [],
      } as UserProgress;
    },
    enabled: hasMounted && !!session?.user && userHydrated && srsHydrated,
  });

  // Sinkronkan Cloud Data ke Zustand jika ada perubahan riil pada properti data
  // Guard khusus: Hanya picu mergeProgress jika XP, panjang SRS, panjang lesson, streak, atau lastStudyDate berubah
  const lastMergedKey = useRef<string>("");
  useEffect(() => {
    if (cloudData && hasMounted) {
      const mergeKey = `${cloudData.xp}-${Object.keys(cloudData.srs).length}-${Object.keys(cloudData.completedLessons).length}-${cloudData.streak}-${cloudData.lastStudyDate}`;
      if (mergeKey !== lastMergedKey.current) {
        lastMergedKey.current = mergeKey;
        mergeProgress(cloudData);
      }
    }
  }, [cloudData, mergeProgress, hasMounted]);

  // Efek Samping: Selaraskan indikator pemuatan global dengan status fetching query
  useEffect(() => {
    if (hasMounted) {
      setLoading(isFetching);
    }
  }, [isFetching, setLoading, hasMounted]);

  return { cloudData, isFetching };
}
