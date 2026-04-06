import { defineField, defineType } from "sanity";

export default defineType({
  name: "flashcard",
  title: "Flashcard",
  type: "document",
  fields: [
    defineField({
      name: "level",
      title: "JLPT Level",
      type: "reference",
      to: [{ type: "level" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "word",
      title: "Word / Kanji",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "romaji",
      title: "Romaji (Cara Baca)",
      type: "string",
    }),
    defineField({
      name: "meaning",
      title: "Meaning (Arti)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Vocabulary", value: "vocab" },
          { title: "Kanji", value: "kanji" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
  ],
});
