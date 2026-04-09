import { defineField, defineType } from "sanity";

export default defineType({
  name: "callout",
  title: "Callout / Info Box",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Judul (Contoh: Aturan Grammar, Pengecualian)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Tipe Visual",
      type: "string",
      options: {
        list: [
          { title: "Grammar (Cyan)", value: "grammar" },
          { title: "Info (Biru)", value: "info" },
          { title: "Warning (Kuning)", value: "warning" },
        ],
        layout: "radio",
      },
      initialValue: "grammar",
    }),
    defineField({
      name: "text",
      title: "Isi Konten",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
  ],
});
