import { defineField, defineType } from "sanity";

export default defineType({
  name: "vocabItem",
  title: "Vocabulary Item",
  type: "object",
  fields: [
    defineField({
      name: "jp",
      type: "string",
      title: "Jepang (Kanji/Kana)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "romaji",
      type: "string",
      title: "Cara Baca (Romaji/Furigana)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "id",
      type: "string",
      title: "Arti (Indonesia)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "info",
      type: "string",
      title: "Keterangan (Opsional)",
    }),
  ],
});
