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
    // ✨ Tambahkan field ini agar peringatan "Unknown Field" hilang ✨
    defineField({
      name: "category",
      type: "string",
      title: "Kategori",
      description: "Pilih apakah ini kosakata biasa atau data Kanji khusus",
      options: {
        list: [
          { title: "Vocab / Kosakata Biasa", value: "vocab" },
          { title: "Kanji Power", value: "kanji" },
        ],
      },
      initialValue: "vocab", // Default untuk data baru adalah kosakata biasa
      validation: (Rule) => Rule.required(),
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
      name: "audio",
      type: "file",
      title: "Audio Pengucapan (Opsional)",
      options: { accept: "audio/*" },
    }),
    defineField({
      name: "kanjiDetails",
      type: "object",
      title: "Detail Kanji (Onyomi/Kunyomi)",
      // Hidden jika kategorinya bukan kanji agar Studio lebih bersih
      hidden: ({ document }) => document?.category !== "kanji",
      fields: [
        { name: "onyomi", type: "string", title: "Onyomi (Katakana)" },
        { name: "kunyomi", type: "string", title: "Kunyomi (Hiragana)" },
      ],
    }),
    defineField({
      name: "examples",
      type: "array",
      title: "Contoh Kalimat Spesifik Kata Ini",
      of: [{ type: "exampleSentence" }],
    }),
    defineField({
      name: "level",
      type: "reference",
      to: [{ type: "level" }],
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "word",
      subtitle: "meaning",
      levelCode: "level.code",
      category: "category",
    },
    prepare({ title, subtitle, levelCode, category }) {
      const catEmoji = category === "kanji" ? "🏮" : "📝";
      return {
        title: `${catEmoji} ${title || "Kosong"}`,
        subtitle: `${levelCode ? `[${levelCode.toUpperCase()}] ` : ""}${subtitle || ""}`,
      };
    },
  },
});
