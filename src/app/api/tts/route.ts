/**
 * @file route.ts
 * @description API Route untuk Text-to-Speech menggunakan Microsoft Edge TTS.
 * Menghasilkan audio MP3 berkualitas neural (natural, bukan robotic) dengan dukungan
 * berbagai suara Jepang pria/wanita. Gratis, tanpa API key.
 *
 * Query params:
 *   text  — teks Jepang yang akan diucapkan (maks 500 karakter)
 *   voice — nama suara Edge TTS (default: ja-JP-NanamiNeural)
 *   rate  — kecepatan: slow | medium | fast (default: medium)
 */

import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import { NextRequest } from "next/server";

const MAX_TEXT_LENGTH = 500;

const ALLOWED_VOICES = new Set([
  "ja-JP-NanamiNeural",
  "ja-JP-KeitaNeural",
  "ja-JP-MayuNeural",
  "ja-JP-DaichiNeural",
  "ja-JP-NaokiNeural",
  "ja-JP-ShioriNeural",
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
  const voice = searchParams.get("voice") || "ja-JP-NanamiNeural";
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

  const ssmlRate = RATE_MAP[rate] ?? "0%";

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Bungkus teks dengan SSML prosody agar kecepatan bisa dikontrol
    const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP">
      <voice name="${voice}">
        <prosody rate="${ssmlRate}">${text}</prosody>
      </voice>
    </speak>`;

    const { audioStream } = await tts.toStream(ssml);

    // Kumpulkan semua chunk stream ke buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        // Cache 7 hari di browser & CDN — konten audio statis
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (err) {
    console.error("[TTS API] Gagal generate audio:", err);
    return new Response("TTS generation failed", { status: 500 });
  }
}
