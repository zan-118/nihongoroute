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
      options: { source: "title" },
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
      title: "Publish?",
      initialValue: false,
      group: "main",
    }),
    defineField({
      name: "summary",
      type: "text",
      title: "Deskripsi Singkat",
      group: "main",
    }),

    /* --- TAB: KOSAKATA (DIUBAH MENJADI REFERENCE) --- */
    defineField({
      name: "vocabList",
      type: "array",
      title: "Daftar Kosakata Bab Ini",
      description: "Pilih kata dari Perpustakaan Kosakata Global",
      group: "vocab",
      of: [
        {
          type: "reference",
          to: [{ type: "kosakata" }],
        },
      ],
    }),
    defineField({
      name: "referenceWords",
      type: "array",
      title: "Kata-kata Referensi Ekstra",
      group: "vocab",
      of: [{ type: "reference", to: [{ type: "kosakata" }] }],
    }),

    /* --- TAB LAINNYA (TETAP SAMA) --- */
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
    defineField({
      name: "grammar",
      type: "array",
      title: "Keterangan Tata Bahasa",
      group: "grammar",
      of: [{ type: "block" }, { type: "callout" }, { type: "exampleSentence" }],
    }),
    defineField({
      name: "quizzes",
      type: "array",
      title: "Mini Quiz",
      group: "grammar",
      of: [{ type: "quiz" }],
    }),
  ],
});
