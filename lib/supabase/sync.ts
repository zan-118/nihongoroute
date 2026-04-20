import { createClient } from "./client";
import { UserProgress } from "@/context/UserProgressContext";

/**
 * Sinkronisasi data progres dari LocalStorage (guest) ke Supabase (cloud)
 * saat user berhasil login.
 * 
 * @param {string} userId - ID Supabase user yang sedang login.
 * @param {UserProgress} localData - Data dari localStorage.
 * @returns {Promise<boolean>} Status keberhasilan sinkronisasi.
 */
export async function syncLocalToCloud(userId: string, localData: UserProgress): Promise<boolean> {
  const supabase = createClient();
  
  try {
    // 1. Upsert Profile (XP dan Level)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        xp: localData.xp,
        level: localData.level,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    // 2. Format data SRS untuk Bulk Upsert
    const srsEntries = Object.entries(localData.srs).map(([wordId, state]) => ({
      user_id: userId,
      word_id: wordId,
      interval: state.interval,
      ease_factor: state.easeFactor,
      next_review: new Date(state.nextReview).toISOString(),
      // status bisa disesuaikan, kita set 'learning' sebagai default,
      // mungkin bisa ditingkatkan nanti berdasarkan interval
      status: state.interval > 21 ? 'graduated' : (state.interval > 1 ? 'reviewing' : 'learning'),
      updated_at: new Date().toISOString()
    }));

    if (srsEntries.length > 0) {
      // 3. Bulk Upsert ke user_srs
      // Catatan: Pastikan constraint user_id dan word_id sudah ada di database
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
