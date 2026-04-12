// sanity/schemaTypes/cheatsheet.ts
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
          "Keluarga & Relasi",
          "Aturan Partikel & Grammar",
          "Topik Khusus Lainnya",
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    // ✨ OPSI 1: Tarik data otomatis dari Database Kosakata Global
    defineField({
      name: "linkedVocab",
      title: "Tarik dari Kosakata Global",
      type: "array",
      description:
        "Gunakan ini untuk menarik kosakata yang sudah ada di database tanpa perlu mengetik ulang.",
      of: [
        {
          type: "reference",
          to: [{ type: "kosakata" }],
        },
      ],
    }),

    // 📝 OPSI 2: Ketik manual (Hanya untuk tabel rumus / tata bahasa)
    defineField({
      name: "items",
      title: "Item Manual (Opsional)",
      type: "array",
      description:
        "Gunakan ini HANYA jika datanya bukan kosakata biasa (misal: Aturan penggunaan Partikel WA vs GA).",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Konteks / Arti", type: "string" },
            { name: "jp", title: "Bahasa Jepang / Rumus", type: "string" },
            { name: "romaji", title: "Romaji", type: "string" },
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
