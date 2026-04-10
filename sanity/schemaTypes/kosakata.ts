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
    select: { title: "word", subtitle: "meaning", levelCode: "level.code" },
    prepare({ title, subtitle, levelCode }) {
      return {
        title: title || "Kosong",
        subtitle: `${levelCode ? `[${levelCode.toUpperCase()}] ` : ""}${subtitle || ""}`,
      };
    },
  },
});
