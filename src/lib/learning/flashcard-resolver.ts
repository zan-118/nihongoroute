/**
 * @file flashcard-resolver.ts
 * @description Modul dalam (deep module) untuk klasifikasi ID kartu flash,
 * pemformatan objek kartu (kosakata & kanji), serta pengurutan berdasarkan daftar permintaan.
 * 100% murni tanpa efek samping I/O untuk pengujian langsung via Vitest.
 */

export interface FormattedCard {
  _id: string;
  id: string;
  word: string;
  meaning: string;
  romaji?: string | null;
  furigana?: string | null;
  jlptLevel?: string | null;
  examples?: Array<{ japanese: string; indonesian: string }> | null;
  mnemonic?: string | null;
  usageNotes?: string | null;
  pitchAccent?: string | null;
  hinshi?: string | null;
  category: "vocab" | "kanji";
  docType: "vocab" | "kanji";
  kanjiDetails?: {
    onyomi?: string | null;
    kunyomi?: string | null;
  } | null;
}

export interface IdClassification {
  uuids: string[];
  slugs: string[];
  romajis: string[];
  kanjiChars: string[];
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const POS_PREFIXES = [
  "pre-noun-adjectival-",
  "adverbial-noun-",
  "temporal-noun-",
  "noun-",
  "pronoun-",
  "numeric-",
  "expression-",
  "conjunction-",
  "verb-"
];

/**
 * Memisahkan array ID mentah ke dalam kategori UUID, slug, romaji (dengan pembersihan prefix), dan kanji character.
 */
export function classifyFlashcardIds(ids: string[]): IdClassification {
  const uuids: string[] = [];
  const slugs: string[] = [];
  const romajis: string[] = [];
  const kanjiChars: string[] = [];

  for (const id of ids) {
    if (UUID_REGEX.test(id)) {
      uuids.push(id);
    } else if (id.startsWith("n5-") || id.startsWith("n4-")) {
      const cleanId = id.slice(3);
      let romajiFound = cleanId;
      for (const prefix of POS_PREFIXES) {
        if (cleanId.startsWith(prefix)) {
          romajiFound = cleanId.slice(prefix.length);
          break;
        }
      }
      romajis.push(romajiFound);
    } else if (id.length === 1) {
      kanjiChars.push(id);
    } else {
      slugs.push(id);
    }
  }

  return { uuids, slugs, romajis, kanjiChars };
}

/**
 * Format raw vocab rows dari Supabase ke FormattedCard array.
 */
export function formatVocabCards(rows: Record<string, unknown>[]): FormattedCard[] {
  return rows.map((v) => ({
    _id: String(v.id || ""),
    id: String(v.id || ""),
    word: String(v.word || ""),
    meaning: String(v.meaning || ""),
    romaji: v.romaji as string | undefined,
    furigana: v.furigana as string | undefined,
    jlptLevel: v.jlpt_level as string | undefined,
    examples: Array.isArray(v.examples)
      ? (v.examples as Record<string, unknown>[]).map((ex) => ({
          japanese: String(ex?.japanese || ex?.jp || ""),
          indonesian: String(ex?.indonesian || ex?.meaning || ex?.id || "")
        }))
      : [],
    mnemonic: v.mnemonic as string | undefined,
    usageNotes: v.usage_notes as string | undefined,
    pitchAccent: v.pitch_accent as string | undefined,
    hinshi: v.hinshi as string | undefined,
    category: "vocab",
    docType: "vocab",
  }));
}

/**
 * Format raw vocab rows hasil kueri romaji untuk dicocokkan dengan ID legacy.
 */
export function formatRomajiVocabs(rows: Record<string, unknown>[], requestedIds: string[]): FormattedCard[] {
  const formatted: FormattedCard[] = [];
  if (!rows || rows.length === 0) return formatted;

  rows.forEach((v) => {
    const romajiStr = typeof v.romaji === "string" ? v.romaji : "";
    const matchingLegacyIds = requestedIds.filter((id) => {
      if (!id.startsWith("n5-") && !id.startsWith("n4-")) return false;
      const cleanId = id.slice(3);
      let romajiFound = cleanId;
      for (const prefix of POS_PREFIXES) {
        if (cleanId.startsWith(prefix)) {
          romajiFound = cleanId.slice(prefix.length);
          break;
        }
      }
      return romajiFound.toLowerCase() === romajiStr.toLowerCase();
    });

    matchingLegacyIds.forEach((legacyId) => {
      formatted.push({
        _id: legacyId,
        id: legacyId,
        word: String(v.word || ""),
        meaning: String(v.meaning || ""),
        romaji: v.romaji as string | undefined,
        furigana: v.furigana as string | undefined,
        jlptLevel: v.jlpt_level as string | undefined,
        examples: Array.isArray(v.examples)
          ? (v.examples as Record<string, unknown>[]).map((ex) => ({
              japanese: String(ex?.japanese || ex?.jp || ""),
              indonesian: String(ex?.indonesian || ex?.meaning || ex?.id || "")
            }))
          : [],
        mnemonic: v.mnemonic as string | undefined,
        usageNotes: v.usage_notes as string | undefined,
        pitchAccent: v.pitch_accent as string | undefined,
        hinshi: v.hinshi as string | undefined,
        category: "vocab",
        docType: "vocab",
      });
    });
  });

  return formatted;
}

/**
 * Format raw kanji rows dari Supabase ke FormattedCard array.
 */
export function formatKanjiCards(rows: Record<string, unknown>[]): FormattedCard[] {
  return rows.map((k) => {
    let formattedMnemonic = "";
    if (Array.isArray(k.mnemonics)) {
      formattedMnemonic = k.mnemonics.join("\n");
    } else if (typeof k.mnemonics === "string") {
      formattedMnemonic = k.mnemonics;
    }

    const formattedExamples = Array.isArray(k.examples)
      ? (k.examples as Record<string, unknown>[]).map((ex) => ({
          japanese: String(ex?.japanese || ex?.jp || ""),
          indonesian: String(ex?.indonesian || ex?.meaning || ex?.id || "")
        }))
      : [];

    return {
      _id: String(k.id || ""),
      id: String(k.id || ""),
      word: String(k.character || ""),
      meaning: String(k.meaning || ""),
      romaji: null,
      furigana: (k.kunyomi || k.onyomi || null) as FormattedCard['furigana'],
      jlptLevel: k.jlpt_level as string | undefined,
      examples: formattedExamples,
      mnemonic: formattedMnemonic || null,
      category: "kanji",
      docType: "kanji",
      kanjiDetails: {
        onyomi: k.onyomi as string | null | undefined,
        kunyomi: k.kunyomi as string | null | undefined,
      }
    };
  });
}

/**
 * Mengurutkan array kartu sesuai urutan ID/word yang diminta pengguna.
 */
export function sortCardsByRequestedOrder(cards: FormattedCard[], requestedIds: string[]): FormattedCard[] {
  const requestedOrderMap = new Map<string, number>();
  requestedIds.forEach((id, index) => {
    requestedOrderMap.set(id.toLowerCase(), index);
  });

  return [...cards].sort((a, b) => {
    const aKeys = [a.id.toLowerCase(), a.word.toLowerCase()];
    const bKeys = [b.id.toLowerCase(), b.word.toLowerCase()];

    let aIdx = 9999;
    let bIdx = 9999;

    for (const k of aKeys) {
      if (requestedOrderMap.has(k)) {
        aIdx = requestedOrderMap.get(k)!;
        break;
      }
    }
    for (const k of bKeys) {
      if (requestedOrderMap.has(k)) {
        bIdx = requestedOrderMap.get(k)!;
        break;
      }
    }

    return aIdx - bIdx;
  });
}
