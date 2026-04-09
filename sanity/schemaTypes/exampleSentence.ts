import { defineField, defineType } from "sanity";

export default defineType({
  name: "exampleSentence",
  title: "Contoh Kalimat (Audio)",
  type: "object",
  fields: [
    defineField({
      name: "jp",
      type: "string",
      title: "Bahasa Jepang (Kanji/Kana)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "furigana",
      type: "string",
      title: "Cara Baca (Furigana / Romaji)",
    }),
    defineField({
      name: "id",
      type: "string",
      title: "Arti (Bahasa Indonesia)",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
