import { NextRequest } from "next/server";
import { rateLimit } from "@/lib/core/rate-limit";
import { securityLogger } from "@/lib/core/logger";
import {
  MAX_TTS_TEXT_LENGTH,
  processTtsPipeline,
} from "@/lib/audio/tts-pipeline";

/** Force dynamic rendering & Node.js runtime for API route. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET handler for TTS audio retrieval.
 * Delegates cache checking & dynamic Edge TTS synthesis to processTtsPipeline.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  // Batas 30 request per 10 detik per IP
  if (rateLimit(`tts_${ip}`, 30, 10000)) {
    securityLogger.warn({ event: "tts_rate_limit", source: "tts", metadata: { ip } });
    return new Response("Too Many Requests", { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const rawText = (searchParams.get("text") || "").trim();
  const rawVoice = searchParams.get("voice") || undefined;
  const rate = searchParams.get("rate") || undefined;

  // Validate input parameters
  if (!rawText) {
    return new Response("Missing text parameter", { status: 400 });
  }
  if (rawText.length > MAX_TTS_TEXT_LENGTH) {
    return new Response("Text too long (max 500 chars)", { status: 400 });
  }

  try {
    const result = await processTtsPipeline({ text: rawText, voice: rawVoice, rate });

    return new Response(Buffer.from(result.audioBuffer), {
      headers: {
        "Content-Type": result.contentType,
        "Content-Length": result.audioBuffer.byteLength.toString(),
        "Cache-Control": result.cacheControl,
      },
    });
  } catch (synthErr) {
    console.error("[TTS API] Gagal sintesis dinamis Edge TTS:", synthErr);
    return new Response("Audio synthesis failed", { status: 500 });
  }
}