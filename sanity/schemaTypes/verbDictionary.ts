import { defineField, defineType } from "sanity";

export default defineType({
  name: "verb_dictionary",
  title: "Kamus Kata Kerja (Verb)",
  type: "document",
  fields: [
    // --- IDENTITAS UTAMA ---
    defineField({
      name: "masu",
      title: "Bentuk Masu (Utama)",
      type: "string",
      description: "Contoh: 食べます",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "furigana",
      title: "Furigana (Hiragana)",
      type: "string",
      description: "Cara baca dalam hiragana murni",
    }),
    defineField({
      name: "romaji",
      title: "Romaji",
      type: "string",
    }),
    defineField({
      name: "jisho",
      title: "Bentuk Kamus (Jisho-kei)",
      type: "string",
      description: "Teks biru di bawah judul (Contoh: 食べる)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "meaning",
      title: "Arti (Bahasa Indonesia)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "group",
      title: "Golongan (Group)",
      type: "number",
      options: {
        list: [1, 2, 3],
      },
      validation: (Rule) => Rule.required().min(1).max(3),
    }),
    defineField({
      name: "lesson",
      title: "Bab (Lesson)",
      type: "string",
    }),

    // --- KONJUGASI DASAR ---
    defineField({
      name: "te",
      title: "Bentuk ~Te",
      type: "string",
      description: "Contoh: 食べて",
    }),
    defineField({
      name: "nai",
      title: "Bentuk ~Nai",
      type: "string",
      description: "Contoh: 食べない",
    }),
    defineField({
      name: "ta",
      title: "Bentuk ~Ta",
      type: "string",
      description: "Contoh: 食べた",
    }),

    // --- KONJUGASI LANJUTAN (ULTRA) ---
    defineField({
      name: "teiru",
      title: "Bentuk ~Te Iru",
      type: "string",
    }),
    defineField({
      name: "tai",
      title: "Bentuk ~Tai (Keinginan)",
      type: "string",
    }),
    defineField({
      name: "nakereba",
      title: "Bentuk ~Nakereba Naranai",
      type: "string",
    }),
    defineField({
      name: "kanou",
      title: "Bentuk Kanou (Potensial)",
      type: "string",
    }),
    defineField({
      name: "shieki",
      title: "Bentuk Shieki (Kausatif)",
      type: "string",
    }),
    defineField({
      name: "ukemi",
      title: "Bentuk Ukemi (Pasif)",
      type: "string",
    }),
    defineField({
      name: "katei",
      title: "Bentuk Katei (Pengandaian)",
      type: "string",
    }),
    defineField({
      name: "ikou",
      title: "Bentuk Ikou (Volitional)",
      type: "string",
    }),
    defineField({
      name: "teshimau",
      title: "Bentuk ~Te Shimau",
      type: "string",
    }),
    defineField({
      name: "meirei",
      title: "Bentuk Meirei (Perintah)",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "masu",
      subtitle: "meaning",
      group: "group",
    },
    prepare(selection) {
      const { title, subtitle, group } = selection;
      return {
        title: title,
        subtitle: `${subtitle} (Golongan ${group})`,
      };
    },
  },
});
