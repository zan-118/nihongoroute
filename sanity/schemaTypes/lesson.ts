import { defineType, defineField } from "sanity";

export default defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({ name: "orderNumber", title: "Order Number", type: "number" }),
    defineField({ name: "summary", title: "Summary", type: "text" }),

    // Field Lama (Pertahankan untuk sementara)
    defineField({
      name: "level",
      title: "Level (OLD)",
      type: "reference",
      to: [{ type: "level" }],
    }),

    // Field Baru
    defineField({
      name: "course_category",
      title: "Course Category (NEW)",
      type: "reference",
      to: [{ type: "course_category" }],
      description: "Pilih kategori pembelajaran untuk materi ini",
    }),

    defineField({
      name: "vocabList",
      title: "Vocab List",
      type: "array",
      of: [{ type: "reference", to: [{ type: "kosakata" }] }],
    }),
    defineField({
      name: "referenceWords",
      title: "Reference Words (Other Lessons)",
      type: "array",
      of: [{ type: "reference", to: [{ type: "kosakata" }] }],
    }),
    defineField({
      name: "grammar",
      title: "Grammar Material",
      type: "array",
      of: [{ type: "block" }, { type: "exampleSentence" }, { type: "callout" }],
    }),
    defineField({
      name: "quizzes",
      title: "Quizzes",
      type: "array",
      of: [{ type: "quiz" }],
    }),
    defineField({
      name: "is_published",
      title: "Is Published?",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "seoTitle", title: "SEO Title", type: "string" }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
    }),
  ],
});
