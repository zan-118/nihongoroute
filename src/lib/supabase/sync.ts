/**
 * @file sync.ts
 * @description Modul orkestrator sinkronisasi data progres belajar pengguna dari penyimpanan lokal (guest) ke awan Supabase saat login sukses, dilengkapi integrasi migrasi data tamu lokal (handleLegacyMigration).
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { createClient } from "./client";
import { calculateLevel } from "@/lib/level";
import { UserProgress } from "@/store/types";
import { SupabaseClient } from "@supabase/supabase-js";

// ==========================================
// LOGIKA SINKRONISASI & RESOLUSI KONFLIK
// ==========================================
/**
 * Sync local guest progress to Supabase cloud.
 * Resolves conflicts by keeping highest values or newest timestamps.
 * 
 * @param userId Authenticated user ID.
 * @param localData Local progress state.
 * @param supabaseClient Optional Supabase client instance.
 * @returns True if sync succeeds.
 */
export async function syncLocalToCloud(userId: string, localData: UserProgress, supabaseClient?: SupabaseClient): Promise<boolean> {
  // Use provided client or create new instance.
  const supabase = supabaseClient || createClient();
  
  try {
    // 1. Ambil data cloud saat ini untuk perbandingan (Conflict Resolution)
    // Fetch profile and SRS data in parallel to minimize latency.
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
    const cloudSrs: Array<{ word_id: string; interval: number; repetition: number; ease_factor: number; next_review: string; updated_at: string }> = srsRes.data || [];
    
    // Map cloud SRS records for O(1) lookups.
    const cloudSrsMap = new Map(cloudSrs.map((item) => [item.word_id, item]));

    // 2. Logika Merge: Ambil yang tertinggi/terbaik
    // Keep highest XP value.
    const mergedXP = Math.max(localData.xp || 0, cloudProfile?.xp || 0);
    // Keep highest streak value.
    const mergedStreak = Math.max(localData.streak || 0, cloudProfile?.streak || 0);
    
    // Gabungkan Inventaris (Streak Freeze)
    // Keep highest streak freeze count.
    const localFreeze = localData.inventory?.streakFreeze || 0;
    const cloudFreeze = cloudProfile?.inventory?.streakFreeze || 0;
    const mergedInventory = {
      ...localData.inventory,
      streakFreeze: Math.max(localFreeze, cloudFreeze)
    };

    // Gabungkan Pengaturan
    // Merge settings, local overrides cloud.
    const mergedSettings = {
      ...(cloudProfile?.settings || {}),
      ...(localData.settings || {})
    };

    // Gabungkan study_days (ambil nilai terbesar untuk setiap tanggal)
    // Merge study days, keep highest count per date.
    const mergedStudyDays = { ...(cloudProfile?.study_days || {}) };
    Object.entries(localData.studyDays || {}).forEach(([date, count]) => {
      mergedStudyDays[date] = Math.max(count as number, (mergedStudyDays[date] as number) || 0);
    });

    // Gunakan review count dan tanggal terbaru
    // Compare timestamps to determine newer review session.
    const isCloudNewer = cloudProfile?.last_study_date && localData.lastStudyDate 
      ? new Date(cloudProfile.last_study_date) > new Date(localData.lastStudyDate)
      : false;
    
    const finalReviewCount = isCloudNewer ? cloudProfile?.today_review_count : localData.todayReviewCount;
    const finalLastDate = isCloudNewer ? cloudProfile?.last_study_date : localData.lastStudyDate;

    // 3. Upsert Profile (XP, Level, dan Gamifikasi)
    // Save merged profile to database.
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
    // Resolve conflicts for each SRS item.
    const srsEntries = Object.entries(localData.srs).map(([wordId, localState]) => {
      const cloudState = cloudSrsMap.get(wordId);
      
      // Jika ada di cloud, bandingkan mana yang lebih baru
      // Cloud data newer. Use cloud state.
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
      // Local data newer. Use local state.
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
      // Bulk save SRS items.
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
 * Migrate legacy LocalStorage progress to Supabase.
 * Runs once after guest logs in.
 * 
 * @param userId Authenticated user ID.
 * @param supabase Supabase client instance.
 * @returns True if migration succeeds.
 */
export async function handleLegacyMigration(userId: string, supabase: SupabaseClient): Promise<boolean> {
  // Penjaga: localStorage hanya tersedia di sisi klien
  // Prevent execution during server-side rendering.
  if (typeof window === "undefined") return false;

  const STATS_STORAGE_KEY = "nihongo-progress";
  const gamificationData = localStorage.getItem(STATS_STORAGE_KEY);
  
  if (!gamificationData) return false;

  try {
    const parsedStats = JSON.parse(gamificationData);
    // Dynamically import stores to avoid circular dependencies or early initialization.
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

    // Override progress with legacy stats.
    currentProgress.streak = parsedStats.streak;
    currentProgress.todayReviewCount = parsedStats.todayReviewCount;
    currentProgress.lastStudyDate = parsedStats.lastStudyDate;
    
    const migratedStudyDays: Record<string, number> = {};
    if (parsedStats.studyDays) {
      // Convert legacy boolean flags to numeric counts.
      Object.entries(parsedStats.studyDays).forEach(([date, val]) => {
        migratedStudyDays[date] = typeof val === "boolean" ? (val ? 1 : 0) : (val as number);
      });
    }
    currentProgress.studyDays = migratedStudyDays;

    const syncSuccess = await syncLocalToCloud(userId, currentProgress, supabase);
    if (syncSuccess) {
      // Clean up local storage after successful sync.
      localStorage.removeItem(STATS_STORAGE_KEY);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Gagal melakukan migrasi data lokal:", e);
    return false;
  }
}