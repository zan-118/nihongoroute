import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import path from "path";
// @ts-ignore
import Kuroshiro from "kuroshiro";
// @ts-ignore
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3333",
  "https://www.nihongoroute.my.id",
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin");
  let allowOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".sanity.studio")) {
      allowOrigin = origin;
    }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

let kuroshiro: any = null;
let isInitializing = false;

async function getKuroshiro() {
  if (kuroshiro) return kuroshiro;
  
  if (isInitializing) {
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return kuroshiro;
  }

  isInitializing = true;
  try {
    const KConstructor = (Kuroshiro as any).default || Kuroshiro;
    const AConstructor = (KuromojiAnalyzer as any).default || KuromojiAnalyzer;

    const instance = new KConstructor();
    const dictPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
    
    await instance.init(new AConstructor({ dictPath }));
    kuroshiro = instance;
    return kuroshiro;
  } catch (error) {
    console.error("Kuroshiro Init Error:", error);
    throw error;
  } finally {
    isInitializing = false;
  }
}

async function performDatabaseScan(text: string) {
  const supabase = createAdminClient();

  // 1. Scan Kanji (CJK Unified Ideographs range)
  const kanjiChars = Array.from(new Set(text.match(/[\u4e00-\u9faf]/g) || []));
  let matchedKanjis: string[] = [];
  if (kanjiChars.length > 0) {
    const { data: kanjiData } = await supabase
      .from("kanji")
      .select("character")
      .in("character", kanjiChars);
    if (kanjiData) {
      matchedKanjis = kanjiData.map((k: any) => k.character);
    }
  }

  // 2. Scan Grammar (288 rows - match substrings)
  const { data: grammarData } = await supabase
    .from("grammar")
    .select("slug, title");
  let matchedGrammars: string[] = [];
  if (grammarData) {
    for (const g of grammarData) {
      const cleanTitle = g.title.replace(/[〜~（）()()]/g, "").trim();
      if (
        text.includes(g.slug) ||
        text.includes(g.title) ||
        (cleanTitle.length > 1 && text.includes(cleanTitle))
      ) {
        matchedGrammars.push(g.slug || g.title);
      }
    }
  }

  // 3. Scan Vocab (extract Japanese words & filter out short single kana)
  const jWords = Array.from(
    new Set(text.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]+/g) || [])
  ).filter((w) => w.length > 1 || /[\u4e00-\u9faf]/.test(w));
  
  let matchedVocabs: string[] = [];
  if (jWords.length > 0) {
    const chunkSize = 100;
    const vocabSlugsSet = new Set<string>();
    
    for (let i = 0; i < jWords.length; i += chunkSize) {
      const chunk = jWords.slice(i, i + chunkSize);
      
      const [wordRes, furiganaRes] = await Promise.all([
        supabase.from("vocab").select("slug").in("word", chunk),
        supabase.from("vocab").select("slug").in("furigana", chunk),
      ]);
      
      if (wordRes.data) {
        wordRes.data.forEach((v: any) => v.slug && vocabSlugsSet.add(v.slug));
      }
      if (furiganaRes.data) {
        furiganaRes.data.forEach((v: any) => v.slug && vocabSlugsSet.add(v.slug));
      }
    }
    matchedVocabs = Array.from(vocabSlugsSet);
  }

  return {
    kanji: matchedKanjis,
    grammar: matchedGrammars,
    vocab: matchedVocabs,
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
    const { action, text, topic, level } = await req.json();

    if (action === "scan-supabase") {
      if (!text) {
        return NextResponse.json({ data: { vocab: [], kanji: [], grammar: [] } }, { headers: corsHeaders });
      }
      const scanned = await performDatabaseScan(text);
      return NextResponse.json({ data: scanned }, { headers: corsHeaders });
    }

    if (action === "generate-furigana") {
      if (!text) {
        return NextResponse.json({ data: "" }, { headers: corsHeaders });
      }
      const engine = await getKuroshiro();
      const lines = text.split("\n");
      const convertedLines = [];
      
      for (const line of lines) {
        if (!line.trim()) {
          convertedLines.push("");
          continue;
        }
        const result = await engine.convert(line, {
          to: "hiragana",
          mode: "normal",
        });
        convertedLines.push(result);
      }
      
      return NextResponse.json({ data: convertedLines.join("\n") }, { headers: corsHeaders });
    }

    if (action === "generate-lesson") {
      if (!topic || !level) {
        return NextResponse.json({ error: "Topik dan level wajib disertakan" }, { status: 400, headers: corsHeaders });
      }

      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: "GEMINI_API_KEY tidak dikonfigurasi di server" }, { status: 500, headers: corsHeaders });
      }

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Buatlah modul pelajaran Bahasa Jepang terstruktur lengkap untuk tingkat JLPT ${level} dengan topik "${topic}".
Respon Anda harus berupa format JSON murni tanpa markdown, tanpa penjelasan di luar JSON. Format JSON harus memiliki struktur persis seperti ini:
{
  "title": "Judul Pelajaran Menarik",
  "summary": "Ringkasan singkat pelajaran (1-2 kalimat)",
  "estimated_minutes": 15,
  "content_blocks": [
    {
      "_type": "contentBlock",
      "title": "Sub-topik / Penjelasan Tata Bahasa",
      "content": "Isi teks penjelasan materi menggunakan Bahasa Indonesia. Tuliskan contoh kalimat Jepang di sini jika ada.",
      "furigana": "Teks furigana untuk seluruh bagian content jika content berisi aksara Kanji (gunakan format Hiragana saja). Kosongkan jika tidak ada kanji.",
      "examples": [
        {
          "jp": "Contoh kalimat Bahasa Jepang (Kanji/Kana)",
          "furigana": "Hiragana pelafalan lengkap kalimat jp di atas",
          "en": "Arti kalimat jp dalam Bahasa Indonesia"
        }
      ]
    }
  ],
  "quizzes": [
    {
      "_type": "quizItem",
      "question": "Pertanyaan kuis pilihan ganda terkait materi ini",
      "options": ["Pilihan A (Bahasa Jepang)", "Pilihan B (Bahasa Jepang)", "Pilihan C (Bahasa Jepang)", "Pilihan D (Bahasa Jepang)"],
      "correct_answer": 0,
      "explanation": "Penjelasan mengapa Pilihan A benar dalam Bahasa Indonesia"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean potential JSON markdown wrapper
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const lessonData = JSON.parse(cleanedText);

      // Perform dynamic Supabase database matching on the generated lesson contents
      const textToScan = JSON.stringify(lessonData);
      const scanned = await performDatabaseScan(textToScan);

      lessonData.vocab_list = scanned.vocab;
      lessonData.kanji_list = scanned.kanji;
      lessonData.grammar_list = scanned.grammar;

      return NextResponse.json({ data: lessonData }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400, headers: corsHeaders });
  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses permintaan asisten AI", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
