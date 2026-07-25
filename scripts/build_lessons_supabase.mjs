import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import process from 'process';

// ========== UTILITY FUNCTIONS ==========
const logger = {
  info: (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`),
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
          temperature: 0.3,
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

const EXACT_CAST_ROLES = `TOKOH WANITA:
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

TOKOH PRIA:
1. Budi: Guru Pria. Berwibawa.
2. Dito: Siswa SMA. Kalem, kasual.
3. Suzuki: Pegawai Stasiun / Kantor. Tegas, formal.
4. Tanaka: Ayah / Pria Dewasa. Tenang, berat.
5. Yamada: Kakek. Ramah, berat, serak.
6. Kimura: Pemuda Gaul. Santai, energetik.
7. Andi: Pemuda Keren. Suara khas, bernada dramatis & penuh semangat.
8. Faisal: Pria Dewasa Kalem. Tenang, bijaksana.
9. Takahashi: Pekerja Kantoran Muda. Sopan, ramah.
10. Kobayashi: Pria Dewasa. Suara serius, dalam, berwibawa.`;

const grammarTitleMapping = {
  // N5
  "[Kata Benda Orang] は [Kata Benda Identitas] です": "～は",
  "[Kata Benda Orang] は [Kata Benda Identitas] では ありません": "～れません",
  "[Kata Benda Orang] は [Kata Benda Identitas] では ありません": "～ではありません",
  "[Kalimat] か": "〜か",
  "[Kata Benda] も": "〜も",
  "[Kata Benda Pemilik] の [Kata Benda Milik]": "[Kata Benda Pemilik] の [Kata Benda Milik]",
  "～は (Penanda Topik)": "～は",
  "～desu (Penanda Kesopanan)": "～です",
  "～です (Penanda Kesopanan)": "～です",
  "～ではありません (Penanda Negatif)": "～ではありません",
  "～か (Penanda Kalimat Tanya)": "～か",
  "～も (Penanda Kesamaan)": "～も",
  "～の (Penanda Kepemilikan & Afiliasi)": "～の",
  
  // N4
  "[Bentuk Biasa] ん です": "～んです",
  "[Kata Kerja Bentuk ta] ら いい ですか": "～たらいいですか",
  "Kata kerja potensial bentuk perubahan katsuyou": "Potensial (Kanoukei)",
  "[Kata Benda] は 見えます / 聞こえます": "～は見えます/聞こえます",
  "[Kata Benda] は（対比）": "～は (対比)",
  "[Kata Kerja Transitif Bentuk te] あります": "～てあります",
  "[Kata Kerja Bentuk te] おきます": "～ておきます",
  "[Kata Kerja Bentuk te] います": "～ています",
  "[Kata Kerja Intransitif Bentuk te] います": "～ています",
  "Kata kerja bentuk volisional": "Maksud (Ikoukei)",
  "[Kata Kerja Bentuk Volisional] と 思っています": "～ようと思っています",
  "[Kata Benda] / [Kata Kerja Bentuk Kamus] 予定 です": "～予定です",
  "まだ [Kata Kerja Bentuk te] いません": "まだ～ていません",
  "[Kata Kerja Bentuk ta / nai] ほう が いい です": "～ほうがいい",
  "Kata kerja bentuk perintah tegas": "Perintah (Meireikei)",
  "Kata kerja bentuk larangan mutlak": "Larangan (Kinhikei)",
  "[Kalimat / Kata] と書いてあります": "～と書いてあります",
  "[Kalimat / Kata] という 意味 です": "～という意味です",
  "[Kata Kerja Bentuk Kamus / ta] とおり に, [Kalimat Utama]": "～とおりiに",
  "[Kata Kerja Bentuk ta / Kata Benda] あと で, [Kalimat Utama]": "～あとで",
  "[Kata Kerja Bentuk te / nai de] [Kata Kerja Utama]": "～て/～ないde",
  "[Kata Kerja Potensial Bentuk Kamus / nai] ように なります": "～ようになります",
  "[Subjek] は [Pelaku] に [Kata Kerja Pasif]": "Pasif (Ukemi)",
  "[Subjek] は [Pelaku] に [Milik] を [Kata Kerja Pasif]": "Pasif Milik",
  "[Kata Kerja Bentuk Kamus] の は [Kata Sifat] です": "～のは～です",
  "[Kata Kerja Bentuk Kamus] の を 知っていますか": "～のを知っていますか",
  "[Kata Kerja Bentuk Kamus] の は [Kata Benda] です": "～のは～です",
  "[Kata Kerja Bentuk te] きます": "～てきます",
  "[Kata Kerja / Sifat / Benda Bentuk Biasa] ので, [Kalimat Hasil]": "～ので",
  "[Kalimat Tanya] か, [Kalimat Utama]": "～か",
  "[Kalimat] か どうか, [Kalimat Utama]": "～かどうか",
  "[Kata Kerja Bentuk te] みます": "～てみます",
  "[Kata Kerja Bentuk te] いただきます": "～ていただきます",
  "[Kata Kerja Bentuk te] くださいます": "～てくださいます",
  "[Kata Kerja Bentuk Kamus / Kata Benda] の ため に, [Kalimat Utama]": "～のために"
};

function cleanGrammarString(str) {
  if (!str) return '';
  return str
    .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF/]/g, '')
    .trim();
}

const vocabNormalizations = {
  '〜niち': 'にち',
  'niち': 'にち',
  'ケータイ': 'けーtai',
  'mono': 'もの',
  'あのかた': 'あの方',
  'おいくつ': 'お幾つ',
  'ミルク': '牛乳',
  'かない': '家内',
  'おじいちゃん': 'お爺ちゃん',
  'おばあちゃん': 'お婆ちゃん',
  'うれます': '売れます'
};

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ========== MARKDOWN CURRICULUM PARSER ==========
function parseCurriculumMarkdown(filePath, levelOffset = 0) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Handle both CRLF and LF
  const normalizedContent = content.replace(/\r\n/g, '\n');
  const sections = normalizedContent.split('\n## Pelajaran ');
  const lessons = [];

  for (let i = 1; i < sections.length; i++) {
    const lines = sections[i].split('\n');
    const chapterName = lines[0].trim();
    
    let currentSection = null;
    const vocabList = [];
    const kanjiList = [];
    const grammarList = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.includes('**Target Tata Bahasa**')) {
        currentSection = 'grammar';
        continue;
      } else if (trimmed.includes('**Target Kosakata Lengkap**')) {
        currentSection = 'vocab';
        continue;
      } else if (trimmed.includes('**Target Kanji Lengkap**') || trimmed.includes('**Target Kanji**')) {
        currentSection = 'kanji';
        const cleanLine = trimmed.replace(/^-\s*\*\*Target Kanji[^*]*\*\*:\s*/i, '');
        const parts = cleanLine.split(/[,，]/);
        for (const part of parts) {
          const parenIndex = part.indexOf('(');
          if (parenIndex !== -1) {
            const char = part.substring(0, parenIndex).trim();
            if (char) kanjiList.push(char);
          } else {
            const char = part.trim();
            if (char && char.length === 1) kanjiList.push(char);
          }
        }
        continue;
      } else if (trimmed.startsWith('---') || trimmed.startsWith('- **Latihan')) {
        currentSection = null;
        continue;
      }

      if (currentSection === 'vocab') {
        const match = trimmed.match(/^-\s*(.+?)\s*\((.+?)\)$/);
        if (match) {
          const wordPart = match[1].trim();
          const words = wordPart.split('/').map(w => w.trim());
          vocabList.push({ words, meaning: match[2].trim() });
        }
      } else if (currentSection === 'grammar') {
        const match = trimmed.match(/^-\s*`(.+?)`\s*\((.+?)\)$/);
        if (match) {
          grammarList.push({ pattern: match[1].trim(), meaning: match[2].trim() });
        }
      }
    }

    lessons.push({
      chapterName,
      chapterNumber: i + levelOffset,
      vocab: vocabList,
      kanji: kanjiList,
      grammar: grammarList
    });
  }

  return lessons;
}

// ========== MAIN ==========
async function main() {
  loadEnvFile();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const args = process.argv.slice(2);
  let targetLevel = "N5";
  let targetChapter = null;
  let publishToDb = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--level' && args[i+1]) {
      targetLevel = args[i+1].toUpperCase();
    }
    if (args[i] === '--chapter' && args[i+1]) {
      targetChapter = parseInt(args[i+1], 10);
    }
    if (args[i] === '--publish') {
      publishToDb = true;
    }
  }

  if (targetChapter === null) {
    logger.error("Silakan tentukan bab dengan --chapter <nomor_bab>");
    process.exit(1);
  }

  // 1. Membaca metadata bab asli (UUID, slug, title)
  const lessonsDir = path.join(process.cwd(), 'data', 'lesson', targetLevel.toLowerCase());
  const originalFileName = `bab${targetChapter}.json`;
  const originalFilePath = path.join(lessonsDir, originalFileName);

  if (!fs.existsSync(originalFilePath)) {
    logger.error(`File asli tidak ditemukan: ${originalFilePath}`);
    process.exit(1);
  }

  logger.info(`📖 Membaca file metadata pelajaran asli: ${originalFilePath}`);
  const originalLesson = JSON.parse(fs.readFileSync(originalFilePath, 'utf-8'));

  // 2. Membaca & parsing file markdown kurikulum (Sumber Distribusi Utama)
  let curriculumFile = '';
  if (targetLevel === "N5") {
    curriculumFile = 'minna-no-nihogo-1.md';
  } else if (targetLevel === "N4") {
    curriculumFile = 'minna-no-nihogo-2.md';
  } else if (targetLevel === "N3") {
    curriculumFile = 'tobira-kanzen-n3.md';
  }
  const curriculumPath = path.join(process.cwd(), 'data', 'lesson', targetLevel.toLowerCase(), curriculumFile);
  
  if (!fs.existsSync(curriculumPath)) {
    logger.error(`Kurikulum Markdown tidak ditemukan di: ${curriculumPath}`);
    process.exit(1);
  }

  logger.info(`🔍 Membaca kurikulum dari: ${curriculumPath}`);
  const levelOffset = targetLevel === "N4" ? 25 : (targetLevel === "N3" ? 50 : 0);
  const curriculumLessons = parseCurriculumMarkdown(curriculumPath, levelOffset);
  const matchedCurriculum = curriculumLessons.find(l => l.chapterNumber === targetChapter);

  if (!matchedCurriculum) {
    logger.error(`Bab ${targetChapter} tidak ditemukan di kurikulum markdown.`);
    process.exit(1);
  }

  logger.info(`Berhasil mem-parse Bab ${targetChapter}: ${matchedCurriculum.vocab.length} kosakata, ${matchedCurriculum.kanji.length} kanji, ${matchedCurriculum.grammar.length} tata bahasa.`);

  // 3. Me-resolve UUIDs dari database lokal (local JSON files)
  const dbDir = path.join(process.cwd(), 'data', 'db', targetLevel.toLowerCase());
  const dbVocab = JSON.parse(fs.readFileSync(path.join(dbDir, 'vocab.json'), 'utf-8'));
  const dbKanji = JSON.parse(fs.readFileSync(path.join(dbDir, 'kanji.json'), 'utf-8'));
  const dbGrammar = JSON.parse(fs.readFileSync(path.join(dbDir, 'grammar.json'), 'utf-8'));

  // Resolve Vocab
  const vocabIds = [];
  const resolvedVocabs = [];
  for (const v of matchedCurriculum.vocab) {
    let foundItem = null;
    const allMatches = [];

    for (const w of v.words) {
      let cleanW = w.replace(/^〜|〜$/, '');
      if (!cleanW) continue;
      if (vocabNormalizations[cleanW]) cleanW = vocabNormalizations[cleanW];

      const matches = dbVocab.filter(item => 
        item.word === w || 
        item.furigana === w || 
        item.slug === slugify(w) ||
        item.word === cleanW ||
        item.furigana === cleanW ||
        item.slug === slugify(cleanW)
      );
      
      allMatches.push(...matches);
    }

    if (allMatches.length > 0) {
      // Hilangkan duplikat
      const uniqueMatches = Array.from(new Map(allMatches.map(m => [m.id, m])).values());

      // Urutkan agar yang tidak memiliki akhiran homonim (seperti -2, -3) didahulukan
      uniqueMatches.sort((a, b) => {
        const aHasSuffix = /-\d+$/.test(a.slug);
        const bHasSuffix = /-\d+$/.test(b.slug);
        if (aHasSuffix && !bHasSuffix) return 1;
        if (!aHasSuffix && bHasSuffix) return -1;
        
        // Fallback: jika ada kecocokan arti di markdown, dahulukan
        const aMeaningMatch = a.meaning_id && a.meaning_id.toLowerCase().includes(v.meaning.toLowerCase());
        const bMeaningMatch = b.meaning_id && b.meaning_id.toLowerCase().includes(v.meaning.toLowerCase());
        if (aMeaningMatch && !bMeaningMatch) return -1;
        if (!aMeaningMatch && bMeaningMatch) return 1;

        return 0;
      });

      foundItem = uniqueMatches[0];
    }

    if (foundItem) {
      vocabIds.push(foundItem.id);
      resolvedVocabs.push(foundItem);
    } else {
      logger.error(`Gagal mencocokkan kosakata: ${v.words.join('/')} dengan database lokal.`);
    }
  }

  // Resolve Kanji
  const kanjiIds = [];
  const resolvedKanjis = [];
  const seenKanji = new Set();
  for (const k of matchedCurriculum.kanji) {
    const chars = k.split('');
    for (const char of chars) {
      if (!/[\u4E00-\u9FAF]/.test(char)) continue;
      if (seenKanji.has(char)) continue;

      const foundItem = dbKanji.find(item => item.character === char);
      if (foundItem) {
        seenKanji.add(char);
        kanjiIds.push(foundItem.id);
        resolvedKanjis.push(foundItem);
      } else {
        logger.error(`Gagal mencocokkan kanji: ${char} dengan database lokal.`);
      }
    }
  }

  // Use original grammar_list directly from the original lesson JSON
  let grammarIds = originalLesson.grammar_list || [];
  let resolvedGrammars = dbGrammar.filter(g => grammarIds.includes(g.id));

  // Fallback: Jika resolusi grammar kurang dari jumlah pola di kurikulum, gunakan data dari file spec
  if (resolvedGrammars.length < matchedCurriculum.grammar.length) {
    logger.info(`⚠️ Jumlah grammar ter-resolve (${resolvedGrammars.length}) kurang dari kurikulum (${matchedCurriculum.grammar.length}). Mencoba resolusi via file spec...`);
    try {
      const specPath = path.join(process.cwd(), 'scripts', `build_all_${targetLevel.toLowerCase()}_lessons.mjs`);
      if (fs.existsSync(specPath)) {
        const specFileContent = fs.readFileSync(specPath, 'utf-8');
        const regex = new RegExp(`order:\\s*${targetChapter},[\\s\\S]*?rawGrammarTitles:\\s*\\[([\\s\\S]*?)\\]`, 'i');
        const match = specFileContent.match(regex);
        if (match && match[1]) {
          const rawTitles = match[1]
            .split(',')
            .map(t => t.replace(/['"`\n]/g, '').trim())
            .filter(Boolean);
          
          logger.info(`Ditemukan judul grammar dari spec: ${rawTitles.join(', ')}`);
          
          const specGrammars = [];
          for (const title of rawTitles) {
            // Normalisasi judul
            let cleanTitle = title.replace(/[\s~～]/g, '').toLowerCase();
            if (cleanTitle.includes('de(penanda')) cleanTitle = 'で';
            if (cleanTitle.includes('to(penanda')) cleanTitle = 'と';
            if (cleanTitle.includes('ni(penanda')) cleanTitle = 'に';

            const found = dbGrammar.find(g => {
              const dbTitle = g.title.replace(/[\s~～]/g, '').toLowerCase();
              return dbTitle.includes(cleanTitle) || cleanTitle.includes(dbTitle);
            });
            if (found) specGrammars.push(found);
          }

          if (specGrammars.length > 0) {
            resolvedGrammars = specGrammars;
            grammarIds = specGrammars.map(g => g.id);
            logger.info(`✅ Berhasil me-resolve ${resolvedGrammars.length} grammar via spec file.`);
          }
        }
      }
    } catch (err) {
      logger.error(`Gagal melakukan resolusi fallback grammar via spec: ${err.message}`);
    }
  }

  logger.info(`Resolved: ${resolvedVocabs.length}/${matchedCurriculum.vocab.length} vocab, ${resolvedKanjis.length}/${matchedCurriculum.kanji.length} kanji, ${resolvedGrammars.length}/${matchedCurriculum.grammar.length} grammar.`);

  // 4. Mempersiapkan detail konteks untuk LLM Prompt
  const vocabStr = resolvedVocabs.map(v => `- Word: "${v.word}" (Furigana: "${v.furigana || ''}", Romaji: "${v.romaji || ''}") -> Arti: "${v.meaning_id || v.meaning || ''}"`).join('\n');
  const kanjiStr = resolvedKanjis.map(k => `- Kanji: "${k.character}" -> Arti: "${k.meaning || ''}"`).join('\n');
  const grammarStr = resolvedGrammars.map(g => `- Tata Bahasa: "${g.title}" (Bentuk: "${g.formation || ''}") -> Arti: "${g.meaning || ''}"`).join('\n');

  logger.info("Menghubungi AI Client (9router)...");
  const aiClient = await createAiClient();

  const isAdvancedLevel = targetLevel === "N3" || targetLevel === "N2" || targetLevel === "N1";
  const quizQuestionInstruction = isAdvancedLevel
    ? "Pertanyaan kuis (wajib FULL menggunakan bahasa Jepang dengan Kanji + Kana alami, mirip soal asli JLPT N3, JANGAN ada terjemahan bahasa Indonesia di pertanyaan)"
    : "Pertanyaan kuis (Bahasa Indonesia, minimal 2-3 kuis wajib menyertakan pilihan atau teks bahasa Jepang agar menantang)";

  const quizOptionsInstruction = isAdvancedLevel
    ? "Pilihan jawaban (wajib FULL menggunakan bahasa Jepang/Kana/Kanji saja, tanpa bahasa Indonesia)"
    : "Pilihan jawaban (Pilihan A, Pilihan B, Pilihan C, Pilihan D)";

  const prompt = `Anda adalah penulis skenario pendidikan bahasa Jepang tingkat JLPT ${targetLevel}.
Pelajaran: "${originalLesson.title}" (Bab ${originalLesson.order_number})
Sasaran Kemampuan Bab Ini: ${originalLesson.summary}

DAFTAR TATA BAHASA YANG WAJIB DIATUR/DIGUNAKAN (Gunakan pola ini dalam menulis dialog percakapan):
${grammarStr}

DAFTAR KOSAKATA YANG WAJIB DIATUR/DIGUNAKAN (Gunakan kosakata ini dalam menulis dialog percakapan):
${vocabStr}

DAFTAR KANJI UNTUK DIAGRAM / REFERENSI BERSAMA:
${kanjiStr}

Daftar Karakter yang Tersedia (Gunakan 2 karakter dari daftar berikut untuk percakapan harian yang realistis):
${EXACT_CAST_ROLES}

TUGAS ANDA:
1. Buatlah dialog percakapan harian realistis yang terdiri dari minimal 3-6 pertukaran kalimat (total 6-12 baris kalimat bolak-balik).
2. Format output dialog harus berupa array JSON dari objek-objek berikut:
   {
     "speaker": "Nama Jepang Tokoh dalam Katakana/Kanji (contoh: ミラー atau 佐藤)",
     "speakerName": "Nama Tokoh dalam Romaji (contoh: Miller atau Sato)",
     "jp": "Kalimat bahasa Jepang UTUH menggunakan Kanji + Kana secara alami (contoh: こちらはマイク・ミラーさんです。)",
     "furigana": "Kalimat bahasa Jepang UTUH dengan Kanji diganti Hiragana murni untuk pencocokan furigana di web (contoh: こちらはまいく・みらーさんです。 jika tidak ada kanji, atau さとうです。どうぞよろしく。 untuk 佐藤です。どうぞよろしく。)",
     "romaji": "Transkripsi Romaji (contoh: Kochira wa Maiku Miraa-san desu.)",
     "translation": "Terjemahan bahasa Indonesia yang sangat alami, luwes, komunikatif, dan tidak kaku. JANGAN menerjemahkan kata-per-kata secara harfiah (misal hindari 'adalah', 'saudara/saudari' jika tidak alami dalam bahasa Indonesia kasual/semi-formal)."
   }
3. Buat minimal 2-4 catatan budaya/etika (callouts) yang mendalam terkait bab ini. Format output callouts harus berupa array JSON dari objek berikut:
   {
     "title": "Judul Catatan Budaya/Etika (Bahasa Indonesia)",
     "content": "Penjelasan mendalam mengenai etika berkomunikasi, kebiasaan sosial Jepang, atau perbedaan nuansa kata terkait bab ini (Bahasa Indonesia)."
   }
4. Buat tepat 10 kuis pilihan ganda yang menguji tata bahasa dan kosakata pelajaran ini secara spesifik. Format kuis:
   {
     "question": "${quizQuestionInstruction}",
     "options": ${quizOptionsInstruction === "Pilihan jawaban (Pilihan A, Pilihan B, Pilihan C, Pilihan D)" ? '["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"]' : '["Pilihan A (Jepang)", "Pilihan B (Jepang)", "Pilihan C (Jepang)", "Pilihan D (Jepang)"]'},
     "correct_answer": "Pilihan yang benar (harus persis sama dengan salah satu elemen di options)",
     "explanation": "Penjelasan detail mengapa jawaban tersebut benar (Wajib dalam Bahasa Indonesia)"
   }
5. ATURAN KETAT SPELING JEPANG & PARTIKEL:
   - Partikel 'wa' (penanda topik) WAJIB ditulis menggunakan huruf Hiragana 'は' (ha) di field 'jp' DAN 'furigana'. DILARANG menulisnya sebagai 'わ' (wa). Contoh salah: わたしわ. Contoh benar: わたしは.
   - Partikel 'e' (penanda arah) WAJIB ditulis menggunakan huruf Hiragana 'へ' (he) di field 'jp' DAN 'furigana'. DILARANG menulisnya sebagai 'え' (e). Contoh salah: にほんえ. Contoh benar: にほんへ.
   - Partikel 'o' (penanda objek) WAJIB ditulis menggunakan huruf Hiragana 'を' (wo) di field 'jp' DAN 'furigana'. DILARANG menulisnya sebagai 'お' (o). Contoh salah: りんごお. Contoh benar: りんごを.
   - Pastikan ejaan bahasa Jepang benar-benar bebas dari typo (contoh: ではありません, bukan であれりません).
   - Pastikan kanji yang digunakan sesuai makna kata (contoh: 'いしゃ' untuk dokter adalah '医者', bukan '慰謝').
   - LOGIKA ASAL KARAKTER: Karakter dengan nama Indonesia (Indah, Siti, Ayu, Ani, Budi, Dito, Faisal, Andi) adalah orang Indonesia (berasal dari Indonesia / インドネシア). Karakter dengan nama Jepang (Hayashi, Sato, Suzuki, Tanaka, Yamada, Takahashi, Kobayashi) adalah orang Jepang (berasal dari Jepang / にほん). Jangan sampai ada karakter Jepang mengaku berasal dari Indonesia or sebaliknya.
6. Buat ringkasan materi pelajaran singkat dalam 1-2 kalimat bahasa Indonesia untuk ditaruh di field "summary".

Format response wajib berupa JSON murni dengan skema berikut:
{
  "summary": "Ringkasan materi pelajaran...",
  "dialogue": [
    ...
  ],
  "callouts": [
    ...
  ],
  "quizzes": [
    ...
  ]
}`;

  let aiResponseText = await aiClient.generateText(prompt);
  aiResponseText = aiResponseText.replace(/```json/gi, "").replace(/```/g, "").trim();
  
  // Clean control characters and escape newlines inside JSON string literals
  let insideString = false;
  let chars = aiResponseText.split('');
  for (let idx = 0; idx < chars.length; idx++) {
    const char = chars[idx];
    if (char === '"' && chars[idx - 1] !== '\\') {
      insideString = !insideString;
    }
    if (insideString) {
      if (char === '\n') {
        chars[idx] = '\\n';
      } else if (char === '\r') {
        chars[idx] = '';
      } else if (char === '\t') {
        chars[idx] = '\\t';
      } else if (char.charCodeAt(0) < 32) {
        // Strip other invalid control characters
        chars[idx] = ' ';
      }
    }
  }
  const cleanedJson = chars.join('');
  
  const generated = JSON.parse(cleanedJson);

  // Validasi kuis tepat 10
  if (!Array.isArray(generated.quizzes) || generated.quizzes.length !== 10) {
    throw new Error(`AI mengembalikan jumlah kuis tidak valid: ${generated.quizzes?.length || 0}`);
  }

  // Validasi callouts minimal 2
  if (!Array.isArray(generated.callouts) || generated.callouts.length < 2) {
    throw new Error(`AI mengembalikan jumlah callouts tidak valid: ${generated.callouts?.length || 0}`);
  }

  // Bangun konten markdown dari callouts
  let contentMarkdown = "";
  generated.callouts.forEach((co) => {
    contentMarkdown += `> **Catatan Budaya: ${co.title}**\n> ${co.content.replace(/\n/g, '\n> ')}\n\n`;
  });
  contentMarkdown = contentMarkdown.trim();

  // Susun data pelajaran baru
  const enrichedLesson = {
    id: originalLesson.id,
    category_id: originalLesson.category_id,
    title: originalLesson.title,
    slug: originalLesson.slug,
    order_number: originalLesson.order_number,
    summary: generated.summary || originalLesson.summary,
    content: contentMarkdown,
    dialogue: generated.dialogue.map((d, index) => ({
      speaker: d.speaker,
      speakerName: d.speakerName,
      jp: d.jp,
      text: d.jp,
      furigana: d.furigana,
      romaji: d.romaji,
      translation: d.translation,
      id: String(index)
    })),
    vocab_list: vocabIds,
    kanji_list: kanjiIds,
    grammar_list: grammarIds,
    listening_list: [],
    reading_list: [],
    quizzes: generated.quizzes.map((q, index) => ({
      id: `quiz-${originalLesson.order_number}-${index}`,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation
    })),
    estimated_minutes: 15,
    is_premium: false,
    is_published: true,
    seo: {
      title: `Belajar ${targetLevel}: ${originalLesson.title}`,
      description: generated.summary || originalLesson.summary
    },
    generation_context: {
      can_do: originalLesson.summary,
      generated_at: new Date().toISOString()
    },
    image_url: "",
    status: "published"
  };

  // Tulis ke file draft lokal
  const targetDir1 = path.join(process.cwd(), 'data', 'lesson', targetLevel.toLowerCase());
  const targetDir2 = path.join(process.cwd(), 'data', 'lessons', targetLevel.toLowerCase());

  if (!fs.existsSync(targetDir1)) fs.mkdirSync(targetDir1, { recursive: true });
  if (!fs.existsSync(targetDir2)) fs.mkdirSync(targetDir2, { recursive: true });

  const draftFileName = `draft_bab${targetChapter}.json`;
  fs.writeFileSync(path.join(targetDir1, draftFileName), JSON.stringify(enrichedLesson, null, 2), 'utf-8');
  fs.writeFileSync(path.join(targetDir2, draftFileName), JSON.stringify(enrichedLesson, null, 2), 'utf-8');
  logger.info(`💾 Berhasil menyimpan file draft baru ke:`);
  logger.info(`   - ${path.join(targetDir1, draftFileName)}`);
  logger.info(`   - ${path.join(targetDir2, draftFileName)}`);

  // Jika flag --publish aktif, unggah/upsert ke Supabase
  if (publishToDb) {
    logger.info(`Upserting Bab ${targetChapter} (${targetLevel}) ke tabel lessons Supabase...`);
    const { error: upsertErr } = await supabase
      .from('lessons')
      .upsert(enrichedLesson, { onConflict: 'id' });

    if (upsertErr) {
      logger.error(`Gagal melakukan upsert ke database: ${upsertErr.message}`);
    } else {
      logger.info(`🎉 Berhasil melakukan upsert Bab ${targetChapter} ke database Supabase!`);
    }
  }
}

main().catch(e => {
  logger.error(`Fatal error: ${e.message}`);
  console.error(e);
  process.exit(1);
});