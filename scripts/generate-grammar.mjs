import fs from "fs";
import crypto from "crypto";

const grammarData = {
  N5: [
    ["～です","Kopula positif (adalah)","KB + です"],
    ["～ではありません","Kopula negatif (bukan)","KB + ではありません"],
    ["～でした","Kopula lampau (dulu adalah)","KB + でした"],
    ["～があります","Ada (benda mati)","KB + があります"],
    ["～がいます","Ada (makhluk hidup)","KB + がいます"],
    ["～にいる/ある","Keberadaan di suatu tempat","KB + に + KK"],
    ["～ます","Bentuk sopan positif","KK (Masu)"],
    ["～ません","Bentuk sopan negatif","KK (Masu) + ません"],
    ["～ました","Bentuk sopan lampau","KK (Masu) + ました"],
    ["～ませんでした","Bentuk sopan negatif lampau","KK (Masu) + ませんでした"],
    ["～ましょう","Ajakan (ayo)","KK (Masu) + ましょう"],
    ["～ませんか","Ajakan sopan (mau tidak?)","KK (Masu) + ませんか"],
    ["～てください","Tolong lakukan","KK (Te) + ください"],
    ["～ないでください","Tolong jangan lakukan","KK (Nai) + でください"],
    ["～てもいいです","Boleh dilakukan","KK (Te) + もいいです"],
    ["～てはいけません","Tidak boleh dilakukan","KK (Te) + はいけません"],
    ["～ています","Sedang dilakukan / Keadaan","KK (Te) + います"],
    ["～てきます","Saya akan (pergi dan kembali)","KK (Te) + きます"],
    ["～ていきます","Terus berlanjut","KK (Te) + いきます"],
    ["～てくださいませんか","Bisakah tolong? (sopan)","KK (Te) + くださいませんか"],
    ["～たい","Ingin melakukan","KK (Masu) + たい"],
    ["～がほしい","Ingin (benda)","KB + がほしい"],
    ["～後で","Setelah melakukan","KK (Ta) + 後で"],
    ["～前に","Sebelum melakukan","KK (Kamus) + 前に"],
    ["～とき","Pada waktu","KK/KS (Biasa) + とき"],
    ["～から～まで","Dari ~ sampai","KB + から + KB + まで"],
    ["～ごろ","Sekitar (waktu)","Waktu + ごろ"],
    ["～くらい","Kira-kira / sebanyak","KB + くらい"],
    ["～だけ","Hanya","KB + だけ"],
    ["～しか～ない","Hanya (negatif)","KB + しか + KK Nai"],
    ["～より～のほうが","Lebih ~ daripada","KB + より + KB + のほうが"],
    ["一番～","Paling ~ (superlatif)","一番 + KS"],
    ["～と～と","Dan (daftar lengkap)","KB + と + KB"],
    ["～や～","Dan (daftar tidak lengkap)","KB + や + KB"],
    ["など","Dan lain-lain","KB + など"],
    ["～から(原因)","Karena (alasan subjektif)","KK/KS + から"],
    ["～ので","Karena (alasan objektif)","KK/KS + ので"],
    ["～が(反対)","Tetapi (formal)","Kal1 + が + Kal2"],
    ["～けど","Tetapi (kasual)","Kal1 + けど + Kal2"],
    ["～でも","Tetapi (awal kalimat)","でも + Kal"],
    ["～のに(目的)","Untuk (tujuan)","KK (Kamus) + のに"],
    ["～ことができます","Dapat melakukan","KK (Kamus) + ことができます"],
    ["～たことがあります","Pernah melakukan","KK (Ta) + ことがあります"],
    ["～たり～たりする","Kadang-kadang melakukan","KK (Ta) + り + KK (Ta) + りする"],
    ["～ほうがいい","Lebih baik melakukan","KK (Ta) + ほうがいい"],
    ["～ないほうがいい","Lebih baik tidak","KK (Nai) + ほうがいい"],
    ["～のが好き","Suka melakukan","KK (Kamus) + のが好き"],
    ["～のが上手/下手","Pandai / Tidak pandai","KK (Kamus) + のが上手/下手"],
    ["～方","Cara melakukan","KK (Masu) + 方"],
    ["～になる","Menjadi","KB/KS-na + になる"],
    ["～にする","Memutuskan memilih","KB/KS-na + にする"],
    ["な(禁止)","Jangan lakukan (larangan)","KK (Kamus) + な"],
    ["～と思う","Berpikir bahwa","KK/KS (Biasa) + と思う"],
    ["～と言う","Berkata bahwa","KK/KS (Biasa) + と言う"],
    ["～の","Pertanyaan / Penekanan","KK/KS (Biasa) + の"],
    ["～んです","Penjelasan (karena)","KK/KS (Biasa) + んです"],
    ["ね","Partikel akhir (mencari persetujuan)","Kal + ね"],
    ["よ","Partikel akhir (penekanan/informasi)","Kal + よ"],
    ["まだ～ていません","Belum dilakukan","まだ + KK (Te) + いません"],
    ["もう(完了)","Sudah (selesai)","もう + KK (Ta)"],
  ],
  N4: [
    ["～てあげる","Melakukan untuk orang lain","KK (Te) + あげる"],
    ["～てくれる","Seseorang melakukan untuk saya","KK (Te) + くれる"],
    ["～てもらう","Menerima (bantuan)","KK (Te) + もらう"],
    ["～てしまう","Terlanjur / selesai (disayangkan)","KK (Te) + しまう"],
    ["～ておく","Melakukan di awal/persiapan","KK (Te) + おく"],
    ["～てある","Keadaan hasil (sengaja)","KK (Te) + ある"],
    ["～てみる","Mencoba melakukan","KK (Te) + みる"],
    ["～すぎる","Terlalu (berlebihan)","KK (Masu) / KS-i (i) + すぎる"],
    ["～やすい","Mudah dilakukan","KK (Masu) + やすい"],
    ["～にくい","Sulit dilakukan","KK (Masu) + にくい"],
    ["～なければならない","Harus dilakukan","KK (Nai) + ければならない"],
    ["～なくてはならない","Harus dilakukan (alternatif)","KK (Nai) + くてはならない"],
    ["～なくてもいい","Tidak perlu dilakukan","KK (Nai) + くてもいい"],
    ["～と(条件)","Kalau (akibat alami)","KK/KS + と"],
    ["～たら","Kalau (setelah terjadi)","KK (Ta) + ら"],
    ["～ば","Kalau (syarat)","KK (Ba) + ば"],
    ["～なら","Kalau (topik)","KB/KS-na + なら"],
    ["～ながら","Sambil (2 kegiatan)","KK (Masu) + ながら"],
    ["～てから","Setelah (urutan)","KK (Te) + から"],
    ["～そうだ(様態)","Sepertinya (pengamatan)","KK (Masu) / KS-i + そうだ"],
    ["～らしい","Sepertinya (ciri khas)","KK/KS (Biasa) + らしい"],
    ["～ほど","Sampai-sampai/sebanyak","KK/KS + ほど"],
    ["～しか","Hanya (dengan negatif)","KB + しか + Negatif"],
    ["～つもり","Berniat / berencana","KK (Kamus) + つもり"],
    ["～ことにする","Memutuskan untuk","KK (Kamus) + ことにする"],
    ["～ことになる","Menjadi (keputusan)","KK (Kamus) + ことになる"],
    ["～ようになる","Menjadi bisa (perubahan)","KK (Kamus) + ようになる"],
    ["～ようにする","Berusaha melakukan","KK (Kamus) + ようにする"],
    ["～てほしい","Mau (saya) lakukan/dilakukan","KK (Te) + ほしい"],
    ["～れる/られる(受身)","Bentuk pasif (dikenai)","KK (Nai) + れる/られる"],
    ["～ている(経験)","Pernah/ sudah (pengalaman)","KK (Ta) + ことがある"],
    ["～し","Alasan (daftar)","KK/KS + し"],
    ["まるで～みたい","Bagaikan / seolah-olah","まるで + KB + みたい"],
    ["～かもしれない","Mungkin / bisa jadi","KK/KS (Biasa) + かもしれない"],
    ["～はず","Seharusnya (dugaan kuat)","KK/KS (Biasa) + はず"],
    ["～のに(逆接)","Padahal / meskipun","KK/KS (Biasa) + のに"],
    ["～かぎりで","Saking ~nya","KK/KS (Biasa) + かぎり"],
    ["～たいと思う","Berniat / ingin (pikiran)","KK (Masu) + たいと思う"],
    ["～ようと思う","Berniat mencoba","KK (Volitional) + と思う"],
    ["～について","Mengenai / tentang","KB + について"],
    ["～によって","Oleh / berdasarkan","KB + によって"],
    ["～ではないか","Bukan? (ajakan setuju)","KK/KS + ではないか"],
    ["～について","Tentang / mengenai","KB + について"],
    ["～にとって","Bagi / untuk (perspektif)","KB + にとって"],
    ["～にたいして","Terhadap / dibanding","KB + にたいして"],
    ["～について","Mengenai","KB + について"],
    ["～によると","Menurut","KB + によると"],
    ["～までに","Sebelum (batas waktu)","KK (Kamus) + までに"],
  ],
};

// I would continue with N3, N2, N1 but the heredoc is long
// For now, generate just N5 and N4 to test

const levelOrder = ["N5", "N4", "N3", "N2", "N1"];
const families = {
  "～です": "Kopula", "～はありません": "Kopula", "～ます": "Bentuk Kata Kerja",
  "～てください": "Perintah", "～たい": "Keinginan", "～から": "Sebab-Akibat",
  "～と": "Kondisional", "～ながら": "Waktu", "～そうだ": "Dugaan",
  "～れる": "Bentuk Kata Kerja", "～られる": "Bentuk Kata Kerja",
};

let items = [];
const counts = {N5:0, N4:0, N3:0, N2:0, N1:0};

for (const lvl of levelOrder) {
  const list = grammarData[lvl] || [];
  for (const [title, meaning, formation] of list) {
    counts[lvl]++;
    
    // Determine family
    let family = "";
    for (const [key, val] of Object.entries(families)) {
      if (title.startsWith(key) || key.startsWith(title.substring(0,3))) {
        family = val; break;
      }
    }
    
    const slug = lvl.toLowerCase() + "-" + title.replace(/[～～～\s()（）]/g, "").substring(0, 30).toLowerCase();
    
    items.push({
      id: crypto.randomUUID(),
      title, meaning, formation,
      formation_furigana: "",
      formation_romaji: "",
      jlpt_level: lvl,
      slug,
      order: counts[lvl],
      related_grammar: [],
      grammar_family: family || null,
      notes: "",
      examples: []
    });
  }
}

const output = {
  metadata: {
    version: "1.0",
    description: "NihongoRoute JLPT Grammar Dataset - Curated from Scratch",
    created: new Date().toISOString(),
    total: items.length,
    source: "Curated based on Minna no Nihongo, Genki, Shin Kanzen Master, Sou Matome",
    distribution: counts,
    target_distribution: { N5: 60, N4: 100, N3: 120, N2: 150, N1: 150 }
  },
  grammar: items
};

fs.writeFileSync("data/grammar.json", JSON.stringify(output, null, 2), "utf8");
console.log("Generated: data/grammar.json");
console.log("Total:", items.length);
console.log("Distribution:", JSON.stringify(counts));
