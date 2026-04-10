import { defineField, defineType } from "sanity";

export default defineType({
  name: "grammar_article",
  title: "Artikel Tata Bahasa (Grammar)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Judul Artikel",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "content",
      title: "Isi Artikel",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "object",
          name: "exampleSentence",
          title: "Contoh Kalimat",
          fields: [
            { name: "jp", type: "string", title: "Bahasa Jepang" },
            { name: "id", type: "string", title: "Arti Bahasa Indonesia" },
          ],
        },
      ],
    }),
  ],
});
