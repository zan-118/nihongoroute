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
interface KuroshiroInstance {
  init(analyzer: unknown): Promise<void>;
  convert(text: string, options: { to: string; mode: string }): Promise<string>;
}

let kuroshiro: KuroshiroInstance | null = null;
let isInitializing = false;

async function getKuroshiro(): Promise<KuroshiroInstance> {
  if (kuroshiro) return kuroshiro;
  
  if (isInitializing) {
    if (process.env.NODE_ENV === 'development') console.log("Kuroshiro sedang diinisialisasi, menunggu...");
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return kuroshiro!;
  }

  isInitializing = true;
  if (process.env.NODE_ENV === 'development') console.log("Menginisialisasi Kuroshiro untuk pertama kalinya...");
  try {
    // Tangani kemungkinan masalah interop CJS/ESM
    const KConstructor = (Kuroshiro as { default?: new () => KuroshiroInstance }).default || (Kuroshiro as new () => KuroshiroInstance);
    const AConstructor = (KuromojiAnalyzer as { default?: unknown }).default || KuromojiAnalyzer;

    const instance = new KConstructor();
    if (process.env.NODE_ENV === 'development') console.log("Memuat Kuromoji Analyzer dengan jalur kamus (dict path) eksplisit...");
    // Menunjuk langsung ke folder dict di node_modules/kuromoji
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

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://www.nihongoroute.my.id",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  const allowOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function POST(req: Request) {
  const corsHeaders = getCorsHeaders(req);
  
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ hiragana: "" }, { headers: corsHeaders });
    }

    const engine = await getKuroshiro();
    const result = await engine.convert(text, {
      to: "hiragana",
      mode: "normal"
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
