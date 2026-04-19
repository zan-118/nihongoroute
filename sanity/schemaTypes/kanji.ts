/**
 * @file kanji.ts
 * @description Definisi skema Sanity untuk dokumen 'kanji' (karakter kanji).
 * Mencakup logika validasi keunikan karakter dan ID untuk menjaga integritas data kamus kanji.
 * @module sanity/schemaTypes/kanji
 */

import { defineField, defineType } from "sanity";

// ======================
// VALIDATION LOGIC
// ======================

/**
 * Memastikan Kanji ID bersifat unik di seluruh dataset.
 */
const isUniqueKanjiId = async (value: string | undefined, context: any) => {
  if (!value) return true;
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2024-04-12" });
  const id = document._id.replace(/^drafts\./, "");

  const query = `*[_type == "kanji" && kanjiId == $value && _id != $draftId && _id != $publishedId][0]`;
  const params = { value, draftId: `drafts.${id}`, publishedId: id };
  const result = await client.fetch(query, params);

  return result
    ? `🚨 Kanji ID "${value}" sudah dipakai! Gunakan ID lain.`
    : true;
};

/**
 * Memastikan karakter kanji tidak duplikat dalam database.
 */
const isUniqueKanji = async (value: string | undefined, context: any) => {
  if (!value) return true;
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2024-04-12" });
  const id = document._id.replace(/^drafts\./, "");

  const query = `*[_type == "kanji" && character == $value && _id != $draftId && _id != $publishedId][0]`;
  const params = { value, draftId: `drafts.${id}`, publishedId: id };
  const result = await client.fetch(query, params);

  return result
    ? `🚨 Kanji "${value}" sudah ada di database! Hindari duplikat.`
    : true;
};

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "kanji",
  title: "Perpustakaan Kanji Global",
  type: "document",
  fields: [
    defineField({
      name: "kanjiId",
      title: "Kanji ID",
      type: "string",
      description: "Contoh: KNJ-N5-001",
      validation: (Rule) => Rule.custom(isUniqueKanjiId),
    }),
    defineField({
      name: "character",
      type: "string",
      title: "Karakter Kanji",
      validation: (Rule) => Rule.required().custom(isUniqueKanji),
    }),
    defineField({
      name: "meaning",
      type: "string",
      title: "Arti (Bahasa Indonesia)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "onyomi",
      type: "string",
      title: "Onyomi (Katakana)",
    }),
    defineField({
      name: "kunyomi",
      type: "string",
      title: "Kunyomi (Hiragana)",
    }),
    defineField({
      name: "romaji",
      type: "string",
      title: "Romaji / Cara Baca Utama",
    }),
    defineField({
      name: "examples",
      title: "Contoh Kosakata / Penggunaan",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "showInFlashcard",
      type: "boolean",
      title: "Munculkan di Flashcard?",
      description: "Matikan (OFF) jika hanya untuk referensi UI materi.",
      initialValue: true,
    }),
    defineField({
      name: "course_category",
      title: "Course Category",
      type: "reference",
      to: [{ type: "course_category" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "character",
      subtitle: "meaning",
      showInFlashcard: "showInFlashcard",
      customId: "kanjiId",
    },
    prepare({ title, subtitle, showInFlashcard, customId }) {
      const isHidden = showInFlashcard === false ? " 🚷 (Hidden)" : "";
      const displayTitle = customId
        ? `[${customId}] ${title || "Kosong"}`
        : title || "Kosong";

      return {
        title: `${displayTitle}${isHidden}`,
        subtitle: subtitle || "Arti belum diisi",
      };
    },
  },
});
