import { SupabaseCategorySelect } from '../components/SupabaseCategorySelect';

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
      title: 'Nilai Kelulusan (%)',
      type: 'number',
      group: 'metadata',
      initialValue: 80,
      validation: (Rule: import('sanity').Rule) => Rule.required().min(0).max(100),
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
              type: 'text',
              validation: (Rule: import('sanity').Rule) => Rule.required(),
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
              title: 'Audio URL (Sanity/CDN)',
              type: 'string',
            },
            {
              name: 'imageUrl',
              title: 'Image URL (Sanity/CDN)',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
};
