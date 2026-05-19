import { NextResponse } from "next/server";
import path from "path";
// @ts-ignore
import Kuroshiro from "kuroshiro";
// @ts-ignore
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

/**
 * @file route.ts
 * @description API endpoint untuk mengonversi teks Jepang (Kanji) menjadi Hiragana menggunakan Kuroshiro.
 * Menggunakan singleton pattern untuk menghindari inisialisasi ulang kamus Kuromoji yang berat.
 */

let kuroshiro: any = null;
let isInitializing = false;

async function getKuroshiro() {
  if (kuroshiro) return kuroshiro;
  
  if (isInitializing) {
    console.log("Kuroshiro is already initializing, waiting...");
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return kuroshiro;
  }

  isInitializing = true;
  console.log("Initializing Kuroshiro for the first time...");
  try {
    // Handle potential CJS/ESM interop issues
    const KConstructor = (Kuroshiro as any).default || Kuroshiro;
    const AConstructor = (KuromojiAnalyzer as any).default || KuromojiAnalyzer;

    const instance = new KConstructor();
    console.log("Loading Kuromoji Analyzer with explicit dict path...");
    // Menunjuk langsung ke folder dict di node_modules/kuromoji
    const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
    
    await instance.init(new AConstructor({ dictPath }));
    kuroshiro = instance;
    console.log("Kuroshiro Initialization Successful!");
    return kuroshiro;
  } catch (error) {
    console.error("Kuroshiro Init Error:", error);
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
  } catch (error: any) {
    console.error("Furigana API Error:", error);
    return NextResponse.json(
      { error: "Gagal mengonversi teks ke Hiragana", details: error.message },
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
}
