/**
 * @file level.ts
 * @description Definisi skema Sanity untuk dokumen 'level' (tingkat kecakapan JLPT).
 * Mengatur metadata dasar untuk kategori level seperti N5, N4, dst.
 * @module sanity/schemaTypes/level
 */

import { defineField, defineType } from "sanity";

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "level",
  title: "JLPT Level",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Level Name (N5, N4...)",
    }),
    defineField({
      name: "code",
      type: "string",
      title: "Code (n5, n4...)",
      description: "Berfungsi sebagai ID unik untuk level ini.",
    }),
  ],
  preview: {
    select: {
      title: "name",
      customId: "code",
      systemId: "_id",
    },
    prepare({ title, customId, systemId }) {
      const displayTitle = customId
        ? `[${customId.toUpperCase()}] ${title}`
        : title;
      return {
        title: displayTitle,
        subtitle: `SysID: ${systemId}`,
      };
    },
  },
});
