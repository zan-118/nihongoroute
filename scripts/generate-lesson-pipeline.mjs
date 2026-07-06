import fs from 'fs';
import readline from 'readline/promises';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSanityClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
  apiVersion: '2024-03-01'
});

async function callLLM(messages, systemPrompt, jsonMode = false) {
  const url = process.env.AI_BASE_URL + '/chat/completions';
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL // Sesuai permintaan user

  const body = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    temperature: 0.7,
  };
  
  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LLM API Error: ${errorText}`);
  }

  const json = await res.json();
  return json.choices[0].message.content;
}

async function main() {
  console.log('============================================');
  console.log('🤖 GENERATOR LESSON - NIHONGOROUTE RAG PIPELINE');
  console.log('============================================\n');

  try {
    // 1. INPUT DATA
    const title = await rl.question('Judul/Tema Pelajaran Baru (Contoh: Keluarga): ');
    const jlptLevel = await rl.question('Level JLPT (Contoh: N5): ');

    console.log('\n⏳ [1/4] Mencari kata kunci relevan via LLM untuk query ke Supabase...');
    
    const searchPrompt = `Berikan daftar 10 kosakata bahasa Jepang (huruf Kana/Kanji) dan 2 pola tata bahasa (huruf Kana/Romaji) level ${jlptLevel} yang sangat berkaitan dengan tema "${title}".
Wajib kembalikan format JSON: { "words": ["kata1", "kata2"], "grammar": ["pola1", "pola2"] }`;

    const searchJsonStr = await callLLM(
      [{ role: 'user', content: searchPrompt }],
      'Kamu adalah ahli bahasa Jepang pembuat kurikulum.',
      true
    );

    let searchKeywords = { words: [], grammar: [] };
    try {
      searchKeywords = JSON.parse(searchJsonStr);
    } catch (e) {
      console.warn('Gagal parse JSON pencarian, menggunakan array kosong.');
    }

    console.log(`🔍 LLM merekomendasikan kata: ${searchKeywords.words.join(', ')}`);
    console.log(`⏳ Mengambil data mentah dari Supabase berdasarkan rekomendasi...`);

    let rawVocabs = [];
    if (searchKeywords.words && searchKeywords.words.length > 0) {
      const { data, error } = await supabase.from('vocab').select('*').in('word', searchKeywords.words);
      if (!error && data) rawVocabs = data;
    }

    let rawGrammars = [];
    if (searchKeywords.grammar && searchKeywords.grammar.length > 0) {
      const { data, error } = await supabase.from('grammar').select('*').in('title', searchKeywords.grammar);
      if (!error && data) rawGrammars = data;
    }
    
    // Simpan UUID untuk relasi Sanity nanti
    const vocabIds = rawVocabs.map(v => v.id);
    const grammarIds = rawGrammars.map(g => g.id);

    console.log(`✅ Fetched ${rawVocabs.length} vocab, ${rawGrammars.length} grammar.`);
    
    const contextData = JSON.stringify({
      vocab: rawVocabs,
      grammar: rawGrammars
    }, null, 2);

    // 2. TAHAP KURIKULUM / PEDAGOGI
    console.log('\n⏳ [2/4] Merancang kurikulum pedagogi menggunakan OpenAI...');
    
    const curriculumPrompt = `Kamu adalah perancang kurikulum (pedagog) bahasa Jepang senior. 
Berdasarkan data kosakata dan tata bahasa berikut, susunlah alur belajar (kurikulum) yang logis untuk 1 bab pelajaran (Lesson). 
Jelaskan urutan pengenalan materi dan fokus pedagogi-nya. Outputkan dalam teks singkat yang jelas (max 3 paragraf).`;

    const curriculumPlan = await callLLM(
      [{ role: 'user', content: `Data Mentah:\n${contextData}\n\nBuat kurikulum untuk materi ini.` }],
      curriculumPrompt
    );

    console.log('\n--- 📋 HASIL KURIKULUM ---');
    console.log(curriculumPlan);
    console.log('--------------------------\n');

    const proceed = await rl.question('Lanjut ke penulisan Copywriting dengan kurikulum ini? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Dibatalkan.');
      process.exit(0);
    }

    // 3. TAHAP COPYWRITING & SANITY PORTABLE TEXT
    console.log('\n⏳ [3/4] Melakukan Copywriting dan konversi ke Portable Text JSON...');
    
    const copyPrompt = `Kamu adalah copywriter (pembuat konten) materi bahasa Jepang profesional. 
Tugasmu adalah menulis narasi pelajaran bahasa Indonesia, lengkap dengan dialog contoh, penjelasan tata bahasa, dan catatan budaya.

Ikuti kurikulum ini:
${curriculumPlan}

Gunakan data fakta (vocab & grammar) ini:
${contextData}

Wajib kembalikan format JSON (object) dengan 1 key "content_blocks" yang merupakan Array of objects berformat Sanity Portable Text sesuai skema berikut:
- Teks standar (paragraf): { "_type": "block", "style": "normal", "children": [{ "_type": "span", "text": "Isi teks..." }] }
- Dialog: { "_type": "dialogueBlock", "title": "Judul (ops)", "content": "A: halo\\nB: halo", "translation": "Terjemahan", "furigana": "A: halo\\nB: halo" }
- Grammar: { "_type": "grammarBlock", "title": "Nama pola", "content": "Formula", "translation": "Fungsi", "examples": [{ "_type": "exampleSentence", "jp": "...", "id": "...", "romaji": "..." }] }

Tulis teks semenarik mungkin untuk pemula! (Harus berformat JSON Valid)`;

    const rawCopywriting = await callLLM(
      [{ role: 'user', content: `Buatkan JSON content_blocks Sanity untuk lesson "${title}"!` }],
      copyPrompt,
      true
    );

    let contentBlocks = [];
    try {
      const parsed = JSON.parse(rawCopywriting);
      contentBlocks = parsed.content_blocks || [];
    } catch (e) {
      console.error('Gagal parsing JSON dari LLM:', e);
      console.log(rawCopywriting);
      process.exit(1);
    }

    // 4. PUSH KE SANITY CMS
    console.log('\n⏳ [4/4] Menyimpan ke Sanity CMS...');

    const newLesson = {
      _type: 'lesson',
      title,
      slug: { _type: 'slug', current: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      order_number: 99, // default di akhir
      is_published: false, // simpan sebagai draft dulu
      summary: `Pelajaran tentang ${title}`,
      content_blocks: contentBlocks.map(block => ({
        ...block,
        _key: Math.random().toString(36).substring(2, 9) // Sanity butuh _key untuk array
      })),
      vocab_list: vocabIds.map(id => ({ _type: 'reference', _ref: id })), // reference Supabase mock kalau pake SupabaseSelector biasanya cuma UUID string (wait schema lesson of: [{type: 'string'}])
      grammar_list: grammarIds // schema string array
    };

    const result = await sanity.create(newLesson);
    
    console.log('\n🎉 BERHASIL!');
    console.log(`Document ID di Sanity: ${result._id}`);
    console.log(`Silakan buka Sanity Studio untuk meninjau hasilnya.`);

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    rl.close();
  }
}

main();
