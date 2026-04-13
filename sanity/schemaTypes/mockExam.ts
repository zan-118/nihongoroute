import { defineField, defineType } from "sanity";

export default defineType({
  name: "mockExam",
  title: "Mock Exam (Tryout JLPT)",
  type: "document",
  fields: [
    defineField({
      name: "examId",
      title: "Exam ID",
      type: "string",
      description: "Contoh: EXM-N5-01",
    }),
    defineField({
      name: "title",
      title: "Judul Ujian",
      type: "string",
      description: "Contoh: Simulasi JLPT N5 (Paket 1)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "course_category",
      title: "Level (Course Category)",
      type: "reference",
      to: [{ type: "course_category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "timeLimit",
      title: "Batas Waktu (Menit)",
      type: "number",
      initialValue: 105,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "passingScore",
      title: "Nilai Kelulusan (Passing Score)",
      type: "number",
      initialValue: 80,
      description: "Minimal skor untuk lulus (contoh: 80 dari 180)",
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "questions",
      title: "Daftar Pertanyaan",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "section",
              title: "Bagian Ujian",
              type: "string",
              options: {
                list: [
                  { title: "Kosakata & Kanji (Moji/Goi)", value: "vocabulary" },
                  { title: "Tata Bahasa (Bunpou)", value: "grammar" },
                  { title: "Membaca (Dokkai)", value: "reading" },
                  { title: "Mendengar (Choukai)", value: "listening" },
                ],
              },
              validation: (Rule) => Rule.required(),
            },
            {
              name: "questionText",
              title: "Teks Pertanyaan / Konteks",
              type: "text",
              description:
                "Kosongkan jika pertanyaan sepenuhnya ada di dalam Audio/Gambar.",
            },
            {
              name: "image",
              title: "Gambar Soal (Opsional)",
              type: "image",
              options: { hotspot: true },
            },
            {
              name: "audio",
              title: "File Audio (Khusus Choukai)",
              type: "file",
              options: { accept: "audio/*" },
            },
            {
              name: "options",
              title: "Pilihan Jawaban",
              type: "array",
              of: [{ type: "string" }],
              validation: (Rule) => Rule.required().length(4),
            },
            {
              name: "correctAnswer",
              title: "Index Jawaban Benar (0-3)",
              type: "number",
              validation: (Rule) => Rule.required().min(0).max(3),
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "course_category.title",
      customId: "examId",
      systemId: "_id",
    },
    prepare({ title, subtitle, customId, systemId }) {
      const displayTitle = customId ? `[${customId}] ${title}` : title;
      return {
        title: displayTitle,
        subtitle: `SysID: ${systemId} | ${subtitle || ""}`,
      };
    },
  },
});
