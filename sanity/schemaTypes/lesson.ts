import { defineField, defineType } from "sanity";

export default defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "level",
      title: "JLPT Level",
      type: "reference",
      to: [{ type: "level" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Grammar", value: "grammar" },
          { title: "Vocabulary", value: "vocab" },
          { title: "Kanji", value: "kanji" },
          { title: "Reading", value: "reading" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "number",
      description: "Urutan materi dalam satu level",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
          marks: {
            annotations: [
              // Tambahan Annotation untuk Furigana
              {
                name: "furigana",
                type: "object",
                title: "Furigana",
                fields: [
                  {
                    name: "reading",
                    type: "string",
                    title: "Cara Baca (Hiragana)",
                  },
                ],
              },
            ],
          },
        },
        { type: "image" },
        // Tambahan Object untuk Callout / Info Box
        {
          name: "callout",
          type: "object",
          title: "Callout Info",
          fields: [
            {
              name: "title",
              type: "string",
              title: "Judul (Contoh: Rumus, Perhatian)",
            },
            { name: "text", type: "text", title: "Isi Teks" },
            {
              name: "type",
              type: "string",
              options: {
                list: [
                  { title: "Grammar (Cyan)", value: "grammar" },
                  { title: "Info (Blue)", value: "info" },
                  { title: "Warning (Yellow)", value: "warning" },
                ],
              },
              initialValue: "grammar",
            },
          ],
        },
        { type: "kanaTable" },
      ],
    }),
    defineField({
      name: "quizzes",
      title: "Lesson Quizzes",
      type: "array",
      of: [{ type: "quiz" }], // Memanggil object quiz yang kita buat tadi
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      group: "seo",
    }),
    defineField({
      name: "seoDescription",
      title: "SEO Description",
      type: "text",
      group: "seo",
    }),
  ],
  groups: [
    {
      name: "seo",
      title: "SEO Settings",
    },
  ],
});
