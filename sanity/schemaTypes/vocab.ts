/**
 * @file vocab.ts
 * @description Definisi skema Sanity untuk dokumen 'vocab' (kosakata).
 * Mencakup logika validasi keunikan ID dan kata Jepang.
 * @module sanity/schemaTypes/vocab
 */

import { defineField, defineType, type ValidationContext } from "sanity";

// ======================
// VALIDATION LOGIC
// ======================

/**
 * Memastikan Vocab ID bersifat unik di seluruh dataset.
 */
const isUniqueVocabId = async (value: string | undefined, context: ValidationContext) => {
  if (!value) return true;
  const { document, getClient } = context;
  if (!document) return true;
  const client = getClient({ apiVersion: "2024-04-12" });
  const id = document._id.replace(/^drafts\./, "");

  const query = `*[_type == "vocab" && vocabId == $value && _id != $draftId && _id != $publishedId][0]`;
  const params = { value, draftId: `drafts.${id}`, publishedId: id };
  const result = await client.fetch(query, params);

  return result
    ? `🚨 Vocab ID "${value}" sudah dipakai! Gunakan ID lain.`
    : true;
};

/**
 * Memastikan kata Jepang (word) tidak duplikat untuk menjaga integritas data.
 */
const isUniqueWord = async (value: string | undefined, context: ValidationContext) => {
  if (!value) return true;
  const { document, getClient } = context;
  if (!document) return true;
  const client = getClient({ apiVersion: "2024-04-12" });
  const id = document._id.replace(/^drafts\./, "");

  const query = `*[_type == "vocab" && word == $value && _id != $draftId && _id != $publishedId][0]`;
  const params = { value, draftId: `drafts.${id}`, publishedId: id };
  const result = await client.fetch(query, params);

  return result
    ? `🚨 Kata "${value}" sudah ada di database! Hindari duplikat.`
    : true;
};

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "vocab",
  title: "Perpustakaan Kosakata Global",
  type: "document",
  fields: [
    defineField({
      name: "vocabId",
      title: "Vocab ID",
      type: "string",
      description: "Contoh: VOC-N5-001",
      validation: (Rule) => Rule.custom(isUniqueVocabId),
    }),
    defineField({
      name: "word",
      type: "string",
      title: "Kata (Kanji/Kana)",
      validation: (Rule) => Rule.required().custom(isUniqueWord),
    }),
    defineField({
      name: "hinshi",
      type: "string",
      title: "Hinshi (Kelas Kata / Part of Speech)",
      options: {
        list: [
          { title: "Meishi (Kata Benda)", value: "noun" },
          { title: "I-Keiyoushi (Kata Sifat-I)", value: "i-adjective" },
          { title: "Na-Keiyoushi (Kata Sifat-Na)", value: "na-adjective" },
          { title: "Fukushi (Kata Keterangan)", value: "adverb" },
          { title: "Joshi (Partikel)", value: "particle" },
          { title: "Setsuzokushi (Kata Sambung)", value: "conjunction" },
          { title: "Daimeishi (Kata Ganti)", value: "pronoun" },
          { title: "Hyougen (Ungkapan / Frasa)", value: "expression" },
        ],
      },
      initialValue: "noun",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "showInFlashcard",
      type: "boolean",
      title: "Munculkan di Flashcard (Vocab Drill)?",
      description:
        "Matikan (OFF) jika kata ini hanya untuk referensi Cheatsheet / UI materi.",
      initialValue: true,
    }),
    defineField({
      name: "furigana",
      type: "string",
      title: "Cara Baca (Furigana)",
    }),
    defineField({
      name: "romaji",
      type: "string",
      title: "Romaji",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "meaning",
      type: "string",
      title: "Arti (Bahasa Indonesia)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "course_category",
      title: "Course Category",
      type: "reference",
      to: [{ type: "course_category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "audio",
      type: "file",
      title: "Audio Pengucapan (Opsional)",
      options: { accept: "audio/*" },
    }),
  ],
  preview: {
    select: {
      title: "word",
      subtitle: "meaning",
      hinshi: "hinshi",
      showInFlashcard: "showInFlashcard",
      customId: "vocabId",
      systemId: "_id",
    },
    prepare({ title, subtitle, hinshi, showInFlashcard, customId, systemId }) {
      const isHidden = showInFlashcard === false ? " 🚷 (Hidden)" : "";
      const displayTitle = customId
        ? `[${customId}] ${title || "Kosong"}`
        : title || "Kosong";

      return {
        title: `${displayTitle}${isHidden}`,
        subtitle: `SysID: ${systemId} | [${hinshi?.toUpperCase() || "UNKNOWN"}] ${subtitle || ""}`,
      };
    },
  },
});
