import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const MAX_TEXT_LENGTH = 500;

const ALLOWED_VOICES = new Set([
  // Wanita
  "lara",
  "indah",
  "siti",
  "dewi",
  "hayashi",
  "sato",
  "ayu",
  "zundamon",
  
  // Pria
  "dito",
  "budi",
  "suzuki",
  "tanaka",
  "yamada",
  "kimura",
  "andi",
  "faisal",
  "takahashi",
  "kobayashi",
  "namonashi",
  "ritsu",
  "ooba",
]);

// Peta rate string ke nilai SSML yang dimengerti Edge TTS
const RATE_MAP: Record<string, string> = {
  slow:   "-20%",
  medium: "0%",
  fast:   "+20%",
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const text  = (searchParams.get("text") || "").trim();
  const voice = searchParams.get("voice") || "zundamon";
  const rate  = searchParams.get("rate")  || "medium";

  if (!text) {
    return new Response("Missing text parameter", { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return new Response("Text too long (max 500 chars)", { status: 400 });
  }
  if (!ALLOWED_VOICES.has(voice)) {
    return new Response("Invalid voice", { status: 400 });
  }

  // 1. Hitung hash MD5 unik untuk kombinasi text + voice + rate
  const hash = crypto
    .createHash("md5")
    .update(`${text}_${voice}_${rate}`)
    .digest("hex");

  const supabase = createAdminClient();

  try {
    // 2. Cek apakah metadata cache ada di Database
    const { data: cached } = await supabase
      .from("tts_cache")
      .select("audio_url")
      .eq("id", hash)
      .maybeSingle();

    if (cached?.audio_url) {
      // Coba download file audio dari Storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from("tts-cache")
        .download(`${hash}.mp3`);

      if (!downloadError && fileData) {
        const audioBuffer = await fileData.arrayBuffer();
        return new Response(new Uint8Array(audioBuffer), {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=604800, immutable",
          },
        });
      }
    }
  } catch (err) {
    console.error("[TTS API] Gagal membaca cache dari database/storage:", err);
  }

  // 3. Cache miss: Berikan respons 404 untuk memicu fallback Web Speech API di sisi klien
  return new Response("Audio not found in cache", { status: 404 });
}
