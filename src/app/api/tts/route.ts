import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
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

async function generateTtsBuffer(tts: MsEdgeTTS, voice: string, ssmlRate: string, text: string): Promise<Buffer> {
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP">
    <voice name="${voice}">
      <prosody rate="${ssmlRate}">${text}</prosody>
    </voice>
  </speak>`;

  const { audioStream } = await tts.rawToStream(ssml);

  const chunks: Buffer[] = [];
  for await (const chunk of audioStream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

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

  const ssmlRate = RATE_MAP[rate] ?? "0%";

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

  // 3. Cache miss: generate baru via 2 suara Edge TTS yang gratis & berfungsi
  try {
    const tts = new MsEdgeTTS();
    // Petakan suara tokoh VOICEVOX asli ke suara Edge gratis yang didukung (Keita untuk pria, Nanami untuk wanita)
    const maleVoices = new Set([
      "dito", "budi", "suzuki", "tanaka", "yamada", "kimura", "andi", "faisal", "takahashi", "kobayashi", "namonashi", "ritsu", "ooba"
    ]);
    const edgeVoice = maleVoices.has(voice) ? "ja-JP-KeitaNeural" : "ja-JP-NanamiNeural";

    await tts.setMetadata(edgeVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    let audioBuffer: Buffer;
    try {
      audioBuffer = await generateTtsBuffer(tts, edgeVoice, ssmlRate, text);
    } catch (err) {
      console.error(`[TTS API] Gagal generate via Edge TTS dengan suara ${edgeVoice}:`, err);
      throw err;
    }

    // 4. Unggah hasil generate ke Supabase Storage (non-blocking agar client tidak menunggu)
    //    dan daftarkan metadata di DB cache
    (async () => {
      try {
        const { error: uploadError } = await supabase
          .storage
          .from("tts-cache")
          .upload(`${hash}.mp3`, audioBuffer, {
            contentType: "audio/mpeg",
            cacheControl: "604800",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase
          .storage
          .from("tts-cache")
          .getPublicUrl(`${hash}.mp3`);

        await supabase
          .from("tts_cache")
          .upsert({
            id: hash,
            text,
            voice,
            rate,
            audio_url: publicUrl,
          });
      } catch (uploadErr) {
        console.error("[TTS API] Gagal menyimpan cache baru ke Supabase:", uploadErr);
      }
    })();

    return new Response(new Uint8Array(audioBuffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch (err) {
    console.error("[TTS API] Gagal generate audio:", err);
    return new Response("TTS generation failed", { status: 500 });
  }
}
