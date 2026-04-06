import { defineField, defineType } from "sanity";

export default defineType({
  name: "kanaCharacter",
  title: "Kana Character",
  type: "object",
  fields: [
    defineField({
      name: "kana",
      type: "string",
      title: "Huruf (Contoh: あ)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "romaji",
      type: "string",
      title: "Romaji (Contoh: a)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "example",
      type: "string",
      title: "Contoh Kata (Contoh: あさ - Pagi)",
    }),
  ],
});
