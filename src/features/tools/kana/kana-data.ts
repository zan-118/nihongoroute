/**
 * @file kana-data.ts
 * @description Dataset static tabel karakter Jepang Hiragana dan Katakana (terbagi menjadi Seion, Dakuon, dan Yoon) beserta transliterasi Romaji.
 */

// ==========================================
// DATA UTAMA TABEL KANA (HIRAGANA & KATAKANA)
// ==========================================

/**
 * Static dataset for Japanese kana characters.
 * Maps Hiragana, Katakana, and Romaji equivalents.
 * Divided by phonetic categories.
 */
export const KANA_DATA = {
 /**
 * Seion: Basic unvoiced sounds.
 */
 seion: {
 // Empty strings represent non-existent sounds in modern Japanese grid.
 hiragana: [
 ["あ", "い", "う", "え", "お"],
 ["か", "き", "く", "け", "こ"],
 ["さ", "し", "す", "せ", "そ"],
 ["た", "ち", "つ", "て", "と"],
 ["な", "に", "ぬ", "ね", "の"],
 ["は", "ひ", "ふ", "へ", "ほ"],
 ["ま", "み", "む", "め", "も"],
 ["や", "", "ゆ", "", "よ"],
 ["ら", "り", "る", "れ", "ろ"],
 ["わ", "", "", "", "を"],
 ["ん", "", "", "", ""],
 ],
 katakana: [
 ["ア", "イ", "ウ", "エ", "オ"],
 ["カ", "キ", "ク", "ケ", "コ"],
 ["サ", "シ", "ス", "セ", "ソ"],
 ["タ", "チ", "ツ", "テ", "ト"],
 ["ナ", "ニ", "ヌ", "ネ", "ノ"],
 ["ハ", "ヒ", "フ", "ヘ", "ホ"],
 ["マ", "ミ", "ム", "メ", "モ"],
 ["ヤ", "", "ユ", "", "よ"],
 ["ラ", "リ", "ル", "レ", "ロ"],
 ["ワ", "", "", "", "ヲ"],
 ["ン", "", "", "", ""],
 ],
 romaji: [
 ["a", "i", "u", "e", "o"],
 ["ka", "ki", "ku", "ke", "ko"],
 ["sa", "shi", "su", "se", "so"],
 ["ta", "chi", "tsu", "te", "to"],
 ["na", "ni", "nu", "ne", "no"],
 ["ha", "hi", "fu", "he", "ho"],
 ["ma", "mi", "mu", "me", "mo"],
 ["ya", "", "yu", "", "yo"],
 ["ra", "ri", "ru", "re", "ro"],
 ["wa", "", "", "", "wo"],
 ["n", "", "", "", ""],
 ],
 },
 /**
 * Dakuon: Voiced sounds (with dakuten/handakuten).
 */
 dakuon: {
 hiragana: [
 ["が", "ぎ", "ぐ", "げ", "ご"],
 ["ざ", "じ", "ず", "ぜ", "ぞ"],
 ["だ", "ぢ", "づ", "で", "ど"],
 ["ば", "bi", "ぶ", "べ", "ぼ"],
 ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"],
 ],
 katakana: [
 ["ガ", "ギ", "グ", "ゲ", "ゴ"],
 ["ザ", "ジ", "ズ", "ゼ", "ゾ"],
 ["ダ", "ヂ", "ヅ", "デ", "ド"],
 ["バ", "ビ", "ブ", "ベ", "ボ"],
 ["パ", "ピ", "プ", "ペ", "ポ"],
 ],
 romaji: [
 ["ga", "gi", "gu", "ge", "go"],
 ["za", "ji", "zu", "ze", "zo"],
 ["da", "ji", "zu", "de", "do"],
 ["ba", "bi", "bu", "be", "bo"],
 ["pa", "pi", "pu", "pe", "po"],
 ],
 },
 /**
 * Yoon: Contracted sounds (digraphs with small ya/yu/yo).
 */
 yoon: {
 hiragana: [
 ["きゃ", "きゅ", "きょ"],
 ["しゃ", "しゅ", "しょ"],
 ["ちゃ", "ちゅ", "ちょ"],
 ["にゃ", "にゅ", "にょ"],
 ["ひゃ", "ひゅ", "ひょ"],
 ["みゃ", "みゅ", "みょ"],
 ["りゃ", "りゅ", "りょ"],
 ["ぎゃ", "ぎゅ", "ぎょ"],
 ["じゃ", "じゅ", "じょ"],
 ["びゃ", "びゅ", "びょ"],
 ["ぴゃ", "ぴゅ", "ぴょ"],
 ],
 katakana: [
 ["キャ", "キュ", "キョ"],
 ["シャ", "シュ", "ショ"],
 ["チャ", "チュ", "チョ"],
 ["ニャ", "ニュ", "ニョ"],
 ["ヒャ", "ヒュ", "ヒョ"],
 ["ミャ", "ミュ", "ミョ"],
 ["リャ", "リュ", "リョ"],
 ["ギャ", "ギュ", "ギョ"],
 ["ジャ", "ジュ", "ジョ"],
 ["ビャ", "ビュ", "ビョ"],
 ["ピャ", "ピュ", "ピュ"],
 ],
 romaji: [
 ["kya", "kyu", "kyo"],
 ["sha", "shu", "sho"],
 ["cha", "chu", "cho"],
 ["nya", "nyu", "nyo"],
 ["hya", "hyu", "hyo"],
 ["mya", "myu", "myo"],
 ["rya", "ryu", "ryo"],
 ["gya", "gyu", "gyo"],
 ["ja", "ju", "jo"],
 ["bya", "byu", "byo"],
 ["pya", "pyu", "pyo"],
 ],
 },
};

// ==========================================
// DEFINISI TIPE DATA (TYPES)
// ==========================================

/**
 * Target Japanese writing system type.
 */
export type KanaType = "hiragana" | "katakana";

/**
 * Phonetic category of kana characters.
 */
export type KanaCategory = "seion" | "dakuon" | "yoon";