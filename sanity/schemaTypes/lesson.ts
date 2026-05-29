/**
 * @file lesson.ts
 * @description Skema dokumen Sanity Studio untuk Pelajaran (Lesson). Mengintegrasikan field metadata pelajaran, blok editor kaya (rich text) dialog, tata bahasa, catatan penting, kuis evaluasi, dan pemilih Supabase.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { SupabaseSelector } from '../components/SupabaseSelector';
import { FuriganaGeneratorInput } from '../components/FuriganaGeneratorInput';
import { SupabaseCategorySelect } from '../components/SupabaseCategorySelect';

// ==========================================
// DEFINISI SKEMA DOKUMEN SANITY CMS
// ==========================================
export default {
  name: 'lesson',
  title: 'Pelajaran (Lesson)',
  type: 'document',
  groups: [
    { name: 'content', title: '📝 Materi & Kuis', default: true },
    { name: 'relations', title: '🔗 Koneksi Supabase' },
    { name: 'metadata', title: '⚙️ Pengaturan Pelajaran' },
    { name: 'seo', title: '🔍 Optimasi SEO' },
  ],
  fields: [
    // ─── METADATA GROUP ───
    {
      name: 'title',
      title: 'Judul Pelajaran',
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
      name: 'order_number',
      title: 'Urutan Pelajaran (Order Number)',
      type: 'number',
      group: 'metadata',
      initialValue: 0,
      validation: (Rule: import('sanity').Rule) => Rule.required(),
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
      name: 'summary',
      title: 'Ringkasan Pelajaran',
      type: 'text',
      group: 'metadata',
    },
    {
      name: 'estimated_minutes',
      title: 'Estimasi Waktu Belajar (Menit)',
      type: 'number',
      group: 'metadata',
      initialValue: 10,
    },
    {
      name: 'is_premium',
      title: 'Pelajaran Premium?',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    },
    {
      name: 'is_published',
      title: 'Diterbitkan (Published)?',
      type: 'boolean',
      group: 'metadata',
      initialValue: false,
    },

    // ─── CONTENT GROUP ───
    {
      name: 'content_blocks',
      title: 'Materi Pelajaran (Rich Text Editor)',
      description: 'Editor teks lengkap mirip Microsoft Word / Google Docs. Anda bisa menulis paragraf, membuat daftar, judul, serta menyisipkan komponen khusus (Dialog, Tata Bahasa, Catatan Budaya, Gambar) langsung di dalam aliran teks.',
      type: 'array',
      group: 'content',
      of: [
        // 1. Standard Rich Text Block
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Sub-Judul Besar (H2)', value: 'h2' },
            { title: 'Sub-Judul Sedang (H3)', value: 'h3' },
            { title: 'Kutipan (Blockquote)', value: 'blockquote' }
          ],
          lists: [
            { title: 'Daftar Bullet', value: 'bullet' },
            { title: 'Daftar Angka', value: 'number' }
          ],
          marks: {
            decorators: [
              { title: 'Tebal (Bold)', value: 'strong' },
              { title: 'Miring (Italic)', value: 'em' },
              { title: 'Garis Bawah (Underline)', value: 'underline' },
              { title: 'Coret (Strikethrough)', value: 'strike-through' }
            ]
          }
        },
        // 2. Custom Embed: Dialogue Block
        {
          type: 'object',
          name: 'dialogueBlock',
          title: 'Sisipkan: Dialog / Percakapan',
          fields: [
            { name: 'title', title: 'Judul Dialog (Opsional)', type: 'string' },
            {
              name: 'content',
              title: 'Teks Dialog (Format: Pembicara: Teks)',
              type: 'text',
              description: 'Contoh:\nTakahashi: 初めまして。\nAyu: 初めまして。',
              validation: (Rule: import('sanity').Rule) => Rule.required()
            },
            { name: 'translation', title: 'Terjemahan Dialog', type: 'text' },
            { name: 'furigana', title: 'Furigana (Satu baris per baris dialog)', type: 'text', components: { input: FuriganaGeneratorInput } }
          ]
        },
        // 3. Custom Embed: Grammar Block
        {
          type: 'object',
          name: 'grammarBlock',
          title: 'Sisipkan: Pola Tata Bahasa',
          fields: [
            { name: 'title', title: 'Nama Pola Tata Bahasa', type: 'string', validation: (Rule: import('sanity').Rule) => Rule.required() },
            { name: 'content', title: 'Formula / Bentuk Jepang', type: 'string' },
            { name: 'furigana', title: 'Furigana Tata Bahasa', type: 'string', components: { input: FuriganaGeneratorInput } },
            { name: 'translation', title: 'Fungsi / Arti', type: 'text' },
            {
              name: 'examples',
              title: 'Contoh Kalimat',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'exampleSentence',
                  title: 'Kalimat Contoh',
                  fields: [
                    { name: 'jp', title: 'Bahasa Jepang', type: 'string', validation: (Rule: import('sanity').Rule) => Rule.required() },
                    { name: 'id', title: 'Terjemahan Indonesia', type: 'string', validation: (Rule: import('sanity').Rule) => Rule.required() },
                    { name: 'romaji', title: 'Romaji', type: 'string' },
                    { name: 'furigana', title: 'Furigana', type: 'string', components: { input: FuriganaGeneratorInput } }
                  ]
                }
              ]
            }
          ]
        },
        // 4. Custom Embed: Callout Block (Cultural / Warning)
        {
          type: 'object',
          name: 'calloutBlock',
          title: 'Sisipkan: Catatan Penting / Budaya',
          fields: [
            { name: 'title', title: 'Judul Catatan', type: 'string' },
            { name: 'content', title: 'Isi Catatan', type: 'text', validation: (Rule: import('sanity').Rule) => Rule.required() },
            { name: 'translation', title: 'Terjemahan / Arti (Opsional)', type: 'text' }
          ]
        },
        // 5. Custom Embed: Image Block
        {
          type: 'object',
          name: 'imageBlock',
          title: 'Sisipkan: Gambar',
          fields: [
            { name: 'title', title: 'Caption Gambar', type: 'string' },
            { name: 'content', title: 'URL Gambar (Sanity/CDN)', type: 'string', validation: (Rule: import('sanity').Rule) => Rule.required() }
          ]
        },
        // 6. Custom Embed: Vocab Block
        {
          type: 'object',
          name: 'vocabBlock',
          title: 'Sisipkan: Daftar Kosakata',
          fields: [
            { name: 'title', title: 'Judul Seksi Kosakata', type: 'string', initialValue: 'Kosakata (Vocab)' }
          ]
        },
        // 7. Custom Embed: Kanji Block
        {
          type: 'object',
          name: 'kanjiBlock',
          title: 'Sisipkan: Daftar Kanji',
          fields: [
            { name: 'title', title: 'Judul Seksi Kanji', type: 'string', initialValue: 'Kanji Dasar' }
          ]
        }
      ]
    },
    {
      name: 'quizzes',
      title: 'Kuis Evaluasi Akhir Pelajaran (Quizzes)',
      description: 'Daftar pertanyaan kuis evaluasi bab (sesuai format standar Bab: 7. Kuis Evaluasi & 8. Kunci Jawaban & Pembahasan).',
      type: 'array',
      group: 'content',
      of: [
        {
          type: 'object',
          name: 'lessonQuiz',
          title: 'Soal Kuis',
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

    // ─── RELATIONS GROUP ───
    {
      name: 'vocab_list',
      title: 'Daftar Kosakata Terkait (Pencarian Supabase)',
      description: 'Cari kosakata dari database Supabase secara real-time',
      type: 'array',
      group: 'relations',
      of: [{ type: 'string' }],
      components: {
        input: SupabaseSelector
      },
      options: {
        supabaseType: 'vocab'
      }
    },
    {
      name: 'kanji_list',
      title: 'Daftar Kanji Terkait (Pencarian Supabase)',
      description: 'Cari karakter kanji dari database Supabase secara real-time',
      type: 'array',
      group: 'relations',
      of: [{ type: 'string' }],
      components: {
        input: SupabaseSelector
      },
      options: {
        supabaseType: 'kanji'
      }
    },
    {
      name: 'grammar_list',
      title: 'Daftar Tata Bahasa Terkait (Pencarian Supabase)',
      description: 'Cari tata bahasa dari database Supabase secara real-time',
      type: 'array',
      group: 'relations',
      of: [{ type: 'string' }],
      components: {
        input: SupabaseSelector
      },
      options: {
        supabaseType: 'grammar'
      }
    },
    {
      name: 'reading_list',
      title: 'Daftar Materi Bacaan Terkait (Slugs)',
      type: 'array',
      group: 'relations',
      of: [{ type: 'string' }],
    },
    {
      name: 'listening_list',
      title: 'Daftar Materi Menyimak Terkait (Slugs)',
      type: 'array',
      group: 'relations',
      of: [{ type: 'string' }],
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
