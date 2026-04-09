import { defineField, defineType } from "sanity";

export default defineType({
  name: "flashcard",
  title: "Flashcard Pro",
  type: "document",
  groups: [
    { name: "main", title: "Kosakata Utama", default: true },
    { name: "details", title: "Detail & Level" },
    { name: "examples", title: "Contoh Kalimat" },
  ],
  fields: [
    /* --- TAB: MAIN --- */
    defineField({
      name: "word",
      type: "string",
      title: "Kanji / Word",
      group: "main",
      // INI DIA FITUR VALIDASI ANTI-DUPLIKATNYA
      validation: (Rule) =>
        Rule.required().custom(async (word, context) => {
          if (!word) return true; // Biarkan .required() yang mengurus jika kosong

          const client = context.getClient({ apiVersion: "2024-04-09" });
          const documentId = context.document?._id?.replace(/^drafts\./, "");

          // Cari flashcard lain yang 'word'-nya sama persis
          const query = `*[_type == "flashcard" && word == $word && !(_id in [$draftId, $publishedId])][0]`;
          const params = {
            word: word,
            draftId: `drafts.${documentId}`,
            publishedId: documentId,
          };

          const duplicate = await client.fetch(query, params);

          if (duplicate) {
            return `Peringatan: Kosakata "${word}" sudah pernah dibuat! Coba cek fitur pencarian.`;
          }

          return true;
        }),
    }),
    defineField({
      name: "romaji",
      type: "string",
      title: "Romaji",
      group: "main",
    }),
    defineField({
      name: "meaning",
      type: "string",
      title: "Meaning (ID)",
      group: "main",
    }),

    /* --- TAB: DETAILS --- */
    defineField({
      name: "level",
      type: "reference",
      to: [{ type: "level" }],
      group: "details",
    }),
    defineField({
      name: "details",
      type: "object",
      title: "Kanji Details",
      group: "details",
      fields: [
        { name: "onyomi", type: "string", title: "Onyomi (Katakana)" },
        { name: "kunyomi", type: "string", title: "Kunyomi (Hiragana)" },
      ],
    }),

    /* --- TAB: EXAMPLES --- */
    defineField({
      name: "examples",
      type: "array",
      title: "Example Sentences",
      group: "examples",
      of: [
        {
          type: "object",
          fields: [
            { name: "jp", type: "string", title: "Japanese" },
            { name: "furigana", type: "string", title: "Furigana" },
            { name: "id", type: "string", title: "Translation" },
          ],
        },
      ],
    }),
  ],
  // Tampilan di daftar dokumen Sanity (Sebelah kiri)
  preview: {
    select: {
      title: "word",
      subtitle: "meaning",
      levelCode: "level.code",
    },
    prepare({ title, subtitle, levelCode }) {
      return {
        title: title || "Kosong",
        subtitle: `${levelCode ? `[${levelCode.toUpperCase()}] ` : ""}${subtitle || ""}`,
      };
    },
  },
});
