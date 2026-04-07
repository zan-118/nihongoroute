import { defineType } from "sanity";

export default defineType({
  name: "flashcard",
  title: "Flashcard Pro",
  type: "document",
  fields: [
    { name: "word", type: "string", title: "Kanji / Word" },
    { name: "romaji", type: "string", title: "Romaji" },
    { name: "meaning", type: "string", title: "Meaning (ID)" },
    {
      name: "details",
      type: "object",
      title: "Kanji Details",
      fields: [
        { name: "onyomi", type: "string", title: "Onyomi (Katakana)" },
        { name: "kunyomi", type: "string", title: "Kunyomi (Hiragana)" },
      ],
    },
    {
      name: "examples",
      type: "array",
      title: "Example Sentences",
      of: [
        {
          type: "object",
          fields: [
            { name: "jp", type: "string", title: "Japanese" },
            { name: "furigana", type: "string", title: "Furigana" },
            { name: "id", type: "string", title: "Translation" },
          ],
        },
      ],
    },
    { name: "level", type: "reference", to: [{ type: "level" }] },
  ],
});
