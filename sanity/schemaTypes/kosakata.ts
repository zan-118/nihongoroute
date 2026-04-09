import { defineField, defineType } from "sanity";

export default defineType({
  name: "kosakata",
  title: "Flashcard Kosakata",
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
