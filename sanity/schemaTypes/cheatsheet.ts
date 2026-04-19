/**
 * @file cheatsheet.ts
 * @description Definisi skema Sanity untuk dokumen 'cheatsheet' (referensi cepat).
 * Memungkinkan penggabungan data dari database kosakata global dan item manual untuk topik khusus.
 * @module sanity/schemaTypes/cheatsheet
 */

import { defineField, defineType } from "sanity";

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "cheatsheet",
  title: "Cheatsheet (Referensi Cepat)",
  type: "document",
  fields: [
    defineField({
      name: "sheetId",
      title: "ID / Kode Sheet (Opsional)",
      type: "string",
      description:
        "Contoh: CS-N5-01 (Berguna untuk pengurutan atau pencarian spesifik).",
    }),
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
    defineField({
      name: "linkedVocab",
      title: "Tarik dari Kosakata Global",
      type: "array",
      description:
        "Gunakan ini untuk menarik kosakata yang sudah ada di database tanpa perlu mengetik ulang.",
      of: [{ type: "reference", to: [{ type: "vocab" }] }],
    }),
    defineField({
      name: "items",
      title: "Item Manual (Opsional)",
      type: "array",
      description: "Gunakan ini HANYA jika datanya bukan kosakata biasa.",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "itemId",
              title: "ID Item (Opsional)",
              type: "string",
              description: "Bisa diisi angka urut (1, 2, 3) atau kode",
            },
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
      customId: "sheetId",
      systemId: "_id",
    },
    prepare({ title, subtitle, customId, systemId }) {
      const displayTitle = customId ? `[${customId}] ${title}` : title;
      return {
        title: displayTitle,
        subtitle: `SysID: ${systemId} | ${subtitle}`,
      };
    },
  },
});
