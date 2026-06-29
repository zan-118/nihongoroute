"use client";

/**
 * @file useSyncProgress.ts
 * @description Hook kustom offline-first selaku orkestrator utama sinkronisasi data progres belajar pengguna (Zustand & Supabase). Mengamati perubahan state lokal, mengonsolidasi data kotor (dirty), melakukan debouncing asinkron selama 2000ms, lalu mengeksekusi mutasi batch terenkripsi ke Supabase.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useEffect, useRef, useMemo, useCallback } from "react";
import { useHasMounted } from "@/hooks/useHasMounted";
import { useCloudData } from "./useCloudData";
import { useCloudMutation } from "./useCloudMutation";
import { useStoreHydration } from "./useStoreHydration";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Hook kustom untuk menyinkronkan data gamifikasi, target belajar, dan status SRS luring ke database awan Supabase.
 * 
 * @returns {Object} Aksi pemantau sinkronisasi (isLoading, syncNow)
 */
export function useSyncProgress() {
  const supabase = useMemo(() => createClient(), []);
  
  const userHydrated = useStoreHydration(useUserStore);
  const srsHydrated = useStoreHydration(useSRSStore);
  
  // ==========================================
  // SELEKTOR STATE LOKAL (ZUSTAND STORES)
  // ==========================================
  
  // Mengambil properti profil atomik dari useUserStore untuk mencegah pemicuan rendering tak terbatas (infinite render)
  const name = useUserStore((s) => s.name);
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);
  const todayReviewCount = useUserStore((s) => s.todayReviewCount);
  const lastStudyDate = useUserStore((s) => s.lastStudyDate);
  const studyDays = useUserStore((s) => s.studyDays);
  const inventory = useUserStore((s) => s.inventory);
  const isGuest = useUserStore((s) => s.isGuest);

  // Melacak ukuran Set data kotor menggunakan tipe primitif number demi menjaga kestabilan dependency array
  // Menggunakan selektor atomik untuk menghindari langganan ke seluruh objek set
  const dirtyLessonsSize = useUserStore((s) => s.dirtyLessons.size);
  const dirtySrsSize = useSRSStore((s) => s.dirtySrs.size);

  // Mengambil preferensi antarmuka pengguna
  const settings = useUIStore((s) => s.settings);

  const hasMounted = useHasMounted();

  // ==========================================
  // TIER 2 & TIER 3: ALUR ALIRAN DATA SINKRONISASI
  // ==========================================

  // 1. Kueri Sesi Pengguna: Mendapatkan status login aktif secara aman dari klien Supabase
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
    enabled: hasMounted,
  });

  // 2. Mengambil Data Awan: Menarik profil, SRS, dan data pelajaran dari database saat inisialisasi awal
  const { cloudData, isFetching } = useCloudData(session, hasMounted);

  // 3. Mutasi Awan: Mempersiapkan fungsi eksekusi RPC Supabase dengan strategi retry asinkron
  const syncMutation = useCloudMutation(session);

  // 4. Sinkronisasi Lintas Tab (Multi-Tab Integrity):
  // Mendengarkan saluran penyiaran lokal. Jika tab lain sukses melakukan sinkronisasi awan,
  // tab aktif ini akan membuang cache React Query untuk menyelaraskan data secara instan.
  const queryClient = useQueryClient();
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.onmessage = (event) => {
      if (event.data === "SYNC_COMPLETE") {
        queryClient.invalidateQueries({ queryKey: ["user-progress"] });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // 5. Orkestrator Sinkronisasi Latar Belakang (Debounced Auto-Sync):
  const lastSyncedProgress = useRef<string>("");
  const syncMutateRef = useRef(syncMutation.mutate);
  
  useEffect(() => {
    syncMutateRef.current = syncMutation.mutate;
  }, [syncMutation.mutate]);

  const isPending = syncMutation.isPending;

  // Serialisasi data profil menjadi string stabil untuk mendeteksi perubahan properti secara presisi
  const profileKey = useMemo(() => {
    const invLength = inventory?.achievements?.length || 0;
    const freeze = inventory?.streakFreeze || 0;
    const notifs = settings?.notificationsEnabled ? 1 : 0;
    return `${name}-${xp}-${streak}-${lastStudyDate}-${todayReviewCount}-${invLength}-${freeze}-${notifs}`;
  }, [name, xp, streak, lastStudyDate, todayReviewCount, inventory?.achievements?.length, inventory?.streakFreeze, settings?.notificationsEnabled]);

  // Serialisasi data profil dari cloud untuk menyelaraskan status sinkronisasi pasca-merge
  const cloudProfileKey = useMemo(() => {
    if (!cloudData) return "";
    const invLength = cloudData.inventory?.achievements?.length || 0;
    const freeze = cloudData.inventory?.streakFreeze || 0;
    const notifs = cloudData.settings?.notificationsEnabled ? 1 : 0;
    return `${cloudData.name}-${cloudData.xp}-${cloudData.streak}-${cloudData.lastStudyDate}-${cloudData.todayReviewCount}-${invLength}-${freeze}-${notifs}`;
  }, [cloudData]);

  // Selaraskan lastSyncedProgress.current dengan profil cloud yang baru saja di-merge
  useEffect(() => {
    if (cloudProfileKey) {
      lastSyncedProgress.current = cloudProfileKey;
    }
  }, [cloudProfileKey]);

  // Efek Samping Auto-Sync: Berjalan secara otomatis jika terdeteksi data kotor lokal atau perubahan profil.
  // Menerapkan debounce selama 2000ms untuk meredam pemanggilan berulang yang sia-sia.
  useEffect(() => {
    // Penjaga: Jangan sinkronisasi jika data sedang dimuat, sedang dikirim, pengguna tamu, atau belum terhidrasi
    if (isFetching || isPending || !session?.user || isGuest || !userHydrated || !srsHydrated) return;

    const isProfileChanged = profileKey !== lastSyncedProgress.current;

    // Jika profil tidak berubah dan tidak ada item kotor lokal, batalkan sinkronisasi
    if (!isProfileChanged && dirtySrsSize === 0 && dirtyLessonsSize === 0) return;

    const timer = setTimeout(() => {
      // Dapatkan data SRS & Pelajaran terbaru secara dinamis dari store tanpa berlangganan (anti-render)
      const userState = useUserStore.getState();
      const srsState = useSRSStore.getState();
      const currentSrs = srsState.srs;
      const currentCompletedLessons = userState.completedLessons;
      const currentDirtySrs = srsState.dirtySrs;
      const currentDirtyLessons = userState.dirtyLessons;

      const currentProgress = {
        name: userState.name, 
        xp: userState.xp, 
        streak: userState.streak, 
        todayReviewCount: userState.todayReviewCount, 
        lastStudyDate: userState.lastStudyDate, 
        studyDays: userState.studyDays,
        inventory: userState.inventory, 
        settings: (userState as any).settings, 
        srs: currentSrs, 
        completedLessons: currentCompletedLessons
      };
      syncMutateRef.current({
        progress: currentProgress,
        dirtySrs: currentDirtySrs,
        dirtyLessons: currentDirtyLessons
      });
      lastSyncedProgress.current = profileKey;
    }, 2000);

    return () => clearTimeout(timer);
  }, [profileKey, dirtySrsSize, dirtyLessonsSize, session?.user, isFetching, isPending, isGuest, userHydrated, srsHydrated]);

  // Fungsi sinkronisasi manual instan
  const syncNow = useCallback(() => {
    const currentSrs = useSRSStore.getState().srs;
    const currentCompletedLessons = useUserStore.getState().completedLessons;
    const currentDirtySrs = useSRSStore.getState().dirtySrs;
    const currentDirtyLessons = useUserStore.getState().dirtyLessons;

    const currentProgress = {
      name, xp, streak, todayReviewCount, lastStudyDate, studyDays,
      inventory, settings, srs: currentSrs, completedLessons: currentCompletedLessons
    };
    syncMutation.mutate({
      progress: currentProgress,
      dirtySrs: currentDirtySrs,
      dirtyLessons: currentDirtyLessons
    });
  }, [name, xp, streak, todayReviewCount, lastStudyDate, studyDays, inventory, settings, syncMutation]);

  return { isLoading: isFetching, syncNow };
}
