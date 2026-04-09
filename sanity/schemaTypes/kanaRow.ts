import { defineField, defineType } from "sanity";

export default defineType({
  name: "kanaRow",
  title: "Kana Row",
  type: "object",
  fields: [
    defineField({
      name: "rowLabel",
      type: "string",
      title: "Nama Baris (Contoh: A-Row, K-Row)",
    }),
    defineField({
      name: "characters",
      title: "Karakter (A, I, U, E, O)",
      type: "array",
      of: [{ type: "kanaCharacter" }],
      validation: (rule) => rule.max(5),
    }),
  ],
});
