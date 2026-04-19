/**
 * @file quiz.ts
 * @description Definisi skema Sanity untuk objek 'quiz' (pertanyaan kuis).
 * Digunakan sebagai komponen evaluasi interaktif dalam dokumen materi (lesson).
 * @module sanity/schemaTypes/quiz
 */

import { defineField, defineType } from "sanity";

// ======================
// SCHEMA DEFINITION
// ======================

export default defineType({
  name: "quiz",
  title: "Quiz",
  type: "object",
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "options",
      title: "Answer Options",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "text", title: "Option Text", type: "string" },
            {
              name: "isCorrect",
              title: "Is Correct?",
              type: "boolean",
              initialValue: false,
            },
          ],
        },
      ],
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: "explanation",
      title: "Explanation (Optional)",
      type: "text",
      description: "Penjelasan jika user menjawab salah",
    }),
  ],
});
