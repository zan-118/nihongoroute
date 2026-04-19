/**
 * @file grammarArticle.ts
 * @description Definisi skema Sanity untuk dokumen 'grammar_article' (artikel tata bahasa).
 * Menyediakan struktur konten berbasis blok (Portable Text) untuk penjelasan tata bahasa yang mendalam.
 * @module sanity/schemaTypes/grammarArticle
 */

import { defineType, defineField } from "sanity";

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "grammar_article",
  title: "Grammar Article",
  type: "document",
  fields: [
    defineField({
      name: "grammarId",
      title: "Grammar ID",
      type: "string",
      description: "Contoh: GRM-N5-01",
    }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({
      name: "course_category",
      title: "Course Category",
      type: "reference",
      to: [{ type: "course_category" }],
    }),
    defineField({ name: "meaning", title: "Meaning / Focus", type: "string" }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }, { type: "exampleSentence" }, { type: "callout" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "meaning",
      customId: "grammarId",
      systemId: "_id",
    },
    prepare({ title, subtitle, customId, systemId }) {
      const displayTitle = customId ? `[${customId}] ${title}` : title;
      return {
        title: displayTitle,
        subtitle: `SysID: ${systemId} | ${subtitle || ""}`,
      };
    },
  },
});
