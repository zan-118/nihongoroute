import { defineType, defineField } from "sanity";

export default defineType({
  name: "course_category",
  title: "Course Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Contoh: JLPT N5, Japanese for Travel, Business Japanese",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Category Type",
      type: "string",
      options: {
        list: [
          { title: "JLPT Curriculum", value: "jlpt" },
          { title: "General Topics", value: "general" },
          { title: "Simulations / Exams", value: "exam" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "type",
    },
  },
});
