import { createClient } from "./client";
import { calculateLevel } from "@/lib/level";
import { UserProgress } from "@/store/types";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Sinkronisasi data progres dari LocalStorage (guest) ke Supabase (cloud)
 * saat user berhasil login.
 * 
 * @param {string} userId - ID Supabase user yang sedang login.
 * @param {UserProgress} localData - Data dari localStorage.
 * @returns {Promise<boolean>} Status keberhasilan sinkronisasi.
 */
export async function syncLocalToCloud(userId: string, localData: UserProgress, supabaseClient?: SupabaseClient): Promise<boolean> {
  const supabase = supabaseClient || createClient();
  
  try {
    // 1. Ambil data cloud saat ini untuk perbandingan (Conflict Resolution)
    const [profileRes, srsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("xp, streak, study_days, today_review_count, last_study_date, inventory, settings")
        .eq("id", userId)
        .single(),
      supabase
        .from("user_srs")
        .select("word_id, repetition, interval, ease_factor, next_review, updated_at")
        .eq("user_id", userId)
    ]);

    const cloudProfile = profileRes.data;
    const cloudSrs = srsRes.data || [];
    
    // Buat map untuk akses cepat data SRS cloud
    const cloudSrsMap = new Map(cloudSrs.map(item => [item.word_id, item]));

    // 2. Logika Merge: Ambil yang tertinggi/terbaik
    const mergedXP = Math.max(localData.xp || 0, cloudProfile?.xp || 0);
    const mergedStreak = Math.max(localData.streak || 0, cloudProfile?.streak || 0);
    
    // Merge Inventory (Streak Freeze)
    const localFreeze = localData.inventory?.streakFreeze || 0;
    const cloudFreeze = cloudProfile?.inventory?.streakFreeze || 0;
    const mergedInventory = {
      ...localData.inventory,
      streakFreeze: Math.max(localFreeze, cloudFreeze)
    };

    // Merge Settings
    const mergedSettings = {
      ...(cloudProfile?.settings || {}),
      ...(localData.settings || {})
    };

    // Gabungkan study_days (ambil nilai terbesar untuk setiap tanggal)
    const mergedStudyDays = { ...(cloudProfile?.study_days || {}) };
    Object.entries(localData.studyDays || {}).forEach(([date, count]) => {
      mergedStudyDays[date] = Math.max(count as number, (mergedStudyDays[date] as number) || 0);
    });

    // Gunakan review count dan tanggal terbaru
    const isCloudNewer = cloudProfile?.last_study_date && localData.lastStudyDate 
      ? new Date(cloudProfile.last_study_date) > new Date(localData.lastStudyDate)
      : false;
    
    const finalReviewCount = isCloudNewer ? cloudProfile?.today_review_count : localData.todayReviewCount;
    const finalLastDate = isCloudNewer ? cloudProfile?.last_study_date : localData.lastStudyDate;

    // 3. Upsert Profile (XP, Level, dan Gamifikasi)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        xp: mergedXP,
        level: calculateLevel(mergedXP),
        streak: mergedStreak,
        today_review_count: finalReviewCount || 0,
        last_study_date: finalLastDate,
        study_days: mergedStudyDays,
        inventory: mergedInventory,
        settings: mergedSettings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // 4. Gabungkan data SRS (Conflict Resolution untuk setiap kartu)
    const srsEntries = Object.entries(localData.srs).map(([wordId, localState]) => {
      const cloudState = cloudSrsMap.get(wordId);
      
      // Jika ada di cloud, bandingkan mana yang lebih baru
      if (cloudState && new Date(cloudState.updated_at).getTime() > localState.updatedAt) {
        return {
          user_id: userId,
          word_id: wordId,
          repetition: cloudState.repetition,
          interval: cloudState.interval,
          ease_factor: cloudState.ease_factor,
          next_review: cloudState.next_review,
          status: cloudState.interval > 21 ? 'graduated' : (cloudState.interval > 1 ? 'reviewing' : 'learning'),
          updated_at: cloudState.updated_at
        };
      }

      // Gunakan data lokal (lebih baru atau cloud belum punya)
      return {
        user_id: userId,
        word_id: wordId,
        repetition: localState.repetition,
        interval: localState.interval,
        ease_factor: localState.easeFactor,
        next_review: new Date(localState.nextReview).toISOString(),
        status: localState.interval > 21 ? 'graduated' : (localState.interval > 1 ? 'reviewing' : 'learning'),
        updated_at: new Date().toISOString()
      };
    });

    if (srsEntries.length > 0) {
      // 5. Bulk Upsert ke user_srs
      const { error: srsError } = await supabase
        .from("user_srs")
        .upsert(srsEntries, { onConflict: 'user_id,word_id' });

      if (srsError) throw srsError;
    }

    return true;
  } catch (error) {
    console.error("Gagal melakukan sinkronisasi data ke cloud:", error);
    return false;
  }
}

/**
 * Memeriksa dan memigrasi data dari LocalStorage lama ke Supabase.
 * Digunakan untuk user yang baru login pertama kali setelah menggunakan mode guest.
 * 
 * @param {string} userId - ID Supabase user.
 * @param {SupabaseClient} supabase - Instance Supabase client.
 * @returns {Promise<boolean>} Status keberhasilan migrasi.
 */
export async function handleLegacyMigration(userId: string, supabase: SupabaseClient): Promise<boolean> {
  // Guard: localStorage is only available on the client
  if (typeof window === "undefined") return false;

  const STATS_STORAGE_KEY = "nihongo-progress";
  const gamificationData = localStorage.getItem(STATS_STORAGE_KEY);
  
  if (!gamificationData) return false;

  try {
    const parsedStats = JSON.parse(gamificationData);
    const { useUserStore } = await import("@/store/useUserStore");
    const { useSRSStore } = await import("@/store/useSRSStore");
    const { useUIStore } = await import("@/store/useUIStore");
    
    const userState = useUserStore.getState();
    const currentProgress: UserProgress = {
      id: userState.id,
      isGuest: userState.isGuest,
      name: userState.name,
      xp: userState.xp,
      level: userState.level,
      streak: userState.streak,
      todayReviewCount: userState.todayReviewCount,
      lastStudyDate: userState.lastStudyDate,
      studyDays: userState.studyDays,
      inventory: userState.inventory,
      completedLessons: userState.completedLessons,
      srs: useSRSStore.getState().srs,
      notifications: useUIStore.getState().notifications,
      settings: useUIStore.getState().settings,
    };

    currentProgress.streak = parsedStats.streak;
    currentProgress.todayReviewCount = parsedStats.todayReviewCount;
    currentProgress.lastStudyDate = parsedStats.lastStudyDate;
    
    const migratedStudyDays: Record<string, number> = {};
    if (parsedStats.studyDays) {
      Object.entries(parsedStats.studyDays).forEach(([date, val]) => {
        migratedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
      });
    }
    currentProgress.studyDays = migratedStudyDays;

    const syncSuccess = await syncLocalToCloud(userId, currentProgress, supabase);
    if (syncSuccess) {
      localStorage.removeItem(STATS_STORAGE_KEY);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Gagal melakukan migrasi data lokal:", e);
    return false;
  }
}
