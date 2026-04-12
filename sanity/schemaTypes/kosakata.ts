import { defineField, defineType } from "sanity";

export default defineType({
  name: "kosakata",
  title: "Perpustakaan Kosakata Global",
  type: "document",
  fields: [
    defineField({
      name: "word",
      type: "string",
      title: "Kata (Kanji/Kana)",
      validation: (Rule) => Rule.required(),
    }),

    // ✨ FITUR BARU: Kategori Jenis Kata (Part of Speech)
    defineField({
      name: "category",
      type: "string",
      title: "Jenis Kata",
      options: {
        list: [
          { title: "Kata Benda (Noun)", value: "noun" },
          { title: "Kata Sifat (I-Adj / Na-Adj)", value: "adjective" },
          { title: "Kata Keterangan (Adverb)", value: "adverb" },
          { title: "Partikel (Particle)", value: "particle" },
          { title: "Ungkapan (Expression)", value: "expression" },
          { title: "Kanji Power (Khusus Mode Kanji)", value: "kanji" },
        ],
      },
      initialValue: "noun",
      validation: (Rule) => Rule.required(),
    }),

    // ✨ FITUR BARU: Kontrol Tampilan Flashcard
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
      name: "kanjiDetails",
      type: "object",
      title: "Detail Kanji",
      hidden: ({ document }) => document?.category !== "kanji",
      fields: [
        { name: "onyomi", type: "string", title: "Onyomi (Katakana)" },
        { name: "kunyomi", type: "string", title: "Kunyomi (Hiragana)" },
      ],
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
      category: "category",
      showInFlashcard: "showInFlashcard",
    },
    prepare({ title, subtitle, category, showInFlashcard }) {
      const isHidden = showInFlashcard === false ? " 🚷 (Hidden)" : "";
      return {
        title: `${title || "Kosong"}${isHidden}`,
        subtitle: `[${category?.toUpperCase()}] ${subtitle || ""}`,
      };
    },
  },
});
