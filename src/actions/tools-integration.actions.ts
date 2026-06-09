"use server";

import { createStaticClient } from "@/lib/supabase/server";
import { sanityClient } from "@/lib/sanity.client";
import {
  MINI_DRILL_BANK,
  type DrillLevel,
  type MiniDrillQuestion,
} from "@/lib/jlpt-mini-drill";
import {
  COUNTER_QUESTIONS,
  type CounterQuestion,
  type CounterWord,
} from "@/lib/counter-trainer";
import {
  SHADOWING_PRESETS,
  type ShadowingPreset,
} from "@/lib/shadowing-recorder";

const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;
const COUNTER_LEVELS = ["N5", "N4"] as const;
const SHADOWING_LEVELS = ["N5", "N4", "N3"] as const;

interface VocabToolRow {
  id: string;
  word: string | null;
  furigana: string | null;
  meaning_id: string | null;
  jlpt_level: string | null;
  slug: string | null;
  hinshi?: string[] | string | null;
}

interface KanjiToolRow {
  id: string;
  character: string | null;
  meaning: string | null;
  onyomi: string | null;
  kunyomi: string | null;
  jlpt_level: string | null;
}

interface GrammarToolRow {
  id: string;
  title: string | null;
  meaning: string | null;
  formation: string | null;
  slug: string | null;
  jlpt_level: string | null;
}

interface SanityLineSource {
  _id: string;
  title?: string;
  slug?: string;
  jlpt_level?: string;
  difficulty?: string;
  body?: string;
  translation?: string;
}

export interface ToolsIntegrationData {
  miniDrillQuestions: MiniDrillQuestion[];
  counterQuestions: CounterQuestion[];
  shadowingPresets: ShadowingPreset[];
  stats: {
    miniDrillDatabaseCount: number;
    counterDatabaseCount: number;
    shadowingLibraryCount: number;
  };
}

function asDrillLevel(value: string | null | undefined): DrillLevel {
  const upper = String(value || "N5").toUpperCase();
  return JLPT_LEVELS.includes(upper as DrillLevel) ? (upper as DrillLevel) : "N5";
}

function asCounterLevel(value: string | null | undefined): "N5" | "N4" {
  const upper = String(value || "N5").toUpperCase();
  return COUNTER_LEVELS.includes(upper as "N5" | "N4") ? (upper as "N5" | "N4") : "N4";
}

function asShadowingLevel(value: string | null | undefined): "N5" | "N4" | "N3" {
  const upper = String(value || "N5").toUpperCase();
  return SHADOWING_LEVELS.includes(upper as "N5" | "N4" | "N3")
    ? (upper as "N5" | "N4" | "N3")
    : "N3";
}

function compactText(value: unknown) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.map((value) => compactText(value)).filter(Boolean)));
}

function buildOptions(answer: string, candidates: string[], seed: string) {
  const distractors = uniqueValues(candidates).filter((candidate) => candidate !== answer).slice(0, 8);
  const selected = shuffleBySeed(distractors, seed).slice(0, 3);
  return shuffleBySeed(uniqueValues([answer, ...selected]), `${seed}-options`);
}

function shuffleBySeed<T>(items: T[], seed: string) {
  const next = [...items];
  let state = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0) || 1;

  for (let index = next.length - 1; index > 0; index--) {
    state = (state * 9301 + 49297) % 233280;
    const swapIndex = state % (index + 1);
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function splitJapaneseLines(text: string) {
  return text
    .split(/\r?\n|(?<=[。！？!?])/)
    .map((line) => line.replace(/^[^:：]{1,16}[:：]\s*/, "").trim())
    .filter((line) => /[\u3040-\u30ff\u3400-\u9fff]/.test(line))
    .filter((line) => line.length >= 6)
    .slice(0, 24);
}

function splitTranslationLines(text: string | undefined) {
  return String(text || "")
    .split(/\r?\n|(?<=[.!?。！？])/)
    .map((line) => line.replace(/^[^:：]{1,24}[:：]\s*/, "").trim())
    .filter(Boolean);
}

function createShadowingChunks(text: string) {
  const chunks = text
    .replace(/[。！？!?]$/g, "")
    .split(/[、,]/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length > 1) return chunks.slice(0, 4);

  const midpoint = Math.ceil(text.length / 2);
  return [text.slice(0, midpoint), text.slice(midpoint)].map((chunk) => chunk.trim()).filter(Boolean);
}

function estimateTargetSeconds(text: string) {
  return Math.max(3, Math.min(14, Math.round(text.length / 4)));
}

function detectCounter(word: string): { answer: CounterWord; category: string; hint: string; explanation: string } | null {
  if (/[人者員生師友客母父兄姉弟妹子]/.test(word)) {
    return {
      answer: "人",
      category: "orang",
      hint: "Dipakai untuk menghitung orang.",
      explanation: "人 adalah counter utama untuk orang. Bacaan bisa berubah pada angka tertentu seperti 一人 dan 二人.",
    };
  }
  if (/[本書冊辞典雑誌]/.test(word)) {
    return {
      answer: "冊",
      category: "buku/jilid",
      hint: "Untuk buku atau benda berjilid.",
      explanation: "冊 dipakai untuk buku, majalah, manga, kamus, dan benda berjilid.",
    };
  }
  if (/[本瓶傘鉛筆線道木]/.test(word)) {
    return {
      answer: "本",
      category: "benda panjang",
      hint: "Untuk benda panjang atau silinder.",
      explanation: "本 menghitung benda panjang seperti botol, pensil, payung, batang, dan jalur.",
    };
  }
  if (/[紙券皿写真服枚]/.test(word)) {
    return {
      answer: "枚",
      category: "benda tipis",
      hint: "Untuk benda tipis dan datar.",
      explanation: "枚 cocok untuk kertas, tiket, foto, piring, dan pakaian yang dihitung sebagai lembaran.",
    };
  }
  if (/[猫犬魚鳥虫馬]/.test(word)) {
    return {
      answer: "匹",
      category: "hewan kecil",
      hint: "Untuk banyak hewan kecil.",
      explanation: "匹 umum untuk hewan kecil. Untuk burung besar atau hewan besar, counter bisa berbeda.",
    };
  }
  if (/[車機電脳カメラテレビ]/.test(word)) {
    return {
      answer: "台",
      category: "mesin/kendaraan",
      hint: "Untuk kendaraan dan mesin.",
      explanation: "台 menghitung kendaraan, komputer, kamera, mesin, dan perangkat elektronik besar.",
    };
  }
  if (/[茶水酒汁杯]/.test(word)) {
    return {
      answer: "杯",
      category: "minuman",
      hint: "Untuk isi gelas, cangkir, atau mangkuk.",
      explanation: "杯 menghitung minuman atau cairan dalam wadah, seperti teh, kopi, air, atau sup.",
    };
  }

  return null;
}

export async function getIntegratedMiniDrillQuestions(): Promise<MiniDrillQuestion[]> {
  const supabase = createStaticClient();

  try {
    const [vocabResult, kanjiResult, grammarResult] = await Promise.allSettled([
      supabase
        .from("vocab")
        .select("id, word, furigana, meaning_id, jlpt_level, slug, hinshi")
        .not("word", "is", null)
        .limit(60),
      supabase
        .from("kanji")
        .select("id, character, meaning, onyomi, kunyomi, jlpt_level")
        .not("character", "is", null)
        .limit(60),
      supabase
        .from("grammar")
        .select("id, title, meaning, formation, slug, jlpt_level")
        .not("title", "is", null)
        .limit(60),
    ]);

    const vocabRows =
      vocabResult.status === "fulfilled" && !vocabResult.value.error
        ? ((vocabResult.value.data || []) as VocabToolRow[])
        : [];
    const kanjiRows =
      kanjiResult.status === "fulfilled" && !kanjiResult.value.error
        ? ((kanjiResult.value.data || []) as KanjiToolRow[])
        : [];
    const grammarRows =
      grammarResult.status === "fulfilled" && !grammarResult.value.error
        ? ((grammarResult.value.data || []) as GrammarToolRow[])
        : [];

    const vocabMeanings = vocabRows.map((row) => compactText(row.meaning_id)).filter(Boolean);
    const kanjiMeanings = kanjiRows.map((row) => compactText(row.meaning)).filter(Boolean);
    const grammarMeanings = grammarRows.map((row) => compactText(row.meaning)).filter(Boolean);

    const vocabQuestions: MiniDrillQuestion[] = vocabRows
      .filter((row) => row.word && row.meaning_id)
      .map((row) => {
        const answer = compactText(row.meaning_id);
        return {
          id: `db-vocab-${row.id}`,
          level: asDrillLevel(row.jlpt_level),
          kind: "vocab",
          prompt: row.word || "",
          reading: row.furigana || undefined,
          answer,
          options: buildOptions(answer, vocabMeanings, `vocab-${row.id}`),
          explanation: `${row.word} berarti ${answer}.`,
          sourceHref: row.slug ? `/library/vocab/${row.slug}` : undefined,
          sourceTitle: row.word || undefined,
          sourceType: "database",
        };
      });

    const kanjiQuestions: MiniDrillQuestion[] = kanjiRows
      .filter((row) => row.character && row.meaning)
      .map((row) => {
        const answer = compactText(row.meaning);
        const reading = uniqueValues([row.onyomi || "", row.kunyomi || ""]).join(" / ");
        return {
          id: `db-kanji-${row.id}`,
          level: asDrillLevel(row.jlpt_level),
          kind: "kanji",
          prompt: row.character || "",
          reading: reading || undefined,
          answer,
          options: buildOptions(answer, kanjiMeanings, `kanji-${row.id}`),
          explanation: `${row.character} berkaitan dengan arti ${answer}.`,
          sourceHref: row.character ? `/library/kanji/${encodeURIComponent(row.character)}` : undefined,
          sourceTitle: row.character || undefined,
          sourceType: "database",
        };
      });

    const grammarQuestions: MiniDrillQuestion[] = grammarRows
      .filter((row) => row.title && row.meaning)
      .map((row) => {
        const answer = compactText(row.meaning);
        return {
          id: `db-grammar-${row.id}`,
          level: asDrillLevel(row.jlpt_level),
          kind: "grammar",
          prompt: row.formation || row.title || "",
          reading: row.title || undefined,
          answer,
          options: buildOptions(answer, grammarMeanings, `grammar-${row.id}`),
          explanation: `${row.title} berarti ${answer}.`,
          sourceHref: row.slug ? `/library/grammar/${row.slug}` : undefined,
          sourceTitle: row.title || undefined,
          sourceType: "database",
        };
      });

    return [...vocabQuestions, ...kanjiQuestions, ...grammarQuestions].filter(
      (question) => question.options.length >= 2
    );
  } catch (error) {
    console.error("[tools integration] Gagal mengambil bank mini drill:", error);
    return [];
  }
}

export async function getIntegratedCounterQuestions(): Promise<CounterQuestion[]> {
  const supabase = createStaticClient();

  try {
    const { data, error } = await supabase
      .from("vocab")
      .select("id, word, furigana, meaning_id, jlpt_level, slug")
      .not("word", "is", null)
      .limit(120);

    if (error) throw error;

    const rows = (data || []) as VocabToolRow[];
    return rows
      .map((row, index): CounterQuestion | null => {
        const word = compactText(row.word);
        const counter = detectCounter(word);
        if (!word || !counter) return null;

        const number = (index % 9) + 1;
        const phrase = `${number}${counter.answer}の${word}`;

        return {
          id: `db-counter-${row.id}`,
          level: asCounterLevel(row.jlpt_level),
          number,
          noun: word,
          nounReading: row.furigana || word,
          category: counter.category,
          answer: counter.answer,
          phrase,
          reading: row.furigana ? `${number}${counter.answer}の${row.furigana}` : phrase,
          translation: compactText(row.meaning_id) || word,
          hint: counter.hint,
          explanation: counter.explanation,
          sourceHref: row.slug ? `/library/vocab/${row.slug}` : undefined,
          sourceTitle: word,
          sourceType: "database",
        };
      })
      .filter((question): question is CounterQuestion => Boolean(question))
      .slice(0, 30);
  } catch (error) {
    console.error("[tools integration] Gagal mengambil soal counter:", error);
    return [];
  }
}

export async function getIntegratedShadowingPresets(): Promise<ShadowingPreset[]> {
  try {
    const query = /* groq */ `{
      "listenings": *[_type == "listeningMaterial" && defined(body)] | order(_createdAt desc)[0...8] {
        _id,
        title,
        "slug": slug.current,
        jlpt_level,
        difficulty,
        body,
        translation
      },
      "readings": *[_type == "readingMaterial" && defined(body)] | order(_createdAt desc)[0...8] {
        _id,
        title,
        "slug": slug.current,
        jlpt_level,
        difficulty,
        body,
        translation
      }
    }`;

    const result = await sanityClient.fetch<{
      listenings?: SanityLineSource[];
      readings?: SanityLineSource[];
    }>(query, {}, { cache: "no-store" });

    const presets: ShadowingPreset[] = [];

    for (const item of result.listenings || []) {
      const lines = splitJapaneseLines(item.body || "");
      const translations = splitTranslationLines(item.translation);
      lines.slice(0, 2).forEach((line, index) => {
        presets.push({
          id: `library-listening-${item._id}-${index}`,
          level: asShadowingLevel(item.jlpt_level),
          title: item.title ? `${item.title} #${index + 1}` : `Listening #${index + 1}`,
          text: line,
          translation: translations[index] || item.title || "Dari materi listening library.",
          focus: "listening line",
          targetSeconds: estimateTargetSeconds(line),
          chunks: createShadowingChunks(line),
          sourceHref: item.slug ? `/library/listening/${item.slug}` : undefined,
          sourceTitle: item.title,
          sourceType: "listening",
        });
      });
    }

    for (const item of result.readings || []) {
      const lines = splitJapaneseLines(item.body || "");
      const translations = splitTranslationLines(item.translation);
      lines.slice(0, 2).forEach((line, index) => {
        presets.push({
          id: `library-reading-${item._id}-${index}`,
          level: asShadowingLevel(item.jlpt_level),
          title: item.title ? `${item.title} #${index + 1}` : `Reading #${index + 1}`,
          text: line,
          translation: translations[index] || item.title || "Dari materi reading library.",
          focus: "reading aloud",
          targetSeconds: estimateTargetSeconds(line),
          chunks: createShadowingChunks(line),
          sourceHref: item.slug ? `/library/reading/${item.slug}` : undefined,
          sourceTitle: item.title,
          sourceType: "reading",
        });
      });
    }

    return presets.slice(0, 16);
  } catch (error) {
    console.error("[tools integration] Gagal mengambil preset shadowing:", error);
    return [];
  }
}

export async function getToolsIntegrationData(): Promise<ToolsIntegrationData> {
  const [miniDrillQuestions, counterQuestions, shadowingPresets] = await Promise.all([
    getIntegratedMiniDrillQuestions(),
    getIntegratedCounterQuestions(),
    getIntegratedShadowingPresets(),
  ]);

  return {
    miniDrillQuestions: miniDrillQuestions.length > 0 ? miniDrillQuestions : MINI_DRILL_BANK,
    counterQuestions: counterQuestions.length > 0 ? counterQuestions : COUNTER_QUESTIONS,
    shadowingPresets: shadowingPresets.length > 0 ? shadowingPresets : SHADOWING_PRESETS,
    stats: {
      miniDrillDatabaseCount: miniDrillQuestions.length,
      counterDatabaseCount: counterQuestions.length,
      shadowingLibraryCount: shadowingPresets.length,
    },
  };
}
