import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
// @ts-ignore
import { MsEdgeTTS } from "msedge-tts";
import { TTS_VOICES, SPEAKER_MAP, type TtsVoice } from "@/lib/constants/tts";
import { MALE_VOICES } from "@/lib/audio/tts";

/** Force dynamic rendering & Node.js runtime for API route. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Maximum allowed text length for synthesis. */
const MAX_TEXT_LENGTH = 500;

/** Check if environment is development. */
const isDevelopment = process.env.NODE_ENV === "development";

function debugLog(...args: unknown[]) {
  if (isDevelopment) {
    console.log(...args);
  }
}

/** Set of all recognized voice identifiers. */
const ALLOWED_VOICES = new Set(Object.values(TTS_VOICES));

/**
 * Synthesizes speech dynamically via Edge TTS without saving to DB.
 */
async function synthesizeEdgeTTS(text: string, edgeVoice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(edgeVoice, "audio-24khz-96kbitrate-mono-mp3" as unknown as Parameters<typeof tts.setMetadata>[1]);

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const timer = setTimeout(() => {
      reject(new Error("Timeout koneksi Edge TTS (10 detik)."));
    }, 10000);

    const { audioStream } = tts.toStream(text);

    audioStream.on("data", (data: Buffer) => chunks.push(data));
    audioStream.on("end", () => {
      clearTimeout(timer);
      resolve(Buffer.concat(chunks));
    });
    audioStream.on("error", (err: Error) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * GET handler for TTS audio retrieval.
 * Checks Supabase cache first. If cache miss, serves dynamic Edge TTS stream
 * without saving to database or storage bucket.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawText  = (searchParams.get("text") || "").trim();
  const rawVoice = (searchParams.get("voice") || "zundamon").trim().toLowerCase();
  const rate     = searchParams.get("rate") || "medium";

  // Resolve voice using canonical speaker map
  const resolvedVoice: TtsVoice = SPEAKER_MAP[rawVoice] || (ALLOWED_VOICES.has(rawVoice as TtsVoice) ? (rawVoice as TtsVoice) : TTS_VOICES.ZUNDAMON);

  debugLog(`\n--- [TTS API REQUEST] ---`);
  debugLog(`Text: "${rawText}" | Raw Voice: "${rawVoice}" | Resolved: "${resolvedVoice}" | Rate: "${rate}"`);

  // Validate input parameters
  if (!rawText) {
    debugLog(`[TTS API] Gagal: parameter teks kosong.`);
    return new Response("Missing text parameter", { status: 400 });
  }
  if (rawText.length > MAX_TEXT_LENGTH) {
    debugLog(`[TTS API] Gagal: teks terlalu panjang (${rawText.length} chars).`);
    return new Response("Text too long (max 500 chars)", { status: 400 });
  }

  // 1. Hitung hash MD5 unik untuk kombinasi text + voice + rate
  const hash = crypto
    .createHash("md5")
    .update(`${rawText}_${resolvedVoice}_${rate}`)
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
      debugLog(`CACHE HIT di Database! Audio URL: ${cached.audio_url}`);
      let storagePath = `${hash}.mp3`;
      const match = cached.audio_url.match(/\/public\/tts-cache\/(.+)$/);
      if (match) {
        storagePath = decodeURIComponent(match[1]);
      }

      // Coba download file audio dari Storage
      const { data: fileData, error: downloadError } = await supabase
        .storage
        .from("tts-cache")
        .download(storagePath);

      let audioBuffer: ArrayBuffer | null = null;
      if (!downloadError && fileData) {
        audioBuffer = await fileData.arrayBuffer();
      }

      if (audioBuffer && audioBuffer.byteLength > 0) {
        debugLog(`SUKSES download file dari Storage! Ukuran: ${audioBuffer.byteLength} bytes.`);
        return new Response(new Uint8Array(audioBuffer), {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.byteLength.toString(),
            "Cache-Control": "public, max-age=604800, immutable",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[TTS API] Gagal membaca cache Supabase:", err);
  }

  // 3. Cache Miss — Langsung sintesis secara dinamis via Edge TTS (tanpa simpan ke DB)
  debugLog(`Cache miss untuk hash "${hash}". Melakukan live synthesis Edge TTS...`);
  try {
    const isMale = MALE_VOICES.includes(resolvedVoice);
    const edgeVoice = isMale ? "ja-JP-KeitaNeural" : "ja-JP-NanamiNeural";

    const dynamicBuffer = await synthesizeEdgeTTS(rawText, edgeVoice);
    debugLog(`Live Edge TTS sukses! Ukuran: ${dynamicBuffer.length} bytes.`);

    return new Response(new Uint8Array(dynamicBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": dynamicBuffer.length.toString(),
        "Cache-Control": "no-store", // Ephemeral, tidak disimpan di client cache tetap
      },
    });
  } catch (synthErr) {
    console.error("[TTS API] Gagal sintesis dinamis Edge TTS:", synthErr);
    return new Response("Audio synthesis failed", { status: 500 });
  }
}