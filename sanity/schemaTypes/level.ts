import { defineField, defineType } from "sanity";

export default defineType({
  name: "level",
  title: "JLPT Level",
  type: "document",
  fields: [
    defineField({
      name: "name",
      type: "string",
      title: "Level Name (N5, N4...)",
    }),
    defineField({ name: "code", type: "string", title: "Code (n5, n4...)" }),
  ],
});
