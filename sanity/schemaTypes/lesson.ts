import { defineField, defineType } from "sanity";

export default defineType({
  name: "lesson",
  title: "Lesson Material",
  type: "document",
  groups: [
    { name: "main", title: "Info Utama", default: true },
    { name: "vocab", title: "1. Kosakata" },
    { name: "sentences", title: "2. Pola & Contoh Kalimat" },
    { name: "conversation", title: "3. Percakapan" },
    { name: "grammar", title: "4. Tata Bahasa & Kuis" },
  ],
  fields: [
    /* --- TAB: MAIN INFO --- */
    defineField({
      name: "title",
      type: "string",
      title: "Judul Bab",
      group: "main",
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "URL Slug",
      options: {
        source: "title",
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      group: "main",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      type: "reference",
      to: [{ type: "level" }],
      group: "main",
    }),
    defineField({
      name: "orderNumber",
      type: "number",
      title: "Urutan Bab",
      group: "main",
    }),
    defineField({
      name: "is_published",
      type: "boolean",
      title: "Publish Materi Ini?",
      initialValue: false,
      group: "main",
    }),
    defineField({
      name: "summary",
      type: "text",
      title: "Deskripsi Singkat Bab",
      group: "main",
    }),

    /* --- TAB: KOSAKATA --- */
    defineField({
      name: "vocabList",
      type: "array",
      title: "Daftar Kosakata Baru",
      group: "vocab",
      of: [{ type: "vocabItem" }],
    }),
    defineField({
      name: "referenceWords",
      type: "array",
      title: "Kata-kata Referensi",
      group: "vocab",
      of: [{ type: "vocabItem" }],
    }),

    /* --- TAB: POLA & CONTOH KALIMAT --- */
    defineField({
      name: "patterns",
      type: "array",
      title: "Pola Kalimat (Bunkei)",
      group: "sentences",
      of: [{ type: "exampleSentence" }],
    }),
    defineField({
      name: "examples",
      type: "array",
      title: "Contoh Kalimat (Reibun)",
      group: "sentences",
      of: [{ type: "exampleSentence" }],
    }),

    /* --- TAB: PERCAKAPAN --- */
    defineField({
      name: "conversationTitle",
      type: "string",
      title: "Judul Percakapan",
      group: "conversation",
    }),
    defineField({
      name: "conversation",
      type: "array",
      title: "Dialog Percakapan",
      group: "conversation",
      of: [{ type: "exampleSentence" }],
    }),

    /* --- TAB: TATA BAHASA & KUIS --- */
    defineField({
      name: "grammar",
      type: "array",
      title: "Keterangan Tata Bahasa",
      group: "grammar",
      of: [
        { type: "block" },
        { type: "callout" },
        { type: "kanaTable" },
        { type: "exampleSentence" },
      ],
    }),
    defineField({
      name: "quizzes",
      type: "array",
      title: "Mini Quiz di Akhir Bab",
      group: "grammar",
      of: [{ type: "quiz" }],
    }),
  ],
  preview: {
    select: {
      title: "title",
      levelName: "level.name",
      isPublished: "is_published",
    },
    prepare({ title, levelName, isPublished }) {
      return {
        title: title,
        subtitle: `${isPublished ? "✅" : "❌ Draft"} | ${levelName || "No Level"}`,
      };
    },
  },
});
