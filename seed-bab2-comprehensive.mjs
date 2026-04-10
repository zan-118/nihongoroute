import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "qoczxvvo",
  dataset: "production",
  apiVersion: "2024-04-09",
  useCdn: false,
  token:
    "skTMVeG5EoOvWtPaNh5irwL6AigKUhC7eWByrchkdOupDaAlFrhaZL7tPRufeQYVY2b9Aqn0nFXAXesUcJ6PWzP3aHK4TIQsPlzg0HGYIaOAP5L0enVh2GDwV8IsRpPaLnJhXxpovHMYJmNK0VhEHJaVNG7c8PJxizwHxjZQ3mtXF90Cbnx1",
});

const LEVEL_N5_ID = "fa1646f4-3cf5-453d-b3c0-32bf22196eba";
const LESSON_SLUG = "bab-2-full-curriculum";

// ==========================================
// 1. DATA KOSAKATA LENGKAP BAB 2 [cite: 641, 646]
// ==========================================
const vocabBab2 = [
  { word: "これ", romaji: "kore", meaning: "ini (benda di dekat pembicara)" },
  {
    word: "それ",
    romaji: "sore",
    meaning: "itu (benda di dekat lawan bicara)",
  },
  {
    word: "あれ",
    romaji: "are",
    meaning: "itu (benda yang jauh dari keduanya)",
  },
  {
    word: "この〜",
    romaji: "kono~",
    meaning: "~ ini (menerangkan benda di dekat pembicara)",
  },
  {
    word: "その〜",
    romaji: "sono~",
    meaning: "~ itu (menerangkan benda di dekat lawan bicara)",
  },
  {
    word: "あの〜",
    romaji: "ano~",
    meaning: "~ itu (menerangkan benda yang jauh dari keduanya)",
  },
  { word: "本", furigana: "ほん", romaji: "hon", meaning: "buku" },
  { word: "辞書", furigana: "じしょ", romaji: "jisho", meaning: "kamus" },
  { word: "雑誌", furigana: "ざっし", romaji: "zasshi", meaning: "majalah" },
  {
    word: "新聞",
    furigana: "しんぶん",
    romaji: "shinbun",
    meaning: "koran, surat kabar",
  },
  { word: "ノート", romaji: "nooto", meaning: "buku tulis, buku catatan" },
  {
    word: "手帳",
    furigana: "てちょう",
    romaji: "techou",
    meaning: "buku agenda",
  },
  { word: "名刺", furigana: "めいし", romaji: "meishi", meaning: "kartu nama" },
  { word: "カード", romaji: "kaado", meaning: "kartu" },
  { word: "鉛筆", furigana: "えんぴつ", romaji: "enpitsu", meaning: "pensil" },
  { word: "ボールペン", romaji: "boorupen", meaning: "bolpoin" },
  {
    word: "シャープペンシル",
    romaji: "shaapu penshiru",
    meaning: "pensil mekanik, pensil isi ulang",
  },
  { word: "かぎ", romaji: "kagi", meaning: "kunci" },
  { word: "時計", furigana: "とけい", romaji: "tokei", meaning: "jam, arloji" },
  { word: "傘", furigana: "かさ", romaji: "kasa", meaning: "payung" },
  { word: "かばん", romaji: "kaban", meaning: "tas" },
  { word: "CD", romaji: "shiidii", meaning: "CD" },
  { word: "テレビ", romaji: "terebi", meaning: "televisi" },
  { word: "ラジオ", romaji: "rajio", meaning: "radio" },
  { word: "カメラ", romaji: "kamera", meaning: "kamera" },
  { word: "コンピューター", romaji: "konpyuutaa", meaning: "komputer, PC" },
  { word: "車", furigana: "くるま", romaji: "kuruma", meaning: "mobil" },
  {
    word: "机",
    furigana: "つくえ",
    romaji: "tsukue",
    meaning: "meja, meja tulis",
  },
  { word: "いす", romaji: "isu", meaning: "kursi" },
  { word: "チョコレート", romaji: "chokoreeto", meaning: "coklat" },
  { word: "コーヒー", romaji: "koohii", meaning: "kopi" },
  {
    word: "[お]土産",
    furigana: "[お]みやげ",
    romaji: "[o]miyage",
    meaning: "oleh-oleh",
  },
  {
    word: "英語",
    furigana: "えいご",
    romaji: "eigo",
    meaning: "bahasa Inggris",
  },
  {
    word: "日本語",
    furigana: "にほんご",
    romaji: "nihongo",
    meaning: "bahasa Jepang",
  },
  { word: "〜語", furigana: "〜ご", romaji: "~go", meaning: "bahasa ~" },
  { word: "何", furigana: "なん", romaji: "nan", meaning: "apa" },
  { word: "そう", romaji: "sou", meaning: "begitu" },
  { word: "あのう", romaji: "anou", meaning: "Eee... (ungkapan ragu-ragu)" },
  { word: "えっ", romaji: "e", meaning: "Eh (terkejut/luar dugaan)" },
  {
    word: "どうぞ",
    romaji: "douzo",
    meaning: "Silakan (saat menawarkan barang)",
  },
  {
    word: "[どうも] ありがとう [ございます]",
    romaji: "[doumo] arigatou [gozaimasu]",
    meaning: "Terima kasih (banyak)",
  },
  { word: "そうですか", romaji: "sou desu ka", meaning: "O, begitu./O, ya." },
  {
    word: "違います",
    furigana: "ちがいます",
    romaji: "chigaimasu",
    meaning: "Bukan./Tidak./Salah.",
  },
  { word: "あ", romaji: "a", meaning: "O, Eh (saat sadar)" },
  {
    word: "これからお世話になります",
    furigana: "これからおせわになります",
    romaji: "korekara osewa ni narimasu",
    meaning: "Mulai sekarang, saya akan meminta bantuannya.",
  },
  {
    word: "こちらこそよろしく",
    romaji: "kochirakoso yoroshiku",
    meaning: "Ya, sama-sama.",
  },
];

// ==========================================
// 2. DATA LESSON LENGKAP BAB 2 [cite: 652-654, 656-677, 680-692, 717-795]
// ==========================================
const lessonData = {
  _type: "lesson",
  title: "Bab 2 - Korekara Osewa ni Narimasu",
  slug: { _type: "slug", current: LESSON_SLUG },
  summary:
    "Belajar menggunakan kata tunjuk benda (Kore, Sore, Are), kata tunjuk keterangan (Kono, Sono, Ano), serta cara menyatakan kepemilikan dan asal benda.",
  orderNumber: 2,
  is_published: true,
  level: { _type: "reference", _ref: LEVEL_N5_ID },

  patterns: [
    {
      _key: "p1",
      _type: "exampleSentence",
      jp: "これ は 辞書 です。",
      furigana: "Kore wa jisho desu.",
      id: "Ini kamus.",
    },
    {
      _key: "p2",
      _type: "exampleSentence",
      jp: "それ は わたし の 傘 です。",
      furigana: "Sore wa watashi no kasa desu.",
      id: "Itu payung saya.",
    },
    {
      _key: "p3",
      _type: "exampleSentence",
      jp: "この 本 は わたし の です。",
      furigana: "Kono hon wa watashi no desu.",
      id: "Buku ini punya saya.",
    },
  ],

  examples: [
    {
      _key: "e1",
      _type: "exampleSentence",
      jp: "「これ は ボールペン です か。」「はい、そう です。」",
      furigana: "Kore wa boorupen desu ka. Hai, sou desu.",
      id: "Ini bolpoin? Ya, betul.",
    },
    {
      _key: "e2",
      _type: "exampleSentence",
      jp: "「それ は ノート です か。」「いいえ、手帳 です。」",
      furigana: "Sore wa nooto desu ka. Iie, techou desu.",
      id: "Itu buku tulis? Bukan, [ini] buku agenda.",
    },
    {
      _key: "e3",
      _type: "exampleSentence",
      jp: "「それ は 何 です か。」「名刺 です。」",
      furigana: "Sore wa nan desu ka. Meishi desu.",
      id: "Apa itu? Kartu nama.",
    },
    {
      _key: "e4",
      _type: "exampleSentence",
      jp: "「これ は 『9』 です か、『7』 です か。」「『9』 です。」",
      furigana: "Kore wa '9' desu ka, '7' desu ka. '9' desu.",
      id: "Ini '9' atau '7'? '9'.",
    },
    {
      _key: "e5",
      _type: "exampleSentence",
      jp: "「それ は 何 の 雑誌 です か。」「コンピューター の 雑誌 です。」",
      furigana: "Sore wa nan no zasshi desu ka. Konpyuutaa no zasshi desu.",
      id: "Itu majalah apa? Majalah komputer.",
    },
    {
      _key: "e6",
      _type: "exampleSentence",
      jp: "「あれ は だれ の かばん です か。」「佐藤 さん の かばん です。」",
      furigana: "Are wa dare no kaban desu ka. Satou-san no kaban desu.",
      id: "Itu tas siapa? Tas Sdr. Sato.",
    },
    {
      _key: "e7",
      _type: "exampleSentence",
      jp: "「これ は ミラー さん の です か。」「いいえ、わたし の じゃ ありません。」",
      furigana: "Kore wa Miraa-san no desu ka. Iie, watashi no ja arimasen.",
      id: "Ini punya Sdr. Miller? Bukan, bukan punya saya.",
    },
    {
      _key: "e8",
      _type: "exampleSentence",
      jp: "「この かぎ は だれ の です か。」「わたし の です。」",
      furigana: "Kono kagi wa dare no desu ka. Watashi no desu.",
      id: "Kunci ini punya siapa? Punya saya.",
    },
  ],

  conversationTitle: "これから お世話に なります (Mohon Bantuan Anda)",
  conversation: [
    {
      _key: "c1",
      _type: "exampleSentence",
      jp: "山田一郎：はい。どなた です か。",
      furigana: "Yamada Ichiro: Hai. Donata desu ka.",
      id: "Ichiro Yamada: Ya! Siapa?",
    },
    {
      _key: "c2",
      _type: "exampleSentence",
      jp: "サントス：408 の サントス です。",
      furigana: "Santosu: 408 no Santosu desu.",
      id: "Santos: Saya Santos di kamar 408.",
    },
    {
      _key: "c3",
      _type: "exampleSentence",
      jp: "サントス：こんにちは。サントス です。これ から お世話に なります。どうぞ よろしく お願いします。",
      furigana:
        "Santosu: Konnichiwa. Santosu desu. Korekara osewa ni narimasu. Douzo yoroshiku onegaishimasu.",
      id: "Santos: Selamat siang. Saya Santos. Mulai sekarang, saya akan meminta bantuannya. Mohon bantuan Anda.",
    },
    {
      _key: "c4",
      _type: "exampleSentence",
      jp: "山田一郎：こちら こそ [どうぞ] よろしく [お願いします]。",
      furigana: "Yamada Ichiro: Kochirakoso yoroshiku.",
      id: "Ichiro Yamada: Ya, sama-sama.",
    },
    {
      _key: "c5",
      _type: "exampleSentence",
      jp: "サントス：あのう、これ、コーヒー です。どうぞ。",
      furigana: "Santosu: Anou, kore, koohii desu. Douzo.",
      id: "Santos: Pak, ini kopi. Silakan.",
    },
    {
      _key: "c6",
      _type: "exampleSentence",
      jp: "山田一郎：どうも ありがとう [ございます]。",
      furigana: "Yamada Ichiro: Doumo arigatou gozaimasu.",
      id: "Ichiro Yamada: Terima kasih banyak.",
    },
  ],

  grammar: [
    {
      _key: "g1",
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "1. これ / それ / あれ" }],
    },
    {
      _key: "g1_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Kore, sore, dan are menunjukkan benda dan berfungsi sebagai Kata Benda. Kore menunjukkan benda di dekat pembicara, sore di dekat lawan bicara, dan are jauh dari keduanya.",
        },
      ],
    },
    {
      _key: "ex_g1_1",
      _type: "exampleSentence",
      jp: "それ は 辞書 です か。",
      furigana: "Sore wa jisho desu ka.",
      id: "Apakah ini kamus?",
    },
    {
      _key: "ex_g1_2",
      _type: "exampleSentence",
      jp: "これ は だれ の 傘 です か。",
      furigana: "Kore wa dare no kasa desu ka.",
      id: "Ini payung siapa?",
    },

    {
      _key: "g2",
      _type: "block",
      style: "h2",
      children: [
        {
          _type: "span",
          text: "2. この Kata Benda / その Kata Benda / あの Kata Benda",
        },
      ],
    },
    {
      _key: "g2_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Pola ini digunakan untuk menerangkan Kata Benda secara spesifik. 'Kono hon' (Buku ini), 'Sono hon' (Buku itu).",
        },
      ],
    },
    {
      _key: "ex_g2_1",
      _type: "exampleSentence",
      jp: "この 本 は わたし の です。",
      furigana: "Kono hon wa watashi no desu.",
      id: "Buku ini kepunyaan saya.",
    },

    {
      _key: "g3",
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "3. そう です" }],
    },
    {
      _key: "g3_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Dalam kalimat nominal, 'Hai, sou desu' digunakan sebagai jawaban positif. Untuk negatif, gunakan 'Iie, chigaimasu' (Bukan/Salah).",
        },
      ],
    },
    {
      _key: "ex_g3_1",
      _type: "exampleSentence",
      jp: "「それ は 辞書 です か。」「はい、そう です。」",
      furigana: "Sore wa jisho desu ka. Hai, sou desu.",
      id: "Apakah itu kamus? Ya, betul.",
    },

    {
      _key: "g4",
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "4. ~か、~か" }],
    },
    {
      _key: "g4_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Memberikan pilihan yang lebih dari dua kepada lawan bicara. Jawaban langsung menyatakan pilihan yang benar, tanpa 'Hai' atau 'Iie'.",
        },
      ],
    },
    {
      _key: "ex_g4_1",
      _type: "exampleSentence",
      jp: "これ は 『9』 です か、『7』 です か。",
      furigana: "Kore wa '9' desu ka, '7' desu ka.",
      id: "Apakah ini '9' atau '7'?",
    },

    {
      _key: "g5",
      _type: "block",
      style: "h2",
      children: [
        { _type: "span", text: "5. Partikel の (Penggunaan Lanjutan)" },
      ],
    },
    {
      _key: "g5_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "1) KB1 menerangkan isi KB2 (Contoh: Buku komputer).\n2) KB1 menyatakan pemilik KB2 (Contoh: Buku saya).",
        },
      ],
    },
    {
      _key: "ex_g5_1",
      _type: "exampleSentence",
      jp: "これ は コンピューター の 本 です。",
      furigana: "Kore wa konpyuutaa no hon desu.",
      id: "Ini buku komputer.",
    },

    {
      _key: "g6",
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "6. の Sebagai Pengganti Kata Benda" }],
    },
    {
      _key: "g6_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Partikel の dapat mengganti kata benda yang sudah disebutkan agar tidak diulang.",
        },
      ],
    },
    {
      _key: "ex_g6_1",
      _type: "exampleSentence",
      jp: "「あれ は だれ の かばん です か。」「佐藤 さん の です。」",
      furigana: "Are wa dare no kaban desu ka. Satou-san no desu.",
      id: "Itu tas siapa? Kepunyaan Sdr. Sato.",
    },
    {
      _key: "c_g6",
      _type: "callout",
      title: "Peringatan",
      type: "warning",
      text: "の dapat mengganti barang, tetapi tidak dapat mengganti orang. (Salah: IMC no desu | Benar: IMC no shain desu)",
    },

    {
      _key: "g7",
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "7. お〜 (Kesopanan)" }],
    },
    {
      _key: "g7_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Prefiks 'o' dibubuhkan untuk menyatakan rasa hormat (Contoh: o-miyage, o-sake).",
        },
      ],
    },

    {
      _key: "g8",
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "8. そう ですか" }],
    },
    {
      _key: "g8_1",
      _type: "block",
      style: "normal",
      children: [
        {
          _type: "span",
          text: "Ekspresi ini digunakan saat menerima informasi baru. Intonasinya menurun.",
        },
      ],
    },
  ],
};

async function uploadVocab(array) {
  const refs = [];
  for (const v of array) {
    const query = `*[_type == "kosakata" && (word == $word || romaji == $romaji)][0]`;
    const existing = await client.fetch(query, {
      word: v.word,
      romaji: v.romaji,
    });

    let vId;
    if (existing) {
      vId = existing._id;
      console.log(`⏭️  Skip: ${v.word}`);
    } else {
      const newDoc = await client.create({
        _type: "kosakata",
        word: v.word,
        furigana: v.furigana || "",
        romaji: v.romaji,
        meaning: v.meaning,
        info: v.info || "",
        level: { _type: "reference", _ref: LEVEL_N5_ID },
      });
      vId = newDoc._id;
      console.log(`✅ Uploaded: ${v.word}`);
    }
    refs.push({ _key: `ref_${vId}`, _type: "reference", _ref: vId });
  }
  return refs;
}

async function run() {
  try {
    const vocabRefs = await uploadVocab(vocabBab2);
    const existingLesson = await client.fetch(
      `*[_type == "lesson" && slug.current == "${LESSON_SLUG}"][0]`,
    );
    const payload = { ...lessonData, vocabList: vocabRefs };

    if (existingLesson) {
      await client.patch(existingLesson._id).set(payload).commit();
      console.log("🔄 Bab 2 Berhasil Diperbarui!");
    } else {
      await client.create(payload);
      console.log("✅ Bab 2 Berhasil Dibuat!");
    }
  } catch (e) {
    console.error(e);
  }
}

run();
