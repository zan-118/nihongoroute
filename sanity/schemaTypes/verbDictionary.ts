/**
 * @file verbDictionary.ts
 * @description Definisi skema Sanity untuk dokumen 'verb_dictionary' (kamus kata kerja).
 * Menyimpan data kata kerja beserta seluruh konjugasi teknisnya (masu, jisho, te, nai, potensial, pasif, dsb).
 * @module sanity/schemaTypes/verbDictionary
 */

import { defineField, defineType } from "sanity";

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "verb_dictionary",
  title: "Kamus Kata Kerja (Verb)",
  type: "document",
  fields: [
    // --- IDENTITAS UTAMA ---
    defineField({
      name: "verbId",
      title: "Verb ID",
      type: "string",
      description: "Contoh: VRB-G1-001",
    }),
    defineField({
      name: "masu",
      title: "Bentuk Masu (Utama)",
      type: "string",
      description: "Contoh: 食べます",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "furigana",
      title: "Furigana (Hiragana)",
      type: "string",
      description: "Cara baca dalam hiragana murni",
    }),
    defineField({
      name: "romaji",
      title: "Romaji",
      type: "string",
    }),
    defineField({
      name: "jisho",
      title: "Bentuk Kamus (Jisho-kei)",
      type: "string",
      description: "Teks biru di bawah judul (Contoh: 食べる)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "meaning",
      title: "Arti (Bahasa Indonesia)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "group",
      title: "Golongan (Group)",
      type: "number",
      options: { list: [1, 2, 3] },
      validation: (Rule) => Rule.required().min(1).max(3),
    }),
    defineField({
      name: "lesson",
      title: "Bab (Lesson)",
      type: "string",
    }),
    defineField({
      name: "course_category",
      title: "Course Category (Level)",
      type: "reference",
      to: [{ type: "course_category" }],
      description: "Pilih level untuk memunculkan kata kerja ini di Flashcard",
    }),
    defineField({
      name: "showInFlashcard",
      type: "boolean",
      title: "Munculkan di Flashcard?",
      initialValue: true,
    }),

    // --- KONJUGASI DASAR ---
    defineField({
      name: "te",
      title: "Bentuk ~Te",
      type: "string",
      description: "Contoh: 食べて",
    }),
    defineField({
      name: "nai",
      title: "Bentuk ~Nai",
      type: "string",
      description: "Contoh: 食べない",
    }),
    defineField({
      name: "ta",
      title: "Bentuk ~Ta",
      type: "string",
      description: "Contoh: 食べた",
    }),

    // --- KONJUGASI LANJUTAN ---
    defineField({
      name: "tai",
      title: "Bentuk ~Tai (Keinginan)",
      type: "string",
    }),
    defineField({
      name: "kanou",
      title: "Bentuk Kanou (Potensial)",
      type: "string",
    }),
    defineField({
      name: "shieki",
      title: "Bentuk Shieki (Kausatif)",
      type: "string",
    }),
    defineField({
      name: "ukemi",
      title: "Bentuk Ukemi (Pasif)",
      type: "string",
    }),
    defineField({
      name: "katei",
      title: "Bentuk Katei (Pengandaian)",
      type: "string",
    }),
    defineField({
      name: "ikou",
      title: "Bentuk Ikou (Volitional)",
      type: "string",
    }),
    defineField({
      name: "meirei",
      title: "Bentuk Meirei (Perintah)",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "masu",
      subtitle: "meaning",
      group: "group",
      customId: "verbId",
      systemId: "_id",
    },
    prepare({ title, subtitle, group, customId, systemId }) {
      const displayTitle = customId ? `[${customId}] ${title}` : title;
      return {
        title: displayTitle,
        subtitle: `SysID: ${systemId} | ${subtitle} (Gol. ${group})`,
      };
    },
  },
});
