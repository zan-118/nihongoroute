import { ContentBlock } from "@/types/database";

export interface TransformedLessonData {
  order_number?: number | null;
  summary?: string | null;
  generation_context?: Record<string, unknown> | null;
  vocabList?: unknown[] | null;
  grammarList?: unknown[] | null;
  kanjiList?: unknown[] | null;
  quizzes?: unknown[] | null;
  [key: string]: unknown;
}

/**
 * Transforms relational database lesson items into a dynamic array of PortableText blocks.
 * Only applies to relational content categorized as "jlpt".
 * 
 * @param result - Relational lesson object.
 * @param contentBlocks - Original static content blocks.
 * @param articles - Articles fallback array.
 * @returns Array of ContentBlock objects.
 */
export function transformLessonBlocks(
  result: TransformedLessonData,
  contentBlocks: ContentBlock[],
  articles: ContentBlock[]
): Record<string, unknown>[] {
  const dynamicBlocks: Record<string, unknown>[] = [];
  const orderNum = result.order_number || 1;

  // 1. Tujuan Belajar (Can-Do Objectives)
  dynamicBlocks.push({
    _type: "block",
    style: "h2",
    children: [{ _type: "span", text: `🎯 1. Tujuan Belajar (Can-Do Objectives)` }]
  });
  const canDoText = (result.generation_context as Record<string, unknown>)?.can_do as string || result.summary;
  if (canDoText) {
    dynamicBlocks.push({
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: `Pada bab ini, kita akan belajar skill penting berikut untuk mencapai target kemampuan:` }]
    });
    dynamicBlocks.push({
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: `• ${canDoText}` }]
    });
  }

  // 2. Target Kosakata
  if (result.vocabList && result.vocabList.length > 0) {
    dynamicBlocks.push({
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: `📖 2. Target Kosakata` }]
    });
    dynamicBlocks.push({
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: "Metode belajar praktis: Kanji (Hiragana - Romaji) : Arti Bahasa Indonesia kontekstual." }]
    });
    dynamicBlocks.push({
      _type: "vocabBlock"
    });
  }

  // 3. Tata Bahasa & Penjelasan
  if (result.grammarList && result.grammarList.length > 0) {
    dynamicBlocks.push({
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: `📖 3. Tata Bahasa & Penjelasan` }]
    });
    (result.grammarList as Array<Record<string, unknown>> || []).forEach((gItem) => {
      const g = gItem as Record<string, unknown>;
      dynamicBlocks.push({
        _type: "grammarBlock",
        title: g.title as string | undefined,
        content: (g.formation as string) || "",
        furigana: (g.formation_furigana as string) || "",
        translation: (g.meaning as string) || "",
        examples: g.exampleSentences || g.examples || [],
        notes: g.notes as string | undefined,
        slug: g.slug as string | undefined
      });
    });
  }

  // 4. Daftar Kanji Dasar
  if (result.kanjiList && result.kanjiList.length > 0) {
    dynamicBlocks.push({
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: `🖌️ 4. Daftar Kanji Dasar (Bab ${orderNum})` }]
    });
    dynamicBlocks.push({
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: "Ingin mahir menulis aksara Jepang? Pelajari detail urutan goresan (stroke order), cara baca Onyomi dan Kunyomi, serta contoh kosakata praktis di modul Kanji khusus NihongoRoute." }]
    });
    dynamicBlocks.push({
      _type: "kanjiBlock"
    });
  }

  // 5. Catatan Budaya
  const dbCallouts = (contentBlocks as unknown as Record<string, unknown>[]).filter((block) => {
    return block.type === "callout" || block._type === "calloutBlock";
  });
  if (dbCallouts.length > 0) {
    dynamicBlocks.push({
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: `⛩️ 5. Catatan Budaya` }]
    });
    dbCallouts.forEach((c) => {
      dynamicBlocks.push({
        _type: "calloutBlock",
        calloutType: (c.calloutType as string) || (c.type as string) || "info",
        title: c.title as string | undefined,
        content: c.content as string | undefined
      });
    });
  }

  // 6. Praktik Membaca Nyata (Dialog)
  const dbDialogs = (contentBlocks as unknown as Record<string, unknown>[]).filter((block) => {
    return block.type === "dialogue" || block._type === "dialogueBlock";
  });
  if (dbDialogs.length > 0) {
    dynamicBlocks.push({
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: `💬 6. Praktik Membaca Nyata (Dialog)` }]
    });
    dbDialogs.forEach((d) => {
      dynamicBlocks.push({
        _type: "dialogueBlock",
        content: d.content as string,
        romaji: d.romaji as string,
        translation: d.translation as string
      });
    });
  }

  // 7. Kuis Evaluasi
  if (result.quizzes && result.quizzes.length > 0) {
    dynamicBlocks.push({
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: `✏️ 7. Kuis Evaluasi Bab ${orderNum}` }]
    });
  }

  return dynamicBlocks;
}
