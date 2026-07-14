import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== UTILITY FUNCTIONS ==========
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
  debug: (msg) => process.env.DEBUG ? console.log(`[DEBUG] ${msg}`) : null
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'AI_BASE_URL'
  ];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
  logger.info('✅ Environment validated');
}

// ========== AI CLIENT ==========
async function createAiClient() {
  loadEnvFile();
  validateEnvironment();
  
  const openAiBaseUrl = process.env.AI_BASE_URL || 'http://localhost:20128/v1';
  const openAiApiKey = process.env.AI_API_KEY;
  const modelName = process.env.AI_MODEL || "ag/gemini-3-flash";

  return {
    provider: '9router (Main LLM)',
    async generateText(prompt) {
      const response = await fetch(`${openAiBaseUrl}/chat/completions`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(openAiApiKey ? { Authorization: `Bearer ${openAiApiKey}` } : {})
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          stream: false,
        }),
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(`9router API error ${response.status}: ${txt}`);
      }
      const data = await response.json();
      return data.choices?.[0]?.message?.content ?? "";
    }
  };
}

// ========== VALIDATION ==========
function validateDialogueJson(data) {
  const required = ['summary', 'content', 'translation', 'romaji', 'quizzes', 'next_plot_summary'];
  for (const field of required) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (!Array.isArray(data.quizzes) || data.quizzes.length !== 10) {
    throw new Error('Must have exactly 10 quizzes');
  }
  if (data.callouts && !Array.isArray(data.callouts)) {
    throw new Error('callouts must be an array');
  }
  return true;
}

// ========== FALLBACK ==========
function createFallbackDialogue(chapter, targetLevel) {
  return {
    summary: `Belajar tentang ${chapter.chapter_title} dalam bahasa Jepang (Level ${targetLevel})`,
    content: "キャラクターA：こんにちは。\nキャラクターB：こんにちは。\nキャラクターA：お元気ですか。\nキャラクターB：はい、元気です。",
    translation: "Karakter A: Halo.\nKarakter B: Halo.\nKarakter A: Apa kabar?\nKarakter B: Baik, terima kasih.",
    romaji: "Kyarakutā A: Konnichiwa.\nKyarakutā B: Konnichiwa.\nKyarakutā A: O-genki desu ka.\nKyarakutā B: Hai, genki desu.",
    next_plot_summary: `Percakapan sederhana tentang ${chapter.chapter_title}`,
    callouts: [{
      type: "info",
      title: "Catatan Budaya: Sapaan di Jepang",
      content: "Di Jepang, salam 'Konnichiwa' digunakan pada siang hari, sedangkan 'Ohayou gozaimasu' untuk pagi dan 'Konbanwa' untuk malam."
    }],
    quizzes: Array(10).fill(null).map((_, i) => ({
      question: `Soal ${i+1}: Apa arti dari "こんにちは"?`,
      options: ["Selamat pagi", "Selamat siang", "Selamat malam", "Selamat tinggal"],
      correct_answer: "Selamat siang",
      explanation: "Konnichiwa berarti 'selamat siang' dalam bahasa Jepang."
    }))
  };
}

// ========== CACHE ==========
function getCachePath(targetLevel) {
  const cacheDir = path.join(process.cwd(), '.cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, `${targetLevel}_progress.json`);
}

function saveProgress(targetLevel, chapterNumber, lessonData) {
  const cachePath = getCachePath(targetLevel);
  const progress = {
    targetLevel,
    lastChapter: chapterNumber,
    timestamp: new Date().toISOString(),
    lessons: {}
  };
  
  if (fs.existsSync(cachePath)) {
    const existing = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    progress.lessons = existing.lessons || {};
  }
  
  progress.lessons[chapterNumber] = lessonData;
  fs.writeFileSync(cachePath, JSON.stringify(progress, null, 2));
}

function getProgress(targetLevel) {
  const cachePath = getCachePath(targetLevel);
  if (fs.existsSync(cachePath)) {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  }
  return null;
}

// ========== GENERATE DIALOGUE WITH RETRY ==========
async function generateDialogueWithRetry(
  chapterTitle, 
  grammars, 
  vocabs, 
  kanjis, 
  previousPlotSummary, 
  aiClient, 
  targetLevel, 
  canDoStatement, 
  nuanceDifferences,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Generating dialogue for "${chapterTitle}" (Attempt ${attempt}/${maxRetries})`);
      
      const result = await generateDialogue(
        chapterTitle, 
        grammars, 
        vocabs, 
        kanjis, 
        previousPlotSummary, 
        aiClient, 
        targetLevel, 
        canDoStatement, 
        nuanceDifferences
      );
      
      if (result && validateDialogueJson(result)) {
        logger.info(`✅ Successfully generated dialogue for "${chapterTitle}"`);
        return result;
      }
    } catch (e) {
      logger.error(`Attempt ${attempt} failed: ${e.message}`);
      if (attempt < maxRetries) {
        const waitTime = 2000 * attempt; // Exponential backoff
        logger.info(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
  }
  
  logger.error(`❌ All ${maxRetries} attempts failed for "${chapterTitle}". Using fallback.`);
  return null;
}

// ========== MAIN GENERATE FUNCTION ==========
async function generateDialogue(
  chapterTitle, 
  grammars, 
  vocabs, 
  kanjis, 
  previousPlotSummary, 
  aiClient, 
  targetLevel, 
  canDoStatement, 
  nuanceDifferences
) {
  const EXACT_CAST_ROLES = `TOKOH WANITA (10 karakter):
1. Indah: Guru Wanita. Tenang, dewasa, formal.
2. Lala: Siswi SMA. Ceria, ramah.
3. Siti: Teman Sekolah. Lembut, natural.
4. Dewi: Gadis Kecil. Manja, energetik.
5. Hayashi: Wanita Karir / Ibu. Bijaksana.
6. Sato: Resepsionis / Pegawai. Sopan, formal.
7. Ayu: Teman Wanita. Modern, santai.
8. Ritsu: Wanita Dewasa. Misterius, bernada khas.
9. Sakura: Remaja Gadis. Baik hati.
10. Ani: Remaja Gadis. Pemalu, santun.

TOKOH PRIA (10 karakter):
1. Budi: Guru Pria. Berwibawa.
2. Dito: Siswa SMA. Kalem, kasual.
3. Suzuki: Pegawai Stasiun / Kantor. Tegas, formal.
4. Tanaka: Ayah / Pria Dewasa. Tenang, berat.
5. Yamada: Kakek. Ramah, berat, serak.
6. Kimura: Pemuda Gaul. Santai, energetik.
7. Andi: Pemuda Keren. Suara khas, bernada dramatis & penuh semangat.
8. Faisal: Pria Dewasa Kalem. Tenang, bijaksana.
9. Takahashi: Pekerja Kantoran Muda. Sopan, ramah.
10. Kobayashi: Pria Dewasa. Suara serius, dalam, berwibawa.

MASKOT (1 karakter):
1. Zundamon: Maskot Cilik. Kekanak-kanakan, nada sangat tinggi. Sering mengakhiri kalimat dengan "noda" (のだ).`;

  const grammarStr = grammars.slice(0, 5).map(g => g.title).join(', ');
  const vocabStr = vocabs.slice(0, 10).map(v => v.word).join(', ');
  const kanjiStr = kanjis.slice(0, 5).map(k => k.character).join(', ');

  let quizLanguageInstruction = "";
  if (targetLevel === "N5" || targetLevel === "N4") {
    quizLanguageInstruction = "Variasikan bahasa: minimal 2-3 soal wajib menggunakan teks/pilihan dalam bahasa Jepang (Hiragana/Katakana/Kanji) agar menantang.";
  } else if (targetLevel === "N3") {
    quizLanguageInstruction = "Sebagian besar soal (minimal 7 soal) wajib murni menggunakan bahasa Jepang untuk pertanyaan dan pilihannya.";
  } else {
    quizLanguageInstruction = "Tingkat Mahir: SELURUH 10 soal (pertanyaan dan pilihan) WAJIB menggunakan bahasa Jepang (Kanji/Kana) 100%, tanpa bahasa Indonesia.";
  }

  const prompt = `Anda adalah penulis skenario pendidikan bahasa Jepang yang ketat pada silabus.
Bab saat ini: "${chapterTitle}" (Target: Pembelajar JLPT ${targetLevel}).
SILABUS / TARGET KEMAMPUAN BAB INI: "${canDoStatement}"

RINGKASAN PLOT BAB SEBELUMNYA:
${previousPlotSummary || "(Ini adalah Bab 1. Mulailah cerita dari awal kehidupan sehari-hari normal dari karakter-karakter di bawah ini.)"}

TUGAS: Buat dialog yang MURNI berfokus pada pencapaian silabus di atas. 
Pilih karakter yang relevan dari daftar di bawah. (JANGAN CIPTAKAN KARAKTER BARU, SEMUA PERAN SUDAH DITETAPKAN):
${EXACT_CAST_ROLES}

ATURAN DIALOG & PLOT:
1. Plot cerita WAJIB realistis, kehidupan sehari-hari biasa (sekolah, kantor, rumah). DILARANG KERAS menggunakan elemen fantasi, sci-fi, sihir, alien, atau hal aneh lainnya.
2. Dialog minimal 3 kali pertukaran (minimal 6 baris dialog bolak-balik), maksimal 20 baris.
3. Selipkan tata bahasa target: ${grammarStr} (JANGAN paksakan semua jika tidak natural)
4. Selipkan kosakata target: ${vocabStr} (minimal 5-7 kata)
5. Selipkan kanji target: ${kanjiStr} (minimal 2-3 karakter)
6. Buat 1 hingga 2 buah callout. Callout WAJIB berupa CATATAN BUDAYA (Cultural Notes), etika, atau perbedaan nuansa. JIKA ADA MATERI BERIKUT, WAJIB BAHAS INI: "${nuanceDifferences}". Jika materi tersebut kosong, buatlah catatan budaya/etika Jepang umum yang relevan dengan bab. DILARANG mengulang tata bahasa dasar.
7. Buat TEPAT 10 buah soal quiz pilihan ganda (pertanyaan menguji pemahaman dialog, tata bahasa, atau kosakata bab ini). ${quizLanguageInstruction}
8. PENTING: Pada bagian "content" (teks bahasa Jepang), nama karakter WAJIB ditulis dalam huruf Jepang (Katakana/Kanji), BUKAN Romaji.
9. PENTING: Variasikan tokoh yang terlibat dalam dialog secara bergantian di setiap bab dari daftar 21 karakter di atas. Hindari menggunakan tokoh yang sama secara terus-menerus.
10. PENTING: Tulis ringkasan singkat (1-2 kalimat) yang menarik tentang materi pelajaran bab ini untuk ditaruh di field "summary".

OUTPUT FORMAT HARUS JSON murni tanpa markdown, dengan format berikut:
{
  "summary": "Ringkasan materi pelajaran singkat dan menarik dalam 1-2 kalimat (Bahasa Indonesia).",
  "content": "ララ：こんにちは、先生。\\nインダ：ああ、ララさん。元気ですか。",
  "translation": "Lara: Halo, Sensei.\\nIndah: Ah, Lara. Apa kabar?",
  "romaji": "Lara: Konnichiwa, sensei.\\nIndah: Aa, Lara-san. Genki desu ka.",
  "next_plot_summary": "Ringkasan plot realistis bab ini maksimal 2 kalimat, untuk diteruskan ke bab berikutnya.",
  "callouts": [
    {
      "type": "info",
      "title": "Catatan Budaya: [Topik Singkat]",
      "content": "Penjelasan mendalam tentang budaya, etika, atau kebiasaan Jepang terkait."
    }
  ],
  "quizzes": [
    {
      "question": "Pertanyaan quiz",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "Jawaban yang benar",
      "explanation": "Penjelasan mengapa jawaban benar"
    }
  ]
}`;

  try {
    let text = await aiClient.generateText(prompt);
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (e) {
    logger.error(`Generate error: ${e.message}`);
    throw e;
  }
}

function getLowerLevel(level) {
  const levels = ["N5", "N4", "N3", "N2", "N1"];
  const idx = levels.indexOf(level);
  if (idx > 0) return levels[idx - 1];
  return null;
}

async function getPreviousPlotSummary(targetLevel, prevChapterNum, syllabus, aiClient) {
  const progress = getProgress(targetLevel);
  if (progress && progress.lessons && progress.lessons[prevChapterNum]) {
    const prevLesson = progress.lessons[prevChapterNum];
    if (prevLesson.generation_context && prevLesson.generation_context.next_plot_summary) {
      return prevLesson.generation_context.next_plot_summary;
    }
  }
  
  const outputDir = path.join(process.cwd(), 'src', 'data', 'lessons', targetLevel.toLowerCase());
  if (fs.existsSync(outputDir)) {
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith(".json") && f.includes(`-bab-${prevChapterNum}-`));
    if (files.length > 0) {
      const filePath = path.join(outputDir, files[0]);
      try {
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (fileData.generation_context && fileData.generation_context.next_plot_summary) {
          return fileData.generation_context.next_plot_summary;
        }
        
        const dialogueBlock = fileData.content_blocks?.find(b => b.type === 'dialogue');
        if (dialogueBlock && dialogueBlock.translation) {
          logger.info(`Generating missing next_plot_summary for chapter ${prevChapterNum} using AI...`);
          const prompt = `Berikut adalah percakapan bahasa Jepang dari pelajaran sebelumnya:
"${dialogueBlock.translation}"

Buatlah ringkasan plot dalam 1-2 kalimat (bahasa Indonesia) tentang apa yang terjadi dalam percakapan tersebut, yang berfokus pada perkembangan hubungan atau aktivitas karakter, untuk dilanjutkan ke pelajaran berikutnya.
Kembalikan respon dalam format JSON saja:
{"next_plot_summary": "Ringkasan plot di sini."}`;
          const resText = await aiClient.generateText(prompt);
          const parsed = JSON.parse(resText.trim().replace(/```json/gi, "").replace(/```/g, "").trim());
          return parsed.next_plot_summary || "";
        }
      } catch (err) {
        logger.error(`Gagal mendapatkan plot summary fallback dari file: ${err.message}`);
      }
    }
  }
  
  return "";
}

// ========== MAIN ==========
async function main() {
  const aiClient = await createAiClient();
  
  const args = process.argv.slice(2);
  const allAvailableLevels = ["N5", "N4", "N3", "N2", "N1"];
  let targetLevels = ["N5", "N4"];
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--level' && args[i+1]) {
      const selected = args[i+1].toUpperCase();
      const idx = allAvailableLevels.indexOf(selected);
      if (idx !== -1) {
        targetLevels = allAvailableLevels.slice(0, idx + 1);
      } else {
        targetLevels = [selected];
      }
    }
  }
  
  for (const targetLevel of targetLevels) {
    logger.info(`🚀 Starting pipeline for ${targetLevel}...`);
    
    // Check progress
    const progress = getProgress(targetLevel);
    let startChapter = 1;
    
    const syllabusPath = path.resolve(`C:\\Users\\fauza\\.gemini\\antigravity-ide\\brain\\ffd4af9b-7afe-4d00-b261-81df4b30c25b\\scratch\\curriculum_standardized_${targetLevel.toLowerCase()}.json`);
    if (!fs.existsSync(syllabusPath)) {
      logger.error(`Syllabus ${targetLevel} not found`);
      continue;
    }
    
    let syllabus = JSON.parse(fs.readFileSync(syllabusPath, "utf8"))[targetLevel];
    
    if (progress && progress.targetLevel === targetLevel) {
      startChapter = progress.lastChapter + 1;
      logger.info(`Resuming from chapter ${startChapter}`);
      syllabus = syllabus.filter(c => c.chapter_number >= startChapter);
    }
    
    if (syllabus.length === 0) {
      logger.info(`No chapters to process for ${targetLevel}`);
      continue;
    }
    
    const { data: allGrammar } = await supabase.from('grammar').select('id, title').eq('jlpt_level', targetLevel);
    const { data: allVocab } = await supabase.from('vocab').select('id, word').eq('jlpt_level', targetLevel);
    const { data: allKanji } = await supabase.from('kanji').select('id, character').eq('jlpt_level', targetLevel);
    
    logger.info(`Found ${allVocab?.length || 0} vocab, ${allKanji?.length || 0} kanji, ${allGrammar?.length || 0} grammar for ${targetLevel}`);

    let previousPlotSummary = "";
    if (startChapter > 1) {
      previousPlotSummary = await getPreviousPlotSummary(targetLevel, startChapter - 1, syllabus, aiClient);
      if (previousPlotSummary) {
        logger.info(`Loaded previous plot summary from chapter ${startChapter - 1}: "${previousPlotSummary}"`);
      }
    } else {
      const lowerLevel = getLowerLevel(targetLevel);
      if (lowerLevel) {
        const lowerProgress = getProgress(lowerLevel);
        const lastChapNum = lowerProgress ? lowerProgress.lastChapter : (lowerLevel === "N5" ? 27 : 36);
        previousPlotSummary = await getPreviousPlotSummary(lowerLevel, lastChapNum, syllabus, aiClient);
        if (previousPlotSummary) {
          logger.info(`Loaded transition plot summary from ${lowerLevel} Chapter ${lastChapNum}: "${previousPlotSummary}"`);
        }
      }
    }
    
    for (let i = 0; i < syllabus.length; i++) {
      const chapter = syllabus[i];
      logger.info(`\n📚 Processing Chapter ${chapter.chapter_number}: ${chapter.chapter_title}...`);
      
      const chapterGrammarIds = chapter.grammar_ids || chapter.grammars || [];
      const grammars = allGrammar ? allGrammar.filter(g => chapterGrammarIds.includes(g.id)) : [];
      
      const chunkVocab = (allVocab && chapter.vocab_ids) ? allVocab.filter(v => chapter.vocab_ids.includes(v.id)) : [];
      const chunkKanji = (allKanji && chapter.kanji_ids) ? allKanji.filter(k => chapter.kanji_ids.includes(k.id)) : [];
      
      logger.info(`  Grammar: ${grammars.length}, Vocab: ${chunkVocab.length}, Kanji: ${chunkKanji.length}`);
      
      const dialogueJson = await generateDialogueWithRetry(
        chapter.chapter_title, 
        grammars, 
        chunkVocab, 
        chunkKanji, 
        previousPlotSummary, 
        aiClient, 
        targetLevel,
        chapter.cefr_can_do_statement,
        chapter.nuance_differences || ""
      );
      
      if (!dialogueJson) {
        logger.warn(`⚠️ Using fallback for chapter ${chapter.chapter_number}`);
        const fallback = createFallbackDialogue(chapter, targetLevel);
        // Use fallback data
        const lessonData = buildLessonData(chapter, grammars, chunkVocab, chunkKanji, fallback, targetLevel);
        saveProgress(targetLevel, chapter.chapter_number, lessonData);
        previousPlotSummary = fallback.next_plot_summary;
        continue;
      }
      
      previousPlotSummary = dialogueJson.next_plot_summary;
      
      const contentBlocks = [];
      contentBlocks.push({
        id: `block-dialogue-${i}`,
        type: "dialogue",
        content: dialogueJson.content,
        translation: dialogueJson.translation,
        romaji: dialogueJson.romaji
      });
      
      if (dialogueJson.callouts) {
        dialogueJson.callouts.forEach((co, idx) => {
          contentBlocks.push({
            id: `block-callout-${i}-${idx}`,
            type: "callout",
            title: co.title,
            content: co.content,
            calloutType: co.type || "info"
          });
        });
      }
      
      const generatedQuizzes = (dialogueJson.quizzes || []).map((q, idx) => ({
        id: `quiz-${i}-${idx}`,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation
      }));
      
      logger.info(`✅ Success: ${dialogueJson.callouts?.length || 0} callouts, ${generatedQuizzes.length} quizzes`);
      
      const lessonData = buildLessonData(chapter, grammars, chunkVocab, chunkKanji, dialogueJson, targetLevel);
      
      // Save to file
      const outputDir = path.join(process.cwd(), 'src', 'data', 'lessons', targetLevel.toLowerCase());
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const slug = `${targetLevel.toLowerCase()}-bab-${chapter.chapter_number}-${chapter.chapter_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
      const outputPath = path.join(outputDir, `lesson_draft_${slug}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(lessonData, null, 2));
      
      // Save progress
      saveProgress(targetLevel, chapter.chapter_number, lessonData);
      
      logger.info(`💾 Saved to: ${outputPath}`);
      
      // Delay antar chapter
      await delay(2000);
    }
    
    logger.info(`✅ Completed ${targetLevel} pipeline!`);
  }
}

function buildLessonData(chapter, grammars, vocab, kanji, dialogueJson, targetLevel) {
  return {
    title: `Bab ${chapter.chapter_number}: ${chapter.chapter_title}`,
    slug: `${targetLevel.toLowerCase()}-bab-${chapter.chapter_number}-${chapter.chapter_title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    jlpt_level: targetLevel,
    category_id: targetLevel,
    order_number: chapter.chapter_number,
    summary: dialogueJson.summary || chapter.cefr_can_do_statement,
    grammar_list: grammars.map(g => g.id),
    vocab_list: chapter.vocab_ids || [],
    kanji_list: chapter.kanji_ids || [],
    quizzes: (dialogueJson.quizzes || []).map((q, idx) => ({
      id: `quiz-${chapter.chapter_number}-${idx}`,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation
    })),
    content_blocks: buildContentBlocks(chapter, dialogueJson),
    seo: { 
      title: `Belajar ${targetLevel}: ${chapter.chapter_title}`, 
      description: chapter.cefr_can_do_statement 
    },
    generation_context: {
      can_do: chapter.cefr_can_do_statement,
      generated_at: new Date().toISOString(),
      next_plot_summary: dialogueJson.next_plot_summary || ""
    }
  };
}

function buildContentBlocks(chapter, dialogueJson) {
  const blocks = [];
  blocks.push({
    id: `block-dialogue-${chapter.chapter_number}`,
    type: "dialogue",
    content: dialogueJson.content,
    translation: dialogueJson.translation,
    romaji: dialogueJson.romaji
  });
  
  if (dialogueJson.callouts) {
    dialogueJson.callouts.forEach((co, idx) => {
      blocks.push({
        id: `block-callout-${chapter.chapter_number}-${idx}`,
        type: "callout",
        title: co.title,
        content: co.content,
        calloutType: co.type || "info"
      });
    });
  }
  
  return blocks;
}

// ========== INIT ==========
loadEnvFile();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

main().catch(e => {
  logger.error(`Fatal error: ${e.message}`);
  console.error(e);
  process.exit(1);
});