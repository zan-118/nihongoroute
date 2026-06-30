/**
 * @file listeningMaterial.ts
 * @description Skema dokumen Sanity Studio untuk Materi Menyimak (Listening). Menyediakan field transkrip audio, auto-generator Furigana, video/audio CDN, kuis evaluasi khusus choukai, dan metadata tingkat kesulitan.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { FuriganaGeneratorInput } from '../components/FuriganaGeneratorInput';

// ==========================================
// DEFINISI SKEMA DOKUMEN SANITY CMS
// ==========================================
export default {
  name: 'listeningMaterial',
  title: 'Materi Menyimak (Listening)',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Konten Menyimak', default: true },
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
      // validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'difficulty',
      title: 'Kesulitan (Difficulty)',
      type: 'string',
      group: 'metadata',
    },

    // ─── CONTENT GROUP ───
    {
      name: 'body',
      title: 'Transkrip / Teks Utama',
      type: 'text',
      group: 'content',
      description: 'Satu baris per ucapan. Format: "Pembicara: Teks" atau "Teks" saja.',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'timestamps',
      title: 'Timestamps Transkrip (Opsional)',
      type: 'text',
      group: 'content',
      description: 'Opsional. Satu timestamp per baris, sesuai urutan body. Format: "startDetik,endDetik" — contoh: "0,4\\n4,9\\n9,15". Jika kosong, sistem akan membagi waktu audio secara merata.',
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
      title: 'Audio URL (Sanity/CDN)',
      type: 'string',
      group: 'content',
    },
    {
      name: 'image_url',
      title: 'Image URL (Sanity/CDN)',
      type: 'string',
      group: 'content',
    },
    {
      name: 'illustrations',
      title: 'Ilustrasi Pendukung (Multi-Gambar)',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'illustrationItem',
          title: 'Item Ilustrasi',
          fields: [
            { name: 'title', title: 'Caption Ilustrasi', type: 'string' },
            { name: 'content', title: 'URL Gambar (Sanity/CDN)', type: 'string' }
          ]
        }
      ]
    },
    {
      name: 'video_url',
      title: 'Video URL (Sanity/CDN)',
      type: 'string',
      group: 'content',
    },
    {
      name: 'quizzes',
      title: 'Kuis Evaluasi Terkait (Quizzes)',
      description: 'Pertanyaan evaluasi opsional khusus materi menyimak ini',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'listeningQuiz',
          title: 'Soal Kuis Menyimak',
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
              title: 'Audio URL (Sanity/CDN)',
              type: 'string',
            },
            {
              name: 'image_url',
              title: 'Image URL (Sanity/CDN)',
              type: 'string',
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
