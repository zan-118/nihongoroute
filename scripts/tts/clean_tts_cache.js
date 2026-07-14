#!/usr/bin/env node

/**
 * @file clean_tts_cache.js
 * @description Script utilitas produksi (CommonJS) untuk membersihkan entri yatim (orphaned) pada tabel tts_cache.
 * 
 * Penggunaan:
 *   node scripts/tts/clean_tts_cache.js --execute
 */

const fs = require("node:fs");
const path = require("node:path");
const process = require("node:process");
const { createClient } = require("@supabase/supabase-js");
const { createClient: createSanityClient } = require("@sanity/client");

// ==========================================
// VOICE RESOLUTION UTILITIES (Mirrors src/lib/tts.ts)
// ==========================================
const FEMALE_KEYWORDS = [
  "女", "母", "姉", "妹", "奥", "彼女", "娘", "ちゃん", "chan",
  "先生",
  "ゆき", "はな", "さき", "あおい", "みく", "ゆみ", "けいこ", "みさ",
  "Yuki", "Hana", "Saki", "Aoi", "Miku", "Yumi", "Keiko", "Misa",
];
const MALE_KEYWORDS = [
  "男", "父", "兄", "弟", "夫", "彼", "くん", "君", "kun",
  "たろう", "けんじ", "ひろし", "けん", "しんじ", "だいち", "ケン",
  "Taro", "Kenji", "Hiroshi", "Ken", "Shinji", "Daichi",
];

const femaleVoices = ["zundamon", "lara", "indah", "siti", "dewi", "hayashi", "sato", "ayu", "ritsu"];
const maleVoices = ["namonashi", "dito", "budi", "suzuki", "tanaka", "yamada", "kimura", "andi", "faisal", "takahashi", "kobayashi", "ooba"];
const allVoices = [...femaleVoices, ...maleVoices];

const SPEAKER_MAP = {
  "indah": "indah", "インダ": "indah", "インダハ": "indah",
  "lara": "lara", "ララ": "lara",
  "siti": "siti", "シティ": "siti",
  "dewi": "dewi", "デウィ": "dewi",
  "hayashi": "hayashi", "林": "hayashi", "はやし": "hayashi",
  "sato": "sato", "佐藤": "sato", "さとう": "sato",
  "ayu": "ayu", "アユ": "ayu",
  "zundamon": "zundamon", "ずんだもん": "zundamon", "ズンダモン": "zundamon",
  "ritsu": "ritsu", "リツ": "ritsu", "りつ": "ritsu",
  "budi": "budi", "ブディ": "budi",
  "dito": "dito", "ディト": "dito",
  "suzuki": "suzuki", "鈴木": "suzuki", "すずき": "suzuki",
  "tanaka": "tanaka", "田中": "tanaka", "たなか": "tanaka",
  "yamada": "yamada", "山田": "yamada", "やまだ": "yamada",
  "kimura": "kimura", "木村": "kimura", "きむら": "kimura",
  "andi": "andi", "アンディ": "andi",
  "faisal": "faisal", "ファイサル": "faisal",
  "takahashi": "takahashi", "高橋": "takahashi", "たかはし": "takahashi",
  "kobayashi": "kobayashi", "小林": "kobayashi", "こばやし": "kobayashi",
  "namonashi": "namonashi", "名無し": "namonashi",
  "ooba": "ooba", "大庭": "ooba", "おおば": "ooba"
};

function detectVoice(speaker, fallbackIndex = 0) {
  if (!speaker || speaker === "???" || speaker.trim() === "") {
    return allVoices[fallbackIndex % allVoices.length];
  }
  const cleanSpeaker = speaker.replace(/[- ]?(さん|くん|ちゃん|様|君|sama|san|kun|chan)$/i, "").trim().toLowerCase();
  if (SPEAKER_MAP[cleanSpeaker]) {
    return SPEAKER_MAP[cleanSpeaker];
  }
  if (allVoices.includes(cleanSpeaker)) {
    return cleanSpeaker;
  }
  const speakerLowerOriginal = speaker.toLowerCase().trim();
  let preDetectedGender = null;
  if (speakerLowerOriginal.endsWith("ちゃん") || speakerLowerOriginal.endsWith("chan")) {
    preDetectedGender = "female";
  } else if (speakerLowerOriginal.endsWith("くん") || speakerLowerOriginal.endsWith("kun") || speakerLowerOriginal.endsWith("君")) {
    preDetectedGender = "male";
  }
  let hash = 0;
  for (let i = 0; i < cleanSpeaker.length; i++) {
    hash = cleanSpeaker.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  if (preDetectedGender === "female") {
    return femaleVoices[index % femaleVoices.length];
  }
  if (preDetectedGender === "male") {
    return maleVoices[index % maleVoices.length];
  }
  const EXACT_FEMALE = [
    "ayu", "siti", "dewi", "ani", "indah", "sakura", "lara", "sato", "hayashi",
    "アユ", "シティ", "デウィ", "ララ", "インダ", "さくら", "サクラ", "さとう", "はやし"
  ];
  const EXACT_MALE = [
    "budi", "faisal", "andi", "dito", "adit", "ken", "suzuki", "tanaka", "yamada", "kimura", "takahashi", "kobayashi",
    "ブディ", "ファイサル", "アンディ", "ディト", "アディット", "ケン", "すずき", "たなか", "やまだ", "きむら", "たかはし", "こばやし"
  ];
  if (EXACT_FEMALE.includes(cleanSpeaker)) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (EXACT_MALE.includes(cleanSpeaker)) {
    return maleVoices[index % maleVoices.length];
  }
  const isFemale = FEMALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  const isMale   = MALE_KEYWORDS.some(k => cleanSpeaker.includes(k));
  if (isFemale && !isMale) {
    return femaleVoices[index % femaleVoices.length];
  }
  if (isMale && !isFemale) {
    return maleVoices[index % maleVoices.length];
  }
  return allVoices[index % allVoices.length];
}

function getDeterministicVoiceForText(text) {
  const cleanText = text.trim();
  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) {
    hash = cleanText.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash);
  return allVoices[index % allVoices.length];
}

function printUsage() {
  console.log(
    [
      "=== NIHONGOROUTE TTS CACHE CLEANER ===",
      "Penggunaan:",
      "  node scripts/tts/clean_tts_cache.js [options]",
      "",
      "Opsi:",
      "  --execute      Jalankan penghapusan data secara riil (Default: Dry Run saja).",
      "  --help, -h     Tampilkan bantuan ini.",
    ].join("\n")
  );
}

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) return;

    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  });
}

async function cleanTtsCache() {
  loadEnvFile();

  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const dryRun = !args.includes("--execute");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ [Config] NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib ada di .env.local!");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const sanityClient = createSanityClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    useCdn: false,
    apiVersion: "2024-03-11",
  });

  console.log("🔌 [Supabase] Menghubungkan ke database...");
  if (dryRun) {
    console.log("ℹ️  [Mode] DRY RUN AKTIF (Tidak ada data yang akan dihapus dari database).");
  } else {
    console.log("⚠️  [Mode] EKSEKUSI RIIL AKTIF (Data yatim akan dihapus secara permanen!).");
  }

  try {
    const activeTextVoices = new Map();

    const addActive = (text, voice) => {
      if (!text) return;
      const clean = text.trim();
      if (!clean) return;
      if (!activeTextVoices.has(clean)) {
        activeTextVoices.set(clean, new Set());
      }
      activeTextVoices.get(clean).add(voice);
    };

    // 1. Tarik kosakata (vocab) dari database Supabase (Paginated)
    console.log("🔍 [Vocab] Menarik daftar kata aktif...");
    const vocabRows = [];
    let vocabHasMore = true;
    let vocabPage = 0;
    const vocabLimit = 1000;
    while (vocabHasMore) {
      const { data: rows, error: vocabErr } = await supabase
        .from("vocab")
        .select("word")
        .range(vocabPage * vocabLimit, (vocabPage + 1) * vocabLimit - 1);

      if (vocabErr) throw vocabErr;
      if (!rows || rows.length === 0) {
        vocabHasMore = false;
      } else {
        vocabRows.push(...rows);
        vocabPage += 1;
        if (rows.length < vocabLimit) {
          vocabHasMore = false;
        }
      }
    }
    vocabRows.forEach((r) => {
      if (r.word) addActive(r.word, "indah");
    });
    console.log(`   └─ Selesai. Total kata vocab unik: ${vocabRows.length}`);

    // Helper untuk memproses content_blocks (dialogue & grammar)
    const processContentBlocks = (blocks) => {
      if (!Array.isArray(blocks)) return;
      blocks.forEach((block) => {
        if (block.type === "dialogue" && block.content) {
          const lines = block.content.split("\n").filter(Boolean);
          lines.forEach((line, i) => {
            const parts = line.split(/[：:]/);
            const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
            const lineText = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
            const voice = detectVoice(rawSpeaker, i);
            addActive(lineText, voice);
          });
        } else if (block.type === "grammar") {
          if (block.examples && Array.isArray(block.examples)) {
            block.examples.forEach((ex) => {
              if (ex.jp) {
                const voice = getDeterministicVoiceForText(ex.jp);
                addActive(ex.jp, voice);
              }
            });
          }
        }
      });
    };

    // 2. Tarik pelajaran (lessons) dari database Supabase
    console.log("🔍 [Lessons - Supabase] Menarik data lessons...");
    const { data: supabaseLessons, error: lessonErr } = await supabase
      .from("lessons")
      .select("content_blocks");

    if (!lessonErr && supabaseLessons) {
      supabaseLessons.forEach((row) => processContentBlocks(row.content_blocks));
      console.log(`   └─ Selesai memproses ${supabaseLessons.length} lessons dari Supabase.`);
    }


    // 4. Tarik listeningMaterial dari Sanity CMS
    try {
      console.log("🔍 [Listening - Sanity] Menarik data listeningMaterial...");
      const listeningMaterials = await sanityClient.fetch(`*[_type == "listeningMaterial"] { body }`);
      if (Array.isArray(listeningMaterials)) {
        listeningMaterials.forEach((row) => {
          if (!row.body) return;
          const lines = row.body.split("\n").filter(Boolean);
          lines.forEach((line, i) => {
            const parts = line.split(/[：:]/);
            const rawSpeaker = parts.length > 1 ? parts[0].trim() : undefined;
            const lineText = parts.length > 1 ? parts.slice(1).join("：").trim() : line.trim();
            const voice = detectVoice(rawSpeaker, i);
            addActive(lineText, voice);
          });
        });
        console.log(`   └─ Selesai memproses ${listeningMaterials.length} materi listening.`);
      }
    } catch (err) {
      console.warn("⚠️  [Sanity] Gagal menarik data listening dari Sanity:", err.message);
    }

    // 5. Tarik data tts_cache dari Supabase (Paginated)
    console.log("🔍 [Cache] Menarik data dari tabel tts_cache...");
    const cacheRows = [];
    let cacheHasMore = true;
    let cachePage = 0;
    const cacheLimit = 1000;

    while (cacheHasMore) {
      const { data: rows, error: cacheErr } = await supabase
        .from("tts_cache")
        .select("id, text, voice")
        .range(cachePage * cacheLimit, (cachePage + 1) * cacheLimit - 1);

      if (cacheErr) throw cacheErr;

      if (!rows || rows.length === 0) {
        cacheHasMore = false;
      } else {
        cacheRows.push(...rows);
        cachePage += 1;
        if (rows.length < cacheLimit) {
          cacheHasMore = false;
        }
      }
    }
    console.log(`   └─ Ditemukan ${cacheRows.length} entri di tabel tts_cache.`);

    // 6. Identifikasi entri cache yatim
    const orphans = [];
    cacheRows.forEach((row) => {
      const text = row.text ? row.text.trim() : "";
      if (!text) {
        orphans.push(row);
        return;
      }

      const hasRef = activeTextVoices.has(text) && activeTextVoices.get(text).has(row.voice);
      if (!hasRef) {
        orphans.push(row);
      }
    });

    console.log(`\n🧹 [Analisis] Ditemukan ${orphans.length} entri yatim dari total ${cacheRows.length} entri.`);

    if (orphans.length === 0) {
      console.log("✅ [Selesai] Tidak ada cache yatim yang perlu dibersihkan.");
      process.exit(0);
    }

    if (dryRun) {
      console.log("\nDaftar 10 Entri Yatim Pertama (Dry Run):");
      console.log("=".repeat(80));
      orphans.slice(0, 10).forEach((item) => {
        console.log(`- ID: ${item.id} | Voice: ${item.voice.padEnd(10)} | Text: "${item.text}"`);
      });
      console.log("=".repeat(80));
      console.log(`\n💡 Jalankan dengan opsi '--execute' untuk menghapus ${orphans.length} entri ini secara riil.`);
    } else {
      console.log(`\n🗑️  Menghapus ${orphans.length} entri dari database...`);
      
      const batchSize = 100;
      let deletedCount = 0;

      for (let i = 0; i < orphans.length; i += batchSize) {
        const batchIds = orphans.slice(i, i + batchSize).map((o) => o.id);
        const { error: deleteErr } = await supabase
          .from("tts_cache")
          .delete()
          .in("id", batchIds);

        if (deleteErr) {
          console.error(`❌ Gagal menghapus batch ${Math.floor(i / batchSize) + 1}:`, deleteErr.message);
        } else {
          deletedCount += batchIds.length;
        }
      }

      console.log(`\n🎉 [Sukses] Berhasil menghapus ${deletedCount}/${orphans.length} entri cache yatim!`);
    }

  } catch (error) {
    console.error("❌ [Error] Terjadi kesalahan saat proses pembersihan:", error.message || error);
    process.exit(1);
  }
}

cleanTtsCache();
