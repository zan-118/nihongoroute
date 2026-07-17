/**
 * @file listening.actions.ts
 * @description Server Actions untuk mengambil data materi menyimak (listening) dari Supabase.
 * Menyediakan fungsi paginasi dengan filter level JLPT serta pengambilan satu tugas menyimak acak.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { createStaticClient } from "@/lib/supabase/server";
import { PaginatedListeningResponse, ListeningTaskItem, LibraryItem } from "@/types/library";

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetches paginated listening materials from Supabase.
 * Supports search queries and JLPT level filtering.
 * 
 * @param page - Current page number (1-indexed).
 * @param limit - Number of items per page.
 * @param search - Search query string.
 * @param level - JLPT level filter (e.g., "N5", "N4").
 * @returns Paginated response containing items and total count.
 */
export async function getPaginatedListening(
  page: number,
  limit: number,
  search: string = "",
  level: string = ""
): Promise<PaginatedListeningResponse> {
  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  const supabase = createStaticClient();

  try {
    let query = supabase
      .from("listening")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%,difficulty.ilike.%${search}%`);
    }
    if (level && level !== "all") {
      query = query.eq("jlpt_level", level.toUpperCase());
    }

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Map Supabase fields to application-specific structure
    return {
      data: (data || []).map((l) => ({
        ...l,
        id: l.id,
        audioUrl: l.audio_url,
        transcript: l.body ? String(l.body) : ''
      })) as PaginatedListeningResponse["data"],
      total: count || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi menyimak dari Supabase:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Fetches a random listening task for a specific JLPT level from Supabase.
 * Used primarily on the homepage.
 * 
 * @param level - Target JLPT level.
 * @returns A random listening task item or null if not found.
 */
export async function getRandomListeningTask(level: string = "N5"): Promise<ListeningTaskItem | null> {
  const supabase = createStaticClient();
  try {
    const { data, error } = await supabase
      .from("listening")
      .select("id, title, slug, audio_url, body")
      .eq("jlpt_level", level.toUpperCase())
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data || data.length === 0) return null;

    // Select random item from the fetched subset
    const randomItem = data[Math.floor(Math.random() * data.length)];
    return {
      id: randomItem.id,
      title: randomItem.title,
      slug: randomItem.slug,
      audioUrl: randomItem.audio_url,
      transcript: randomItem.body ? String(randomItem.body) : ''
    };
  } catch (error) {
    console.error("Gagal mengambil tugas menyimak acak dari Supabase:", error);
    return null;
  }
}

/**
 * Fetches detailed listening material by its slug from Supabase.
 * Parses raw transcript text, timestamps, and quizzes.
 * 
 * @param slug - Unique identifier slug of the listening material.
 * @returns Detailed library item or null if not found.
 */
export async function getLibraryListeningDetail(slug: string): Promise<LibraryItem | null> {
  const supabase = createStaticClient();
  try {
    const { data: dbData, error } = await supabase
      .from("listening")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !dbData) return null;

    const data = {
      ...dbData,
      id: dbData.id,
      difficulty: dbData.difficulty || dbData.jlpt_level,
      audioUrl: dbData.audio_url,
      imageUrl: dbData.image_url,
      videoUrl: dbData.video_url
    } as Record<string, unknown>;

    // Parser yang kuat untuk Teks Dialog Mentah (Transcript)
    let dialogue: import("@/components/features/listening/types").TranscriptLine[] = [];
    if (typeof data.body === "string") {
      const lines = data.body.split("\n").filter((line: string) => line.trim());
      const translations = typeof data.translation === "string" ? data.translation.split("\n").filter((line: string) => line.trim()) : [];
      const readings = typeof data.hiragana === "string" ? data.hiragana.split("\n").filter((line: string) => line.trim()) : [];

      // Parse timestamps nyata dari field 'timestamps' (format: "startDetik,endDetik" per baris)
      // Fallback ke pembagian merata kalau tidak ada timestamp
      let parsedTimestamps: { start: number; end: number }[] = [];
      if (typeof data.timestamps === "string" && data.timestamps.trim()) {
        parsedTimestamps = data.timestamps
          .split("\n")
          .filter((t: string) => t.trim())
          .map((t: string) => {
            const [start, end] = t.trim().split(",").map(Number);
            return { start: isNaN(start) ? 0 : start, end: isNaN(end) ? 0 : end };
          });
      }

      // Map raw lines to structured transcript lines with speaker, text, furigana, and translation
      dialogue = lines.map((line: string, idx: number) => {
        const parts = line.split(/[：:]/);
        const speaker = parts.length > 1 ? parts[0].trim() : "???";
        const text = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
        
        // Coba temukan terjemahan yang cocok
        let translation = translations[idx] || "";
        if (translation.includes("：") || translation.includes(":")) {
           translation = translation.split(/[：:]/).slice(1).join("：").trim();
        }

        // Coba temukan bacaan (hiragana) yang cocok
        let furigana = "";
        if (readings[idx]) {
          const rLine = readings[idx];
          if (rLine.includes("：") || rLine.includes(":")) {
            furigana = rLine.split(/[：:]/).slice(1).join("：").trim();
          } else {
            furigana = rLine.trim();
          }
        }

        // Gunakan timestamp nyata bila tersedia, fallback ke 5 detik per baris
        const ts = parsedTimestamps[idx];
        const startTime = ts ? ts.start : idx * 5;
        const endTime = ts ? ts.end : (idx + 1) * 5;

        return {
          _key: `line-${idx}`,
          speaker,
          text,
          jp: text,
          furigana: furigana,
          translation: translation || text,
          startTime,
          endTime,
          id: idx
        };
      });
    } else if (Array.isArray(data.body)) {
      dialogue = data.body as import("@/components/features/listening/types").TranscriptLine[];
    }
    data.transcript = dialogue;

    // Map raw quizzes and normalize correct answer options
    const rawQuizzes = (data.quizzes || []) as Record<string, unknown>[];
    data.quiz = rawQuizzes.map((q, idx: number) => {
      const correctAns = (q.correct_answer ?? q.correctAnswer ?? "") as string;
      return {
        _id: (q._key || q.id || `q-${idx}`) as string,
        question: (q.question || "") as string,
        options: ((q.options || []) as unknown[]).map((opt) => {
          const optStr = typeof opt === "string" ? opt : String(opt || "");
          return {
            text: optStr,
            isCorrect: optStr === String(correctAns)
          };
        }),
        explanation: (q.explanation || "") as string
      };
    });

    return data as LibraryItem;
  } catch (error) {
    console.error("Gagal mengambil detail menyimak dari Supabase:", error);
    return null;
  }
}

/**
 * Fetch top Listening slugs for static build generation (ISR).
 * 
 * @param limit - Maximum number of slugs to pre-render.
 * @returns Array of object params with slug property.
 */
export async function getListeningStaticSlugs(limit: number = 50): Promise<{ slug: string }[]> {
  const supabase = createStaticClient();
  try {
    const { data, error } = await supabase
      .from("listening")
      .select("slug")
      .not("slug", "is", null)
      .limit(limit);

    if (error || !data) return [];
    return data.map((item) => ({ slug: String(item.slug) })).filter((x) => x.slug);
  } catch (error) {
    console.error("Gagal mengambil static slugs listening:", error);
    return [];
  }
}