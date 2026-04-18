import { defineType, defineField } from "sanity";

export default defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "lessonId",
      title: "Lesson ID",
      type: "string",
      description: "Contoh: LSN-N5-01",
    }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({ name: "orderNumber", title: "Order Number", type: "number" }),
    defineField({ name: "summary", title: "Summary", type: "text" }),
    defineField({
      name: "course_category",
      title: "Course Category",
      type: "reference",
      to: [{ type: "course_category" }],
    }),
    defineField({
      name: "vocabList",
      title: "Vocab List",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "vocab" }, { type: "verb_dictionary" }],
        },
      ],
    }),
    defineField({
      name: "referenceWords",
      title: "Reference Words",
      type: "array",
      of: [{ type: "reference", to: [{ type: "vocab" }] }],
    }),
    defineField({
      name: "articles",
      title: "Articles",
      type: "array",
      of: [{ type: "block" }, { type: "exampleSentence" }, { type: "callout" }],
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
  preview: {
    select: {
      title: "title",
      subtitle: "summary",
      customId: "lessonId",
      systemId: "_id",
    },
    prepare({ title, subtitle, customId, systemId }) {
      const displayTitle = customId ? `[${customId}] ${title}` : title;
      return {
        title: displayTitle,
        subtitle: `SysID: ${systemId} | ${subtitle || "No summary"}`,
      };
    },
  },
});
