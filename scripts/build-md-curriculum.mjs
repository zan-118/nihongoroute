import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import process from 'process';

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

async function run() {
  loadEnvFile();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const brainPath = 'C:/Users/fauza/.gemini/antigravity-ide/brain/ffd4af9b-7afe-4d00-b261-81df4b30c25b';
  const curriculumPath = path.join(brainPath, 'scratch', 'curriculum_standardized_n5.json');
  
  if (!fs.existsSync(curriculumPath)) {
    console.log("File kurikulum JSON tidak ditemukan.");
    return;
  }
  
  const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));
  const n5Chapters = curriculum.N5 || [];

  console.log("Menarik data master dari Supabase...");
  // Fetch everything to build dictionary
  const { data: allGrammar } = await supabase.from('grammar').select('id, title, meaning').eq('jlpt_level', 'N5');
  const { data: allVocab } = await supabase.from('vocab').select('id, word, romaji, furigana').eq('jlpt_level', 'N5');
  const { data: allKanji } = await supabase.from('kanji').select('id, character, meaning').eq('jlpt_level', 'N5');

  const gMap = {};
  if (allGrammar) allGrammar.forEach(g => gMap[g.id] = { t: g.title, m: g.meaning });
  const vMap = {};
  if (allVocab) allVocab.forEach(v => vMap[v.id] = { t: v.word || v.romaji, m: v.furigana || v.romaji });
  const kMap = {};
  if (allKanji) allKanji.forEach(k => kMap[k.id] = { t: k.character, m: k.meaning });

  let md = `# Kurikulum Master N5 (Lengkap)\n\n`;
  md += `> [!NOTE]\n> Kurikulum ini memuat Tata Bahasa, Kosakata, dan Kanji per bab yang telah di-generate oleh AI.\n\n`;

  n5Chapters.forEach(c => {
    md += `## Bab ${c.chapter_number}: ${c.chapter_title}\n`;
    md += `**Can-do**: ${c.cefr_can_do_statement}\n`;
    if (c.nuance_differences) md += `**Nuansa**: ${c.nuance_differences}\n`;
    md += `\n`;

    md += `### 📖 Tata Bahasa (${(c.grammar_ids || []).length})\n`;
    if (c.grammar_ids && c.grammar_ids.length > 0) {
      c.grammar_ids.forEach(id => {
        const item = gMap[id];
        md += `- **${item ? item.t : id}** (${item ? item.m : '?'})\n`;
      });
    } else {
      md += `- (Kosong)\n`;
    }
    md += `\n`;

    md += `### 📝 Kanji (${(c.kanji_ids || []).length})\n`;
    if (c.kanji_ids && c.kanji_ids.length > 0) {
      c.kanji_ids.forEach(id => {
        const item = kMap[id];
        md += `- **${item ? item.t : id}** (${item ? item.m : '?'})\n`;
      });
    } else {
      md += `- (Kosong)\n`;
    }
    md += `\n`;

    md += `### 🗣️ Kosakata (${(c.vocab_ids || []).length})\n`;
    if (c.vocab_ids && c.vocab_ids.length > 0) {
      c.vocab_ids.forEach(id => {
        const item = vMap[id];
        md += `- **${item ? item.t : id}** (${item ? item.m : '?'})\n`;
      });
    } else {
      md += `- (Kosong)\n`;
    }
    
    md += `\n---\n\n`;
  });

  const outPath = path.join(brainPath, 'curriculum_standardized_n5.md');
  fs.writeFileSync(outPath, md);
  console.log(`Berhasil menulis ke ${outPath}`);
}

run().catch(console.error);
