import { defineType } from "sanity";

export default defineType({
  name: "level",
  title: "JLPT Level",
  type: "document",
  fields: [
    { name: "name", type: "string", title: "Level Name (N5, N4...)" },
    { name: "code", type: "string", title: "Code (n5, n4...)" },
  ],
});
