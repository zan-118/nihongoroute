import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "qoczxvvo",
  dataset: "production",
  token:
    "skGqA6pitVxRkBqrquWfhjJgL1j5GkBfQQfFnd7W97ZMc1aVRuHDibrYSGJ77ESbHRBaaTY1qY2kqDQkMaVkhmt65eE4PTEFvAPMRCO91wwGBdPW5pV1M8WzKvUM9PydtA0Fx7I2z588RbMBtOZ5Ys8nR9Bj43r3vkRkg3YPxiPo9V5YD93y",
  useCdn: false,
  apiVersion: "2023-05-03",
});

const N4_LEVEL_ID = "07e7c1f4-f4f8-4f74-a43e-2b5cdac54e1c";

const lessonData = {
  _id: "lesson-n4-bab-1",
  _type: "lesson",
  title: "Bab 1: Kekuatan Penjelasan '~ndesu'",
  slug: { _type: "slug", current: "n4-bab-1-penjelasan-situasi-ndesu" },
  level: { _type: "reference", _ref: N4_LEVEL_ID },
  orderNumber: 1,
  is_published: true,
  summary:
    "Mempelajari pola '~ndesu' untuk komunikasi yang lebih natural dan bermakna.",

  /* --- TAB: KOSAKATA --- */
  // Di sini kita langsung tembak ID yang ada di 'verb_dictionary' kamu
  vocabList: [
    { _key: "v1", _type: "reference", _ref: "verb-g2-okuremasu" },
    { _key: "v2", _type: "reference", _ref: "verb-g1-shirabemasu" },
    { _key: "v3", _type: "reference", _ref: "verb-g1-maniaimasu" },
    { _key: "v4", _type: "reference", _ref: "verb-g1-yarimasu" },
  ],

  /* --- DATA LAINNYA --- */
  patterns: [
    {
      _key: "p1",
      _type: "exampleSentence",
      jp: "んです。",
      id: "Menjelaskan situasi/alasan.",
    },
  ],
  examples: [
    {
      _key: "e1",
      _type: "exampleSentence",
      jp: "どうして遅れたんですか。……バスが来なかったんです。",
      id: "Kenapa terlambat? ... Karena busnya tidak datang.",
    },
  ],
  conversationTitle: "ゴミの出し方を教えていただけませんか",
  conversation: [
    {
      _key: "c1",
      _type: "exampleSentence",
      jp: "サントス：ゴミを捨てたいんですが...",
      id: "Santos: Saya ingin buang sampah...",
    },
  ],
  grammar: [
    {
      _key: "g1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Pola ~ndesu digunakan untuk memberikan penjelasan.",
        },
      ],
    },
  ],
};

async function migrate() {
  try {
    // 1. Hapus dokumen 'sampah' yang tidak sengaja terbuat dari skrip sebelumnya (jika ada)
    // Berhati-hatilah, hapus jika ID-nya memang lesson-n4-bab-1-kosakata-dst

    // 2. Update Lesson
    await client.createOrReplace(lessonData);
    console.log(
      "✅ Bab 1 N4 berhasil diperbarui menggunakan referensi verb_dictionary asli.",
    );
  } catch (err) {
    console.error("❌ Gagal:", err.message);
  }
}

migrate();
