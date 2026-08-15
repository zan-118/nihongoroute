/**
 * @file landing-faq.ts
 * @description Static FAQ data for landing page UI accordion and SEO JSON-LD structured data.
 * @module LandingFaqConstants
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export const LANDING_FAQ_ITEMS: FaqItem[] = [
  {
    question: "Saya pemula total dan belum hafal huruf sama sekali, harus mulai dari mana?",
    answer:
      "Tenang, kamu bisa mulai langsung dari nol! Buka menu Pusat Peralatan > Kana Master untuk menghafal Hiragana dan Katakana lewat tabel interaktif dan latihan guratan. Setelah hafal, kamu bisa langsung masuk ke Jalur Belajar JLPT N5 untuk mempelajari tata bahasa dan kosakata dasar pertamamu secara bertahap.",
  },
  {
    question: "Apa bedanya NihongoRoute dengan aplikasi seperti Duolingo atau Anki?",
    answer:
      "NihongoRoute menggabungkan materi kurikulum terstruktur dan hafalan cerdas dalam Bahasa Indonesia. Dibanding Duolingo, materi di sini disusun berbasis standar resmi JLPT (N5–N1) dengan penjelasan tata bahasa mendalam. Dibanding Anki, kamu tidak perlu repot menyusun atau mencari deck sendiri karena ribuan kosakata, kanji, audio, dan contoh kalimat sudah tertata siap pakai.",
  },
  {
    question: "Apakah kurikulum dan soal latihannya benar-benar sesuai standar resmi JLPT?",
    answer:
      "Ya! Materi dan latihan disusun selaras dengan standar Japan Educational Exchanges and Services (JEES) & The Japan Foundation, mencakup 4 pilar utama: Moji-Goi (Kosakata), Bunpou (Tata Bahasa), Dokkai (Membaca), dan Choukai (Menyimak), lengkap dengan simulasi ujian CBT berbatas waktu resmi.",
  },
  {
    question: "Bagaimana cara menggunakan fitur Offline saat tidak ada kuota internet?",
    answer:
      "NihongoRoute berbasis Progressive Web App (PWA). Cukup pasang website ini ke layar utama HP kamu (Add to Home Screen). Setelah halaman materi atau kartu dibuka sekali, data tersimpan di penyimpanan browser lokal (IndexedDB) sehingga kamu bisa terus belajar di mana saja tanpa kuota. Progres belajarmu akan otomatis disinkronkan ke cloud saat online kembali.",
  },
  {
    question: "Apakah ada fitur untuk melatih kemampuan mendengar (listening) dan pelafalan?",
    answer:
      "Ada! Kamu bisa menggunakan Pustaka Listening untuk menyimak percakapan situasi nyata, Latihan Shadowing untuk menirukan intonasi penutur asli Jepang secara langsung, serta Latihan Dikte (Dictation) untuk mengasah ketajaman mendengar aksara.",
  },
  {
    question: "Kenapa platform selengkap ini 100% gratis dan tanpa iklan? Apakah nantinya bakal ada paywall?",
    answer:
      "NihongoRoute adalah proyek nirlaba independen yang dibangun dengan misi menyediakan akses pendidikan bahasa Jepang yang setara, bersih, dan berkualitas bagi seluruh masyarakat Indonesia. Tidak ada fitur yang dikunci, tidak ada sistem langganan berbayar, dan tidak ada iklan popup yang mengganggu fokus belajarmu.",
  },
];
