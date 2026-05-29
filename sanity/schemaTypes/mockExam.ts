/**
 * @file mockExam.ts
 * @description Skema dokumen Sanity Studio untuk Simulasi Ujian (Mock Exam). Mengonfigurasi batas waktu ujian, batas kelulusan, penyesuaian sertifikat, choukai audio global, dan array pertanyaan tes komprehensif.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { SupabaseCategorySelect } from '../components/SupabaseCategorySelect';

// ==========================================
// DEFINISI SKEMA DOKUMEN SANITY CMS
// ==========================================
export default {
  name: 'mockExam',
  title: 'Simulasi Ujian (Mock Exam)',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Kumpulan Soal', default: true },
    { name: 'metadata', title: '⚙️ Konfigurasi Ujian' },
  ],
  fields: [
    // ─── METADATA GROUP ───
    {
      name: 'title',
      title: 'Judul Ujian',
      type: 'string',
      group: 'metadata',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'metadata',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Deskripsi',
      type: 'text',
      group: 'metadata',
    },
    {
      name: 'category_id',
      title: 'Kategori Kursus (Supabase)',
      description: 'Pilih kategori kursus yang dihubungkan langsung dari Supabase.',
      type: 'string',
      group: 'metadata',
      components: {
        input: SupabaseCategorySelect
      }
    },
    {
      name: 'time_limit',
      title: 'Batas Waktu (Menit)',
      type: 'number',
      group: 'metadata',
      initialValue: 60,
      validation: (Rule: import('sanity').Rule) => Rule.required().min(1),
    },
    {
      name: 'passing_score',
      title: 'Skor Kelulusan (Skor Riil)',
      description: 'Skor minimal untuk lulus. Misal: 80-100 untuk JLPT (Skor total 180), atau 200 untuk JFT-Basic (Skor total 250).',
      type: 'number',
      group: 'metadata',
      initialValue: 90,
      validation: (Rule: import('sanity').Rule) => Rule.required().min(0).max(250),
    },
    {
      name: 'levelCode',
      title: 'Kode Level (JLPT / CEFR)',
      description: 'Pilih tingkat level ujian ini untuk penyesuaian sertifikat dan visualisasi.',
      type: 'string',
      group: 'metadata',
      options: {
        list: [
          { title: 'N5 (JLPT)', value: 'n5' },
          { title: 'N4 (JLPT)', value: 'n4' },
          { title: 'N3 (JLPT)', value: 'n3' },
          { title: 'N2 (JLPT)', value: 'n2' },
          { title: 'N1 (JLPT)', value: 'n1' },
          { title: 'A2 (JFT-Basic)', value: 'a2' },
        ],
      },
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'choukaiAudio',
      title: 'Audio Menyimak Global (Chōkai)',
      description: 'File audio tunggal untuk seluruh seksi Chōkai (khusus ujian JLPT N1-N5).',
      type: 'file',
      group: 'metadata',
    },
    {
      name: 'is_published',
      title: 'Sudah Diterbitkan (Published)?',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    },

    // ─── CONTENT GROUP ───
    {
      name: 'questions',
      title: 'Kumpulan Pertanyaan (Questions)',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'examQuestion',
          title: 'Soal Ujian',
          fields: [
            {
              name: 'questionText',
              title: 'Pertanyaan',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [
                    { title: 'Normal', value: 'normal' },
                  ],
                  lists: [],
                  marks: {
                    decorators: [
                      { title: 'Tebal (Bold)', value: 'strong' },
                      { title: 'Miring (Italic)', value: 'em' },
                      { title: 'Garis Bawah (Underline)', value: 'underline' },
                      { title: 'Coret (Strikethrough)', value: 'strike-through' }
                    ]
                  }
                }
              ]
            },
            {
              name: 'options',
              title: 'Pilihan Jawaban',
              type: 'array',
              of: [{ type: 'string' }],
              validation: (Rule: import('sanity').Rule) => Rule.required().min(2),
            },
            {
              name: 'correctAnswer',
              title: 'Indeks Jawaban Benar (0-indexed)',
              description: 'Misal pilihan ke-1 adalah 0, pilihan ke-2 adalah 1, dst.',
              type: 'number',
              validation: (Rule: import('sanity').Rule) => Rule.required().min(0),
            },
            {
              name: 'section',
              title: 'Kategori Soal (Section)',
              type: 'string',
              options: {
                list: [
                  { title: 'Kosakata (Vocabulary)', value: 'vocabulary' },
                  { title: 'Tata Bahasa (Grammar)', value: 'grammar' },
                  { title: 'Membaca (Reading)', value: 'reading' },
                  { title: 'Menyimak (Listening)', value: 'listening' },
                ],
              },
              validation: (Rule: import('sanity').Rule) => Rule.required(),
            },
            {
              name: 'audioUrl',
              title: 'Audio (Media Library)',
              type: 'file',
            },
            {
              name: 'imageUrl',
              title: 'Image (Media Library)',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
          ],
        },
      ],
    },
  ],
};
