import { defineType, defineField } from "sanity";

export default defineType({
  name: "grammar_article",
  title: "Grammar Article",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),

    // Field Baru
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
});
