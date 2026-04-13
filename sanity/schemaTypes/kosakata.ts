import { defineField, defineType } from "sanity";

// ✨ 1. Fungsi Pengecek Duplikasi ID
const isUniqueVocabId = async (value: string | undefined, context: any) => {
  if (!value) return true;
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2024-04-12" });
  const id = document._id.replace(/^drafts\./, "");

  const query = `*[_type == "kosakata" && vocabId == $value && _id != $draftId && _id != $publishedId][0]`;
  const params = { value, draftId: `drafts.${id}`, publishedId: id };
  const result = await client.fetch(query, params);

  return result
    ? `🚨 Vocab ID "${value}" sudah dipakai! Gunakan ID lain.`
    : true;
};

// ✨ 2. Fungsi Pengecek Duplikasi Kata Jepang
const isUniqueWord = async (value: string | undefined, context: any) => {
  if (!value) return true;
  const { document, getClient } = context;
  const client = getClient({ apiVersion: "2024-04-12" });
  const id = document._id.replace(/^drafts\./, "");

  const query = `*[_type == "kosakata" && word == $value && _id != $draftId && _id != $publishedId][0]`;
  const params = { value, draftId: `drafts.${id}`, publishedId: id };
  const result = await client.fetch(query, params);

  return result
    ? `🚨 Kata "${value}" sudah ada di database! Hindari duplikat.`
    : true;
};

export default defineType({
  name: "kosakata",
  title: "Perpustakaan Kosakata Global",
  type: "document",
  fields: [
    defineField({
      name: "vocabId",
      title: "Vocab ID",
      type: "string",
      description: "Contoh: VOC-N5-001",
      validation: (Rule) => Rule.custom(isUniqueVocabId),
    }),
    defineField({
      name: "word",
      type: "string",
      title: "Kata (Kanji/Kana)",
      validation: (Rule) => Rule.required().custom(isUniqueWord),
    }),
    defineField({
      name: "category",
      type: "string",
      title: "Jenis Kata",
      options: {
        list: [
          { title: "Kata Benda (Noun)", value: "noun" },
          { title: "Kata Sifat (I-Adj / Na-Adj)", value: "adjective" },
          { title: "Kata Keterangan (Adverb)", value: "adverb" },
          { title: "Partikel (Particle)", value: "particle" },
          { title: "Ungkapan (Expression)", value: "expression" },
          { title: "Kanji Power (Khusus Mode Kanji)", value: "kanji" },
        ],
      },
      initialValue: "noun",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "showInFlashcard",
      type: "boolean",
      title: "Munculkan di Flashcard (Vocab Drill)?",
      description:
        "Matikan (OFF) jika kata ini hanya untuk referensi Cheatsheet / UI materi.",
      initialValue: true,
    }),
    defineField({
      name: "furigana",
      type: "string",
      title: "Cara Baca (Furigana)",
    }),
    defineField({
      name: "romaji",
      type: "string",
      title: "Romaji",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "meaning",
      type: "string",
      title: "Arti (Bahasa Indonesia)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "kanjiDetails",
      type: "object",
      title: "Detail Kanji",
      hidden: ({ document }) => document?.category !== "kanji",
      fields: [
        { name: "onyomi", type: "string", title: "Onyomi (Katakana)" },
        { name: "kunyomi", type: "string", title: "Kunyomi (Hiragana)" },
      ],
    }),
    defineField({
      name: "course_category",
      title: "Course Category",
      type: "reference",
      to: [{ type: "course_category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "audio",
      type: "file",
      title: "Audio Pengucapan (Opsional)",
      options: { accept: "audio/*" },
    }),
  ],
  preview: {
    select: {
      title: "word",
      subtitle: "meaning",
      category: "category",
      showInFlashcard: "showInFlashcard",
      customId: "vocabId",
      systemId: "_id",
    },
    prepare({
      title,
      subtitle,
      category,
      showInFlashcard,
      customId,
      systemId,
    }) {
      const isHidden = showInFlashcard === false ? " 🚷 (Hidden)" : "";
      const displayTitle = customId
        ? `[${customId}] ${title || "Kosong"}`
        : title || "Kosong";

      return {
        title: `${displayTitle}${isHidden}`,
        subtitle: `SysID: ${systemId} | [${category?.toUpperCase()}] ${subtitle || ""}`,
      };
    },
  },
});
