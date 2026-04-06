import { defineField, defineType } from "sanity";

export default defineType({
  name: "kanaTable",
  title: "Interactive Kana Table",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Judul (Misal: Tabel Hiragana Dasar)",
    }),
    defineField({
      name: "kanaType",
      type: "string",
      title: "Tipe Huruf",
      options: {
        list: [
          { title: "Hiragana", value: "hiragana" },
          { title: "Katakana", value: "katakana" },
        ],
      },
      initialValue: "hiragana",
    }),
    defineField({
      name: "rows",
      title: "Daftar Baris",
      type: "array",
      of: [{ type: "kanaRow" }],
    }),
  ],
});
