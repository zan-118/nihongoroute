/**
 * @file route.ts
 * @description API Route Handler untuk konversi teks Jepang menjadi furigana Hiragana menggunakan Kuroshiro.
 * Digunakan oleh komponen SmartJapanese untuk menghasilkan annotasi bacaan secara dinamis.
 */

// ======================
// IMPOR
// ======================
import { NextResponse } from "next/server";
import path from "path";
// @ts-ignore
import Kuroshiro from "kuroshiro";
// @ts-ignore
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

// ======================
// TIPE DATA
// ======================
/**
 * Kuroshiro instance interface.
 */
interface KuroshiroInstance {
  init(analyzer: unknown): Promise<void>;
  convert(text: string, options: { to: string; mode: string }): Promise<string>;
}

// Cache instance to prevent re-initialization.
let kuroshiro: KuroshiroInstance | null = null;
// Lock flag for initialization concurrency.
let isInitializing = false;

/**
 * Get or initialize Kuroshiro instance.
 * Handles concurrent calls during initialization.
 * @returns Promise resolving to KuroshiroInstance.
 */
async function getKuroshiro(): Promise<KuroshiroInstance> {
  if (kuroshiro) return kuroshiro;
  
  if (isInitializing) {
    if (process.env.NODE_ENV === 'development') console.log("Kuroshiro sedang diinisialisasi, menunggu...");
    // Wait if initialization in progress.
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return kuroshiro!;
  }

  isInitializing = true;
  if (process.env.NODE_ENV === 'development') console.log("Menginisialisasi Kuroshiro untuk pertama kalinya...");
  try {
    // Resolve ESM/CJS default export differences.
    const KConstructor = (Kuroshiro as { default?: new () => KuroshiroInstance }).default || (Kuroshiro as new () => KuroshiroInstance);
    // Resolve analyzer default export differences.
    const AConstructor = (KuromojiAnalyzer as { default?: unknown }).default || KuromojiAnalyzer;

    const instance = new KConstructor();
    if (process.env.NODE_ENV === 'development') console.log("Memuat Kuromoji Analyzer dengan jalur kamus (dict path) eksplisit...");
    // Set absolute path to kuromoji dictionary.
    const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
    
    await instance.init(new AConstructor({ dictPath }));
    kuroshiro = instance;
    if (process.env.NODE_ENV === 'development') console.log("Inisialisasi Kuroshiro Berhasil!");
    return kuroshiro;
  } catch (error) {
    console.error("Kesalahan Inisialisasi Kuroshiro:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

// Allowed origins for CORS.
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://nihongoroute.my.id",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

/**
 * Generate CORS headers based on request origin.
 * @param req - Incoming request object.
 * @returns Headers object.
 */
function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

/**
 * Handle CORS preflight requests.
 * @param req - Incoming request object.
 * @returns NextResponse with CORS headers.
 */
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

/**
 * Convert Japanese text to Hiragana/Furigana.
 * @param req - Incoming request object containing text and mode.
 * @returns NextResponse with converted text or error.
 */
export async function POST(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    const { text, mode = "normal" } = await req.json();

    // Return empty if no text provided.
    if (!text) {
      return NextResponse.json({ hiragana: "" }, { headers: corsHeaders });
    }

    const engine = await getKuroshiro();
    // Convert text using Kuroshiro engine.
    const result = await engine.convert(text, {
      to: "hiragana",
      mode: mode as "normal" | "furigana" | "okurigana" | "roma"
    });

    return NextResponse.json({ hiragana: result }, { headers: corsHeaders });
  } catch (error) {
    console.error("Kesalahan API Furigana:", error);
    return NextResponse.json(
      { error: "Gagal mengonversi teks ke Hiragana", details: error instanceof Error ? error.message : "Unknown error" },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}