import { defineType } from "sanity";

export default defineType({
  name: "lesson",
  title: "Lesson Material",
  type: "document",
  fields: [
    { name: "title", type: "string" },
    { name: "slug", type: "slug", options: { source: "title" } },
    {
      name: "content",
      type: "array",
      of: [{ type: "block" }, { type: "image" }],
    },
    { name: "level", type: "reference", to: [{ type: "level" }] },
    // Fitur Batch: Menghubungkan banyak flashcard ke materi ini
    {
      name: "vocabulary",
      type: "array",
      title: "Vocabulary List",
      of: [{ type: "reference", to: [{ type: "flashcard" }] }],
    },
  ],
});
