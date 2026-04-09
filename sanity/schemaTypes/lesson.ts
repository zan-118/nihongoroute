import { defineField, defineType } from "sanity";

export default defineType({
  name: "lesson",
  title: "Lesson Material",
  type: "document",
  groups: [
    { name: "main", title: "Main Info", default: true },
    { name: "content", title: "Content & Quiz" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    /* --- TAB: MAIN INFO --- */
    defineField({
      name: "title",
      type: "string",
      title: "Judul Materi",
      group: "main",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "URL Slug",
      options: {
        source: "title",
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      type: "reference",
      to: [{ type: "level" }],
      group: "main",
    }),
    // FIELD BARU: CATEGORY
    defineField({
      name: "category",
      type: "string",
      title: "Kategori Materi",
      options: {
        list: [
          { title: "📖 Tata Bahasa (Grammar)", value: "grammar" },
          { title: "📝 Kosakata (Vocabulary)", value: "vocabulary" },
          { title: "🎯 Latihan (Practice)", value: "practice" },
          { title: "📚 Membaca (Reading)", value: "reading" },
        ],
      },
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "orderNumber",
      type: "number",
      title: "Urutan Materi",
      description:
        "Urutan di dalam kategorinya masing-masing (Contoh: 1, 2, 3)",
      group: "main",
    }),
    defineField({
      name: "is_published",
      type: "boolean",
      title: "Publish Materi Ini?",
      initialValue: false,
      group: "main",
    }),
    defineField({
      name: "summary",
      type: "text",
      title: "Deskripsi Singkat / Summary",
      description: "Muncul di kartu materi.",
      group: "main",
    }),

    /* --- TAB: CONTENT & QUIZ --- */
    defineField({
      name: "content",
      type: "array",
      title: "Artikel Materi",
      group: "content",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
        { type: "callout" },
        { type: "kanaTable" },
        { type: "exampleSentence" },
      ],
    }),
    defineField({
      name: "quizzes",
      type: "array",
      title: "Mini Quiz di Akhir Materi",
      group: "content",
      of: [{ type: "quiz" }],
    }),
    defineField({
      name: "vocabulary",
      type: "array",
      title: "Kosakata Terkait (Opsional)",
      group: "content",
      of: [{ type: "reference", to: [{ type: "flashcard" }] }],
    }),

    /* --- TAB: SEO --- */
    defineField({
      name: "seoTitle",
      type: "string",
      title: "SEO Title",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      type: "text",
      title: "SEO Description",
      group: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title",
      category: "category",
      levelName: "level.name",
      isPublished: "is_published",
    },
    prepare({ title, category, levelName, isPublished }) {
      const catLabel = category ? category.toUpperCase() : "NO CAT";
      return {
        title: title,
        subtitle: `${isPublished ? "✅" : "❌ Draft"} | [${catLabel}] ${levelName || "No Level"}`,
      };
    },
  },
});
