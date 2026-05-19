import { FuriganaGeneratorInput } from '../components/FuriganaGeneratorInput';

export default {
  name: 'readingMaterial',
  title: 'Materi Bacaan (Reading)',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Konten Bacaan', default: true },
    { name: 'metadata', title: '⚙️ Metadata & Level' },
    { name: 'seo', title: '🔍 Optimasi SEO' },
  ],
  fields: [
    // ─── METADATA GROUP ───
    {
      name: 'title',
      title: 'Judul',
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
      name: 'jlpt_level',
      title: 'JLPT Level',
      type: 'string',
      group: 'metadata',
      options: {
        list: [
          { title: 'N5', value: 'N5' },
          { title: 'N4', value: 'N4' },
          { title: 'N3', value: 'N3' },
          { title: 'N2', value: 'N2' },
          { title: 'N1', value: 'N1' },
        ],
      },
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'difficulty',
      title: 'Kesulitan (Difficulty)',
      type: 'string',
      group: 'metadata',
    },
    {
      name: 'estimated_minutes',
      title: 'Estimasi Waktu Baca (Menit)',
      type: 'number',
      group: 'metadata',
      initialValue: 5,
    },

    // ─── CONTENT GROUP ───
    {
      name: 'body',
      title: 'Konten / Teks Utama (Kanji/Kana)',
      type: 'text',
      group: 'content',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'hiragana',
      title: 'Furigana / Hiragana Full (Opsional)',
      type: 'text',
      group: 'content',
      components: {
        input: FuriganaGeneratorInput
      }
    },
    {
      name: 'translation',
      title: 'Terjemahan Bahasa Indonesia',
      type: 'text',
      group: 'content',
    },
    {
      name: 'audio_url',
      title: 'Audio (Media Library)',
      type: 'file',
      group: 'content',
    },
    {
      name: 'image_url',
      title: 'Image (Media Library)',
      type: 'image',
      group: 'content',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'video_url',
      title: 'Video (Media Library)',
      type: 'file',
      group: 'content',
    },
    {
      name: 'quizzes',
      title: 'Kuis Evaluasi Terkait (Quizzes)',
      description: 'Pertanyaan evaluasi opsional khusus materi bacaan ini',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'readingQuiz',
          title: 'Soal Kuis Bacaan',
          fields: [
            {
              name: 'id',
              title: 'Unique Quiz ID',
              type: 'string',
              validation: (Rule: import('sanity').Rule) => Rule.required(),
            },
            {
              name: 'question',
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
              name: 'correct_answer',
              title: 'Jawaban Benar (Ketik teks jawabannya persis)',
              type: 'string',
              validation: (Rule: import('sanity').Rule) => Rule.required(),
            },
            {
              name: 'explanation',
              title: 'Penjelasan Jawaban',
              type: 'text',
            },
            {
              name: 'audio_url',
              title: 'Audio (Media Library)',
              type: 'file',
            },
            {
              name: 'image_url',
              title: 'Image (Media Library)',
              type: 'image',
              options: {
                hotspot: true,
              },
            },
            {
              name: 'type',
              title: 'Jenis Kuis',
              type: 'string',
              options: {
                list: [
                  { title: 'Pilihan Ganda (Multiple Choice)', value: 'multiple-choice' },
                  { title: 'Benar / Salah (True or False)', value: 'true-false' },
                  { title: 'Isian Rumpang (Fill in the Blank)', value: 'fill-in-the-blank' },
                ],
              },
              validation: (Rule: import('sanity').Rule) => Rule.required(),
            },
          ],
        },
      ],
    },

    // ─── SEO GROUP ───
    {
      name: 'seo',
      title: 'SEO Metadata',
      type: 'object',
      group: 'seo',
      fields: [
        { name: 'title', title: 'SEO Title', type: 'string' },
        { name: 'description', title: 'SEO Description', type: 'text' },
        { name: 'keywords', title: 'Keywords (pisahkan dengan koma)', type: 'string' },
      ],
    },
  ],
};
