import { defineField, defineType } from "sanity";

export default defineType({
  name: "verb_dictionary",
  title: "Kamus Kata Kerja (Verb)",
  type: "document",
  fields: [
    defineField({
      name: "group",
      title: "Golongan (Group)",
      type: "number",
      description: "Golongan kata kerja: 1, 2, atau 3",
      validation: (Rule) => Rule.required().min(1).max(3),
    }),
    defineField({
      name: "masu",
      title: "Bentuk Masu",
      type: "string",
      description: "Contoh: 食べます (tabemasu)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "te",
      title: "Bentuk Te",
      type: "string",
      description: "Contoh: 食べて (tabete)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "jisho",
      title: "Bentuk Kamus (Jisho)",
      type: "string",
      description: "Contoh: 食べる (taberu)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "nai",
      title: "Bentuk Nai",
      type: "string",
      description: "Contoh: 食べない (tabenai)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ta",
      title: "Bentuk Ta",
      type: "string",
      description: "Contoh: 食べた (tabeta)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "meaning",
      title: "Arti (Bahasa Indonesia)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lesson",
      title: "Bab (Lesson)",
      type: "string",
      description: "Bab ke berapa kata kerja ini muncul di buku",
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
