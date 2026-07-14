/**
 * @file listening.actions.ts
 * @description Server Actions untuk mengambil data materi menyimak (listening) dari Sanity CMS.
 * Menyediakan fungsi paginasi dengan filter level JLPT serta pengambilan satu tugas menyimak acak.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { sanityClient, sanityPublicFetchOptions } from "@/lib/sanity.client";
import { PaginatedListeningResponse, ListeningTaskItem, LibraryItem } from "@/types/library";
import { getSanityListeningBySlug } from "@/lib/queries";

// ======================
// TYPES
// ======================

/**
 * Raw listening material item structure returned from Sanity CMS.
 */
interface SanityListeningItem {
  _id: string;
  title: string;
  slug: string;
  jlpt_level: string;
  difficulty: string;
  audio_url: string;
  body?: unknown;
  _createdAt: string;
}

// ======================
// SERVER ACTIONS
// ======================

/**
 * Fetches paginated listening materials from Sanity CMS.
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

  try {
    // Build dynamic GROQ filter query
    let filter = `_type == "listeningMaterial"`;
    if (search) {
      filter += ` && (title match $search || body match $search || difficulty match $search)`;
    }
    if (level && level !== "all") {
      filter += ` && jlpt_level == $level`;
    }

    // Fetch paginated data and total count in a single query
    const query = `{
      "data": *[${filter}] | order(_createdAt desc) [$offset...$limit] {
        _id,
        title,
        "slug": slug.current,
        jlpt_level,
        difficulty,
        audio_url,
        body,
        _createdAt
      },
      "total": count(*[${filter}])
    }`;

    // Map query parameters
    const params: Record<string, string | number> = {
      offset,
      limit: offset + limit
    };

    if (search) {
      params.search = `${search}*`;
    }
    if (level && level !== "all") {
      params.level = level.toUpperCase();
    }

    const result = await sanityClient.fetch(query, params, sanityPublicFetchOptions);

    // Map Sanity fields to application-specific structure
    return {
      data: (result.data || []).map((l: SanityListeningItem) => ({
        ...l,
        id: l._id,
        audioUrl: l.audio_url,
        transcript: l.body ? JSON.stringify(l.body) : ''
      })),
      total: result.total || 0,
    };
  } catch (error) {
    console.error("Gagal mengambil data paginasi menyimak dari Sanity:", error);
    return { data: [], total: 0 };
  }
}

/**
 * Fetches a random listening task for a specific JLPT level.
 * Used primarily on the homepage.
 * 
 * @param level - Target JLPT level.
 * @returns A random listening task item or null if not found.
 */
export async function getRandomListeningTask(level: string = "N5"): Promise<ListeningTaskItem | null> {
  try {
    const query = `*[
      _type == "listeningMaterial" && jlpt_level == $level
    ] | order(_createdAt desc) [0...10] {
      _id, title, "slug": slug.current, audio_url, body
    }`;
    
    const data = await sanityClient.fetch(query, { level }, sanityPublicFetchOptions);

    if (!data || data.length === 0) return null;

    // Select random item from the fetched subset
    const randomItem = data[Math.floor(Math.random() * data.length)];
    return {
      id: randomItem._id,
      title: randomItem.title,
      slug: randomItem.slug,
      audioUrl: randomItem.audio_url,
      transcript: randomItem.body ? JSON.stringify(randomItem.body) : ''
    };
  } catch (error) {
    console.error("Gagal mengambil tugas menyimak acak dari Sanity:", error);
    return null;
  }
}

/**
 * Fetches detailed listening material by its slug.
 * Parses raw transcript text, timestamps, and quizzes.
 * 
 * @param slug - Unique identifier slug of the listening material.
 * @returns Detailed library item or null if not found.
 */
export async function getLibraryListeningDetail(slug: string): Promise<LibraryItem | null> {
  try {
    const data = (await getSanityListeningBySlug(slug)) as LibraryItem | null;
    if (!data) return null;

    // Map snake_case fields to camelCase
    data.audioUrl = data.audio_url;
    data.imageUrl = data.image_url;
    data.videoUrl = data.video_url;

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
    const rawQuizzes = data.quizzes || [];
    data.quiz = rawQuizzes.map((q, idx: number) => {
      const correctAns = q.correct_answer ?? q.correctAnswer ?? "";
      return {
        _id: q._key || q.id || `q-${idx}`,
        question: q.question || "",
        options: ((q.options || []) as unknown[]).map((opt) => {
          const optStr = typeof opt === "string" ? opt : String(opt || "");
          return {
            text: optStr,
            isCorrect: optStr === String(correctAns)
          };
        }),
        explanation: q.explanation || ""
      };
    });

    return data;
  } catch (error) {
    console.error("Gagal mengambil detail menyimak:", error);
    return null;
  }
}