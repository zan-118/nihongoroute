import { processTtsPipeline, MAX_TTS_TEXT_LENGTH } from "@/lib/audio/tts-pipeline";
import { rateLimit } from "@/lib/core/rate-limit";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (rateLimit(`tts_${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawText = searchParams.get("text");
  const rawVoice = searchParams.get("voice") || "zundamon";
  const rate = searchParams.get("rate") || "medium";

  // Validate input parameters
  if (!rawText) {
    return new Response("Missing text parameter", { status: 400 });
  }
  if (rawText.length > MAX_TTS_TEXT_LENGTH) {
    return new Response("Text too long (max 500 chars)", { status: 400 });
  }

  try {
    const result = await processTtsPipeline({ text: rawText, voice: rawVoice, rate });

    if (result.redirectUrl) {
      return NextResponse.redirect(result.redirectUrl, 307);
    }

    if (!result.audioBuffer) {
      return new Response("Audio synthesis returned empty buffer", { status: 500 });
    }

    return new Response(Buffer.from(result.audioBuffer), {
      headers: {
        "Content-Type": result.contentType || "audio/mpeg",
        "Content-Length": result.audioBuffer.byteLength.toString(),
        "Cache-Control": result.cacheControl || "no-store",
      },
    });
  } catch (synthErr) {
    console.error("[TTS API] Gagal sintesis dinamis Edge TTS:", synthErr);
    return new Response("Audio synthesis failed", { status: 500 });
  }
}
