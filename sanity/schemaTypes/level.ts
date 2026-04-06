import { defineField, defineType } from "sanity";

export default defineType({
  name: "level",
  title: "Level (JLPT)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Level Name",
      type: "string",
      description: "Contoh: N5, N4, N3",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "code",
      title: "Level Code",
      type: "string",
      description: "Gunakan huruf kecil, contoh: n5",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "number",
      description: "Urutan level (1 untuk N5, 2 untuk N4, dst)",
      validation: (rule) => rule.required(),
    }),
  ],
});
