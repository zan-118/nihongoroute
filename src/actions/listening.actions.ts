/**
 * @file listening.actions.ts
 * @description Server Actions untuk mengambil data materi menyimak (listening) dari Supabase.
 * Menyediakan fungsi paginasi dengan filter level JLPT serta pengambilan satu tugas menyimak acak.
 */

"use server";

// ======================
// IMPORTS
// ======================
import { PaginatedListeningResponse, ListeningTaskItem, LibraryItem } from "@/types/library";
import { ListeningMaterialTable } from "@/types/database";
import {
 getPaginatedContent,
 getContentBySlugOrId,
 getStaticSlugs,
 getRandomListeningPool
} from "@/lib/services/content-repository";

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
 try {
 const response = await getPaginatedContent<ListeningMaterialTable>("listening", {
 page,
 limit,
 search,
 searchColumns: ["title", "body", "difficulty"],
 orderBy: [{ column: "created_at", ascending: false }],
 filters: (query) => {
 if (level && level !== "all") {
 query = query.eq("jlpt_level", level.toUpperCase());
 }
 return query;
 }
 });

 // Map Supabase fields to application-specific structure
 return {
 data: response.data.map((l) => ({
 ...l,
 id: l.id,
 audioUrl: l.audio_url,
 transcript: l.body ? String(l.body) : ''
 })) as PaginatedListeningResponse["data"],
 total: response.total,
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
 try {
 const data = await getRandomListeningPool(level, 10);
 if (!data || data.length === 0) return null;

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
 try {
 const dbData = await getContentBySlugOrId<ListeningMaterialTable>("listening", slug);

 if (!dbData) return null;

 const data = {
 ...dbData,
 id: dbData.id,
 difficulty: dbData.difficulty || dbData.jlpt_level,
 audioUrl: dbData.audio_url,
 imageUrl: dbData.image_url,
 videoUrl: dbData.video_url
 } as Record<string, unknown>;

 // Parser yang kuat untuk Teks Dialog Mentah (Transcript)
 let dialogue: import("@/features/library/listening/types").TranscriptLine[] = [];
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
 dialogue = data.body as import("@/features/library/listening/types").TranscriptLine[];
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
 try {
 const data = await getStaticSlugs("listening", { limit, select: "slug" });
 return data.map((item) => ({ slug: String(item.slug) })).filter((x) => x.slug);
 } catch (error) {
 console.error("Gagal mengambil static slugs listening:", error);
 return [];
 }
}