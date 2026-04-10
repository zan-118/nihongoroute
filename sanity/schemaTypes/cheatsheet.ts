import { defineField, defineType } from "sanity";

export default defineType({
  name: "cheatsheet",
  title: "Cheatsheet (Referensi Cepat)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Cheatsheet",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategori",
      type: "string",
      options: {
        list: [
          "Angka & Matematika",
          "Waktu & Tanggal",
          "Kata Bantu Bilangan (Counter)",
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "items",
      title: "Daftar Kosakata / Item",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label / Angka / Arti", type: "string" },
            { name: "jp", title: "Bahasa Jepang (Kana/Kanji)", type: "string" },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "category",
    },
  },
});
