// sanity/schemaTypes/mockExam.ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "mockExam",
  title: "Mock Exam (Tryout JLPT)",
  type: "document",
  fields: [
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
      initialValue: 105, // Waktu standar N5 (25 menit Moji/Goi + 50 menit Bunpou/Dokkai + 30 menit Choukai)
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "passingScore",
      title: "Nilai Kelulusan (Passing Score)",
      type: "number",
      initialValue: 80, // Standar kelulusan N5
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
                  { title: "Mendengar (Choukai)", value: "listening" }, // ✨ Opsi Choukai ditambahkan
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
            // ✨ FIELD BARU: GAMBAR
            {
              name: "image",
              title: "Gambar Soal (Opsional)",
              type: "image",
              description:
                "Upload gambar ilustrasi untuk soal Dokkai atau Choukai.",
              options: { hotspot: true },
            },
            // ✨ FIELD BARU: AUDIO
            {
              name: "audio",
              title: "File Audio (Khusus Choukai)",
              type: "file",
              options: { accept: "audio/*" },
              description: "Upload file MP3/WAV untuk soal Listening.",
            },
            {
              name: "options",
              title: "Pilihan Jawaban",
              type: "array",
              of: [{ type: "string" }],
              description:
                "Masukkan 4 pilihan jawaban (Bisa berupa angka 1, 2, 3, 4 jika teks ada di gambar).",
              validation: (Rule) => Rule.required().length(4),
            },
            {
              name: "correctAnswer",
              title: "Index Jawaban Benar (0-3)",
              type: "number",
              description:
                "0 = Pilihan ke-1, 1 = Pilihan ke-2, 2 = Pilihan ke-3, 3 = Pilihan ke-4",
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
    },
  },
});
