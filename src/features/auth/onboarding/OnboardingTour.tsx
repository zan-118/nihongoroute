"use client";

/**
 * @file OnboardingTour.tsx
 * @description Page-aware onboarding tour that introduces what users can do on each route.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import {
 ArrowRight,
 BadgeCheck,
 BookOpen,
 Brain,
 Check,
 Clipboard,
 Compass,
 FileText,
 Gauge,
 GraduationCap,
 Headphones,
 HelpCircle,
 Home,
 LayoutGrid,
 Keyboard,
 Book,
 Lightbulb,
 ListChecks,
 IconType,
 Edit,
 PenTool,
 Search,
 Settings,
 Share2,
 Shield,
 Sparkles,
 Target,
 TimerReset,
 Trophy,
 Users,
 Volume2,
 Wand2,
 X,
} from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Tour step configuration.
 */
interface TourStep {
 title: string;
 description: string;
 icon: ReactNode;
 targetSelectors?: string[];
}

/**
 * Spotlight dimensions and position.
 */
interface SpotlightRect {
 top: number;
 left: number;
 right: number;
 bottom: number;
 width: number;
 height: number;
}

/**
 * Tooltip dimensions.
 */
interface TooltipSize {
 width: number;
 height: number;
}

/**
 * Tooltip layout style and placement.
 */
interface TooltipLayout {
 style: CSSProperties;
 placement: "above" | "below" | "left" | "right" | "center";
}

/**
 * Page tour configuration.
 */
interface PageTour {
 id: string;
 match: RegExp;
 eyebrow: string;
 title: string;
 intro: string;
 steps: TourStep[];
 cta?: string;
}

const TOUR_DELAY_MS = 900;
const SPOTLIGHT_PADDING = 10;
const TOOLTIP_MARGIN = 16;
const TOOLTIP_WIDTH = 420;
const TOOLTIP_HEIGHT_ESTIMATE = 248;
const MOBILE_BREAKPOINT = 640;
const TOUR_SEEN_PREFIX = "nihongoroute_page_tour_seen_v2:";
const TOUR_SKIP_ALL_KEY = "nihongoroute_page_tour_skip_all_v2";

const disabledPathPatterns = [
 /^\/api(?:\/|$)/,
 /^\/forgot-password(?:\/|$)/,
 /^\/login(?:\/|$)/,
 /^\/onboarding(?:\/|$)/,
 /^\/privacy(?:\/|$)/,
 /^\/studio(?:\/|$)/,
 /^\/terms(?:\/|$)/,
 /^\/update-password(?:\/|$)/,
 /^\/exams\/[^/]+(?:\/|$)/,
];

/**
 * Render Lucide icon with default styles.
 */
const icon = (Icon: IconType, className = "text-primary") => (
 <Icon aria-hidden="true" className={className} size={30} strokeWidth={2.25} />
);

const pageTours: PageTour[] = [
 {
 id: "home",
 match: /^\/$/,
 eyebrow: "Pintu masuk",
 title: "Mulai dari sini",
 intro: "Halaman depan membantu kamu masuk ke jalur belajar yang paling pas.",
 cta: "Siap masuk",
 steps: [
 {
 title: "Masuk ke ruang belajar",
 description: "Gunakan aksi utama untuk lanjut ke dashboard, login, atau mulai sebagai pelajar baru.",
 icon: icon(Compass),
 },
 {
 title: "Kenali jalur JLPT",
 description: "Lihat gambaran materi, level, dan alat bantu sebelum memilih rute belajar.",
 icon: icon(GraduationCap, "text-secondary"),
 },
 {
 title: "Simpan progres",
 description: "Buat akun saat siap agar riwayat latihan, review, dan target belajarmu aman.",
 icon: icon(Shield, "text-success"),
 },
 ],
 },
 {
 id: "lesson-detail",
 match: /^\/courses\/[^/]+\/[^/]+$/,
 eyebrow: "Materi kursus",
 title: "Pelajari satu topik sampai tuntas",
 intro: "Halaman ini berisi materi inti, contoh, dan aktivitas untuk satu pelajaran.",
 cta: "Mulai belajar",
 steps: [
 {
 title: "Baca struktur materi",
 description: "Ikuti penjelasan utama, contoh kalimat, kosakata, dan catatan penting secara berurutan.",
 icon: icon(BookOpen),
 },
 {
 title: "Gunakan latihan di dalam halaman",
 description: "Kerjakan kuis, drill, atau aktivitas yang tersedia untuk mengunci pemahaman.",
 icon: icon(ListChecks, "text-success"),
 },
 {
 title: "Tandai progres",
 description: "Saat selesai, lanjutkan ke pelajaran berikutnya agar rute belajarmu tetap rapi.",
 icon: icon(Check, "text-secondary"),
 },
 ],
 },
 {
 id: "course-category",
 match: /^\/courses\/[^/]+$/,
 eyebrow: "Jalur kursus",
 title: "Pilih urutan belajar",
 intro: "Gunakan halaman ini untuk melihat isi jalur dan menentukan pelajaran berikutnya.",
 steps: [
 {
 title: "Scan daftar pelajaran",
 description: "Lihat topik yang tersedia dan pilih materi yang sesuai dengan posisi belajarmu.",
 icon: icon(LayoutGrid),
 },
 {
 title: "Ikuti rute yang disarankan",
 description: "Mulai dari topik dasar, lalu naik bertahap supaya grammar, vocab, dan kanji nyambung.",
 icon: icon(Compass, "text-secondary"),
 },
 {
 title: "Latihan setelah belajar",
 description: "Gunakan exam, review, dan tools untuk menguji materi yang baru kamu buka.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "courses",
 match: /^\/courses$/,
 eyebrow: "Kursus",
 title: "Pilih jalur belajar",
 intro: "Semua rute utama dikumpulkan di sini agar kamu mudah memilih level.",
 steps: [
 {
 title: "Bandingkan level",
 description: "Pilih jalur JLPT atau kategori belajar yang paling cocok dengan targetmu.",
 icon: icon(GraduationCap),
 },
 {
 title: "Buka detail rute",
 description: "Masuk ke kategori untuk melihat daftar pelajaran, urutan, dan cakupan materinya.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Sambungkan dengan ujian",
 description: "Setelah beberapa pelajaran, pakai simulasi dan drill untuk mengecek kesiapanmu.",
 icon: icon(Clipboard, "text-success"),
 },
 ],
 },
 {
 id: "dashboard",
 match: /^\/dashboard$/,
 eyebrow: "Pusat belajar",
 title: "Kelola ritme harian",
 intro: "Dashboard adalah tempat melihat progres, rekomendasi belajar, rute harian, titik lemah, pencapaian, dan pengaturan.",
 steps: [
 {
 title: "Lihat fokus hari ini",
 description: "Tab Beranda menampilkan rekomendasi langkah selanjutnya, rute harian, ringkasan titik lemah, dan review yang jatuh tempo.",
 icon: icon(Home),
 },
 {
 title: "Pantau progres",
 description: "Buka tab progres untuk melihat XP, streak, statistik, timeline belajar, dan perkembangan detailmu.",
 icon: icon(Gauge, "text-secondary"),
 },
 {
 title: "Atur data belajar",
 description: "Tab setelan membantu ekspor, impor, reset, dan sinkronisasi sesuai kebutuhanmu.",
 icon: icon(Settings, "text-success"),
 },
 ],
 },
 {
 id: "exams",
 match: /^\/exams$/,
 eyebrow: "Simulasi",
 title: "Uji kesiapanmu",
 intro: "Halaman exam dipakai untuk memilih latihan dan simulasi tanpa mengganggu sesi ujian aktif.",
 cta: "Pilih ujian",
 steps: [
 {
 title: "Pilih paket latihan",
 description: "Cari ujian berdasarkan level, cakupan, atau tujuan latihan yang ingin kamu ukur.",
 icon: icon(Clipboard),
 },
 {
 title: "Baca aturan sebelum mulai",
 description: "Periksa durasi, jumlah soal, dan fokus materi agar simulasi terasa realistis.",
 icon: icon(TimerReset, "text-secondary"),
 },
 {
 title: "Evaluasi hasil",
 description: "Gunakan hasil ujian untuk menentukan pelajaran atau drill yang perlu diulang.",
 icon: icon(Target, "text-success"),
 },
 ],
 },

 {
 id: "library",
 match: /^\/library$/,
 eyebrow: "Perpustakaan",
 title: "Cari referensi belajar",
 intro: "Book menyimpan materi rujukan untuk vocab, kanji, grammar, reading, listening, dan cheatsheet.",
 steps: [
 {
 title: "Pilih koleksi",
 description: "Masuk ke kategori yang kamu butuhkan: kosakata, kanji, grammar, reading, atau listening.",
 icon: icon(Book),
 },
 {
 title: "Gunakan pencarian",
 description: "Filter dan cari item spesifik saat kamu ingin mengulang materi tertentu.",
 icon: icon(Search, "text-secondary"),
 },
 {
 title: "Hubungkan ke latihan",
 description: "Setelah membaca referensi, lanjutkan ke review, flashcards, atau tools yang sesuai.",
 icon: icon(Brain, "text-success"),
 },
 ],
 },
 {
 id: "cheatsheet-detail",
 match: /^\/library\/cheatsheet\/[^/]+$/,
 eyebrow: "Cheatsheet",
 title: "Baca ringkasan praktis",
 intro: "Halaman ini membantu kamu membuka referensi cepat untuk pola, tabel, atau daftar penting.",
 steps: [
 {
 title: "Scan poin utama",
 description: "Gunakan ringkasan untuk mengingat pola penting tanpa membaca ulang materi panjang.",
 icon: icon(FileText),
 },
 {
 title: "Cocokkan dengan contoh",
 description: "Bandingkan rumus atau daftar dengan contoh kalimat agar penggunaannya jelas.",
 icon: icon(Lightbulb, "text-secondary"),
 },
 {
 title: "Simpan untuk review",
 description: "Kembali ke cheatsheet ini saat latihan atau sebelum simulasi ujian.",
 icon: icon(BadgeCheck, "text-success"),
 },
 ],
 },
 {
 id: "cheatsheet",
 match: /^\/library\/cheatsheet$/,
 eyebrow: "Cheatsheet",
 title: "Ambil referensi cepat",
 intro: "Kumpulan ringkasan untuk membuka pola penting dalam waktu singkat.",
 steps: [
 {
 title: "Pilih topik rujukan",
 description: "Cari tabel, pola, atau daftar yang ingin kamu pakai saat belajar dan latihan.",
 icon: icon(FileText),
 },
 {
 title: "Buka detailnya",
 description: "Masuk ke satu cheatsheet untuk membaca contoh, catatan, dan format pemakaian.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Pakai sebagai pengingat",
 description: "Gunakan cheatsheet untuk review cepat sebelum drill, reading, atau ujian.",
 icon: icon(TimerReset, "text-success"),
 },
 ],
 },
 {
 id: "grammar-detail",
 match: /^\/library\/grammar\/[^/]+$/,
 eyebrow: "Grammar",
 title: "Bedah satu pola grammar",
 intro: "Halaman detail grammar membantu kamu memahami makna, bentuk, dan konteks pemakaian.",
 steps: [
 {
 title: "Mulai dari pola",
 description: "Perhatikan struktur kalimat, nuansa, dan level JLPT sebelum masuk contoh.",
 icon: icon(Clipboard),
 },
 {
 title: "Bandingkan contoh",
 description: "Baca contoh kalimat untuk melihat kapan pola ini terdengar natural.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Latih produksi kalimat",
 description: "Coba susun kalimat sendiri atau buka sentence builder untuk latihan lanjutan.",
 icon: icon(Edit, "text-success"),
 },
 ],
 },
 {
 id: "grammar",
 match: /^\/library\/grammar$/,
 eyebrow: "Grammar",
 title: "Temukan pola kalimat",
 intro: "Gunakan daftar grammar untuk mencari pola berdasarkan level dan kebutuhan belajar.",
 steps: [
 {
 title: "Filter berdasarkan level",
 description: "Mulai dari level JLPT atau topik yang sedang kamu pelajari.",
 icon: icon(Search),
 },
 {
 title: "Buka detail pola",
 description: "Masuk ke halaman grammar untuk membaca struktur, arti, dan contoh kalimat.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Latih dengan konteks",
 description: "Setelah paham pola, gunakan reading, writing, atau sentence builder untuk latihan.",
 icon: icon(Brain, "text-success"),
 },
 ],
 },
 {
 id: "kanji-detail",
 match: /^\/library\/kanji\/[^/]+$/,
 eyebrow: "Kanji",
 title: "Kenali satu kanji",
 intro: "Detail kanji membantu kamu mengingat bentuk, bacaan, arti, dan kosakata terkait.",
 steps: [
 {
 title: "Cek bacaan dan makna",
 description: "Perhatikan onyomi, kunyomi, arti, dan level agar kanji mudah dikaitkan.",
 icon: icon(BadgeCheck),
 },
 {
 title: "Pelajari komponen",
 description: "Gunakan radikal, stroke, dan mnemonic untuk membuat ingatan visual lebih kuat.",
 icon: icon(PenTool, "text-secondary"),
 },
 {
 title: "Lihat vocab terkait",
 description: "Hubungkan kanji dengan kata nyata supaya tidak berhenti di hafalan bentuk.",
 icon: icon(Book, "text-success"),
 },
 ],
 },
 {
 id: "kanji",
 match: /^\/library\/kanji$/,
 eyebrow: "Kanji",
 title: "Cari dan pilih kanji",
 intro: "Daftar kanji membantu kamu menelusuri karakter berdasarkan level, arti, atau bacaan.",
 steps: [
 {
 title: "Gunakan filter",
 description: "Saring kanji berdasarkan JLPT, frekuensi, atau kata kunci yang kamu cari.",
 icon: icon(Search),
 },
 {
 title: "Buka detail karakter",
 description: "Masuk ke halaman detail untuk membaca stroke, radikal, dan contoh kosakata.",
 icon: icon(PenTool, "text-secondary"),
 },
 {
 title: "Latih kemiripan bentuk",
 description: "Jika bentuknya mirip, gunakan tool kanji similarity untuk membedakan detailnya.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "listening-detail",
 match: /^\/library\/listening\/[^/]+$/,
 eyebrow: "Listening",
 title: "Latih pendengaran aktif",
 intro: "Halaman listening membantu kamu mendengar, membaca transkrip, dan menguji pemahaman.",
 steps: [
 {
 title: "Putar audio bertahap",
 description: "Dengarkan beberapa kali sebelum membuka semua bantuan teks.",
 icon: icon(Volume2),
 },
 {
 title: "Ikuti transkrip",
 description: "Gunakan transkrip untuk menangkap kata, partikel, dan pola kalimat yang lewat cepat.",
 icon: icon(Headphones, "text-secondary"),
 },
 {
 title: "Cek pemahaman",
 description: "Kerjakan pertanyaan atau latihan dictation jika tersedia untuk mengunci hasil latihan.",
 icon: icon(ListChecks, "text-success"),
 },
 ],
 },
 {
 id: "listening",
 match: /^\/library\/listening$/,
 eyebrow: "Listening",
 title: "Pilih latihan mendengar",
 intro: "Koleksi listening membantu kamu melatih telinga dari potongan audio yang terarah.",
 steps: [
 {
 title: "Pilih level dan topik",
 description: "Mulai dari materi yang durasi dan kosakatanya sesuai kemampuanmu.",
 icon: icon(Headphones),
 },
 {
 title: "Buka sesi audio",
 description: "Masuk ke detail untuk mendengar audio, membaca transkrip, dan memahami konteks.",
 icon: icon(Volume2, "text-secondary"),
 },
 {
 title: "Ulangi bagian sulit",
 description: "Catat kata yang tidak tertangkap, lalu masukkan ke review atau dictionary.",
 icon: icon(TimerReset, "text-success"),
 },
 ],
 },
 {
 id: "reading-detail",
 match: /^\/library\/reading\/[^/]+$/,
 eyebrow: "Reading",
 title: "Baca dengan konteks",
 intro: "Halaman reading memberi teks, bantuan bacaan, kosakata, dan latihan pemahaman.",
 steps: [
 {
 title: "Baca paragraf utama",
 description: "Mulai dari memahami ide besar, baru masuk ke detail kosakata dan grammar.",
 icon: icon(BookOpen),
 },
 {
 title: "Gunakan bantuan bahasa",
 description: "Manfaatkan furigana, catatan vocab, atau audio jika tersedia.",
 icon: icon(Book, "text-secondary"),
 },
 {
 title: "Uji pemahaman",
 description: "Jawab pertanyaan atau ulangi bagian sulit untuk melatih membaca cepat dan akurat.",
 icon: icon(Check, "text-success"),
 },
 ],
 },
 {
 id: "reading",
 match: /^\/library\/reading$/,
 eyebrow: "Reading",
 title: "Pilih bacaan bertahap",
 intro: "Koleksi reading membantu kamu membaca teks Jepang sesuai level.",
 steps: [
 {
 title: "Cari teks yang pas",
 description: "Pilih bacaan berdasarkan level, topik, atau panjang teks yang kamu inginkan.",
 icon: icon(Search),
 },
 {
 title: "Buka detail bacaan",
 description: "Masuk ke satu bacaan untuk melihat teks, kosakata, dan pertanyaan pemahaman.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Kumpulkan kata baru",
 description: "Tambahkan kata sulit ke review atau cari artinya di dictionary.",
 icon: icon(Brain, "text-success"),
 },
 ],
 },
 {
 id: "vocab-detail",
 match: /^\/library\/vocab\/[^/]+$/,
 eyebrow: "Kosakata",
 title: "Dalami satu kata",
 intro: "Detail vocab membantu kamu memahami arti, bacaan, contoh, dan pemakaian kata.",
 steps: [
 {
 title: "Cek arti dan bacaan",
 description: "Lihat kana, romaji, arti, kelas kata, dan level agar kata mudah dikenali.",
 icon: icon(BadgeCheck),
 },
 {
 title: "Baca contoh kalimat",
 description: "Gunakan contoh untuk memahami konteks, partikel, dan pasangan kata yang natural.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Masukkan ke review",
 description: "Jika kata ini penting, latih lagi lewat SRS, flashcards, atau drill vocab.",
 icon: icon(Brain, "text-success"),
 },
 ],
 },
 {
 id: "vocab",
 match: /^\/library\/vocab$/,
 eyebrow: "Kosakata",
 title: "Cari kata yang kamu butuhkan",
 intro: "Daftar vocab membantu kamu menemukan kosakata berdasarkan arti, bacaan, atau level.",
 steps: [
 {
 title: "Gunakan pencarian cepat",
 description: "Cari dengan bahasa Indonesia, romaji, kana, atau kanji sesuai data yang kamu punya.",
 icon: icon(Search),
 },
 {
 title: "Buka detail kata",
 description: "Masuk ke detail untuk melihat contoh kalimat dan pemakaian yang lebih lengkap.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Latih kata pilihan",
 description: "Gunakan flashcards atau review untuk mengulang kata yang ingin kamu kuasai.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "review",
 match: /^\/review$/,
 eyebrow: "Review",
 title: "Jaga hafalan tetap hidup",
 intro: "Halaman review membantu kamu mengulang item yang jatuh tempo dengan ritme SRS.",
 steps: [
 {
 title: "Mulai dari due item",
 description: "Kerjakan kartu yang jatuh tempo dulu agar jadwal hafalan tetap sehat.",
 icon: icon(TimerReset),
 },
 {
 title: "Nilai ingatanmu",
 description: "Jawab jujur mudah atau sulit supaya interval review berikutnya lebih akurat.",
 icon: icon(Brain, "text-secondary"),
 },
 {
 title: "Ulangi titik lemah",
 description: "Item yang sering salah bisa dibawa ke weak points atau latihan tambahan.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "settings",
 match: /^\/settings$/,
 eyebrow: "Setelan",
 title: "Atur pengalaman belajar",
 intro: "Setelan dipakai untuk mengelola preferensi, data, dan kenyamanan belajar.",
 steps: [
 {
 title: "Sesuaikan preferensi",
 description: "Atur tampilan, notifikasi, dan opsi belajar sesuai kebiasaanmu.",
 icon: icon(Settings),
 },
 {
 title: "Kelola data",
 description: "Gunakan ekspor, impor, atau sinkronisasi agar progres belajarmu tidak hilang.",
 icon: icon(Shield, "text-secondary"),
 },
 {
 title: "Cek akun",
 description: "Pastikan status akun dan sesi login sesuai sebelum belajar panjang.",
 icon: icon(BadgeCheck, "text-success"),
 },
 ],
 },
 {
 id: "share",
 match: /^\/share$/,
 eyebrow: "Bagikan",
 title: "Tunjukkan progresmu",
 intro: "Halaman share membantu kamu membuat ringkasan progres untuk dibagikan.",
 steps: [
 {
 title: "Pilih data progres",
 description: "Gunakan statistik belajar, streak, level, atau pencapaian yang ingin ditampilkan.",
 icon: icon(Share2),
 },
 {
 title: "Rapikan tampilan",
 description: "Pilih format yang paling cocok sebelum membagikan hasil belajarmu.",
 icon: icon(Sparkles, "text-secondary"),
 },
 {
 title: "Ajak teman belajar",
 description: "Bagikan kartu progres untuk menjaga motivasi atau mengundang teman ikut belajar.",
 icon: icon(Users, "text-success"),
 },
 ],
 },
 {
 id: "social",
 match: /^\/social$/,
 eyebrow: "Komunitas",
 title: "Belajar bersama",
 intro: "Halaman social membantu kamu melihat aktivitas, tantangan, atau koneksi belajar.",
 steps: [
 {
 title: "Lihat aktivitas",
 description: "Pantau update, capaian, atau tantangan yang sedang berjalan.",
 icon: icon(Users),
 },
 {
 title: "Bangun motivasi",
 description: "Gunakan progres bersama sebagai dorongan untuk tetap konsisten.",
 icon: icon(Trophy, "text-secondary"),
 },
 {
 title: "Tetap fokus belajar",
 description: "Ambil ide latihan dari komunitas, lalu kembali ke materi atau review.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "support",
 match: /^\/support$/,
 eyebrow: "Dukungan",
 title: "Bantu pengembangan",
 intro: "Halaman support menjelaskan cara mendukung NihongoRoute dan menemukan kanal bantuan.",
 steps: [
 {
 title: "Baca opsi dukungan",
 description: "Lihat cara kontribusi, donasi, atau dukungan yang tersedia.",
 icon: icon(HelpCircle),
 },
 {
 title: "Laporkan kebutuhan",
 description: "Gunakan kanal bantuan bila ada bug, ide fitur, atau materi yang ingin ditambahkan.",
 icon: icon(Clipboard, "text-secondary"),
 },
 {
 title: "Ikuti perkembangan",
 description: "Pantau update agar kamu tahu fitur dan materi baru yang bisa dicoba.",
 icon: icon(Sparkles, "text-success"),
 },
 ],
 },
 {
 id: "tools-dictionary",
 match: /^\/tools\/dictionary$/,
 eyebrow: "Dictionary",
 title: "Cari arti dengan cepat",
 intro: "Dictionary membantu kamu mencari kata Jepang, romaji, atau arti Indonesia.",
 steps: [
 {
 title: "Masukkan kata kunci",
 description: "Cari memakai kanji, kana, romaji, atau arti yang kamu ingat.",
 icon: icon(Search),
 },
 {
 title: "Baca detail hasil",
 description: "Perhatikan bacaan, arti, kelas kata, contoh, dan relasi kata.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Bawa ke latihan",
 description: "Kata penting bisa kamu ulang lewat flashcards, review, atau text analyzer.",
 icon: icon(Brain, "text-success"),
 },
 ],
 },
 {
 id: "tools-text-analyzer",
 match: /^\/tools\/text-analyzer$/,
 eyebrow: "Text analyzer",
 title: "Bongkar teks Jepang",
 intro: "Text analyzer membantu memecah teks menjadi kata, bacaan, dan petunjuk makna.",
 steps: [
 {
 title: "Tempel teks Jepang",
 description: "Masukkan kalimat, paragraf, atau potongan bacaan yang ingin kamu pahami.",
 icon: icon(FileText),
 },
 {
 title: "Periksa pecahan kata",
 description: "Lihat token, bacaan, dan kandidat arti untuk menemukan bagian yang sulit.",
 icon: icon(Search, "text-secondary"),
 },
 {
 title: "Jadikan bahan review",
 description: "Ambil kosakata penting lalu latih lagi dengan dictionary atau flashcards.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "tools-kana",
 match: /^\/tools\/kana$/,
 eyebrow: "Kana",
 title: "Kuasai hiragana dan katakana",
 intro: "Tool kana membantu kamu membaca, membedakan, dan mengetik kana dengan lebih cepat.",
 steps: [
 {
 title: "Pilih mode latihan",
 description: "Latih hiragana, katakana, atau campuran sesuai titik yang ingin kamu perkuat.",
 icon: icon(Keyboard),
 },
 {
 title: "Jawab cepat dan teliti",
 description: "Gunakan latihan berulang untuk membangun refleks baca dan tulis kana.",
 icon: icon(TimerReset, "text-secondary"),
 },
 {
 title: "Ulangi karakter sulit",
 description: "Fokuskan sesi berikutnya pada kana yang sering tertukar.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "tools-writing",
 match: /^\/tools\/writing$/,
 eyebrow: "Writing",
 title: "Latih menulis aktif",
 intro: "Writing tool membantu kamu menyusun jawaban dan memperbaiki struktur kalimat.",
 steps: [
 {
 title: "Tentukan prompt",
 description: "Pilih atau tulis topik agar latihan menulis punya arah yang jelas.",
 icon: icon(Edit),
 },
 {
 title: "Susun kalimat Jepang",
 description: "Fokus pada grammar, partikel, dan kosakata yang sedang kamu pelajari.",
 icon: icon(Clipboard, "text-secondary"),
 },
 {
 title: "Review hasil",
 description: "Bandingkan masukan dengan materi grammar atau dictionary untuk memperbaiki pola.",
 icon: icon(Check, "text-success"),
 },
 ],
 },
 {
 id: "tools-conjugation",
 match: /^\/tools\/conjugation$/,
 eyebrow: "Conjugation",
 title: "Ubah bentuk kata kerja",
 intro: "Tool conjugation membantu mengecek perubahan bentuk verba dan adjektiva.",
 steps: [
 {
 title: "Masukkan bentuk dasar",
 description: "Cari kata kerja atau adjektiva yang ingin kamu ubah bentuknya.",
 icon: icon(Search),
 },
 {
 title: "Bandingkan pola",
 description: "Lihat bentuk masu, te, ta, negatif, potensial, dan pola lain yang tersedia.",
 icon: icon(Clipboard, "text-secondary"),
 },
 {
 title: "Pakai dalam kalimat",
 description: "Buat contoh sendiri agar perubahan bentuk tidak hanya dihafal sebagai tabel.",
 icon: icon(Edit, "text-success"),
 },
 ],
 },
 {
 id: "tools-particles",
 match: /^\/tools\/particles$/,
 eyebrow: "Particles",
 title: "Pilih partikel yang tepat",
 intro: "Tool particles membantu memahami fungsi partikel dalam konteks kalimat.",
 steps: [
 {
 title: "Baca kalimatnya",
 description: "Perhatikan predikat, topik, objek, arah, dan konteks sebelum memilih partikel.",
 icon: icon(BookOpen),
 },
 {
 title: "Bandingkan pilihan",
 description: "Lihat kenapa satu partikel benar dan pilihan lain terasa kurang pas.",
 icon: icon(Lightbulb, "text-secondary"),
 },
 {
 title: "Ulangi pola sulit",
 description: "Catat pasangan partikel yang sering tertukar untuk dilatih lagi.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "tools-jlpt-drill",
 match: /^\/tools\/jlpt-drill$/,
 eyebrow: "JLPT drill",
 title: "Latihan terarah untuk ujian",
 intro: "JLPT drill membantu kamu mengasah soal sesuai level dan area yang ingin diperkuat.",
 steps: [
 {
 title: "Pilih level",
 description: "Tentukan N5 sampai N1 atau kategori latihan yang tersedia.",
 icon: icon(GraduationCap),
 },
 {
 title: "Kerjakan set soal",
 description: "Jawab dengan ritme ujian agar kamu terbiasa membaca cepat dan akurat.",
 icon: icon(TimerReset, "text-secondary"),
 },
 {
 title: "Pelajari kesalahan",
 description: "Gunakan pembahasan untuk memilih materi yang perlu diulang.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "tools-counter-trainer",
 match: /^\/tools\/counter-trainer$/,
 eyebrow: "Counter trainer",
 title: "Latih kata bantu bilangan",
 intro: "Tool ini membantu memilih counter Jepang yang natural untuk benda berbeda.",
 steps: [
 {
 title: "Pilih kategori benda",
 description: "Perhatikan bentuk, jenis, dan konteks benda sebelum memilih counter.",
 icon: icon(Clipboard),
 },
 {
 title: "Latih pengecualian",
 description: "Beberapa angka berubah bunyi, jadi ulangi pola yang sering salah.",
 icon: icon(Brain, "text-secondary"),
 },
 {
 title: "Pakai dalam kalimat",
 description: "Coba buat contoh sederhana agar counter terasa alami saat dipakai.",
 icon: icon(Edit, "text-success"),
 },
 ],
 },
 {
 id: "tools-kanji-similarity",
 match: /^\/tools\/kanji-similarity$/,
 eyebrow: "Kanji similarity",
 title: "Bedakan kanji mirip",
 intro: "Tool ini membantu membandingkan bentuk kanji yang sering tertukar.",
 steps: [
 {
 title: "Masukkan atau pilih kanji",
 description: "Cari karakter yang kamu rasa mirip atau sering salah baca.",
 icon: icon(Search),
 },
 {
 title: "Perhatikan detail bentuk",
 description: "Bandingkan radikal, stroke, dan posisi komponen kecilnya.",
 icon: icon(PenTool, "text-secondary"),
 },
 {
 title: "Kaitkan dengan vocab",
 description: "Gunakan kata contoh agar perbedaan kanji lebih mudah diingat.",
 icon: icon(Book, "text-success"),
 },
 ],
 },
 {
 id: "tools-sentence-builder",
 match: /^\/tools\/sentence-builder$/,
 eyebrow: "Sentence builder",
 title: "Bangun kalimat Jepang",
 intro: "Sentence builder membantu kamu menyusun kalimat dari pola dan komponen yang tepat.",
 steps: [
 {
 title: "Pilih pola atau tujuan",
 description: "Mulai dari grammar, maksud kalimat, atau komponen yang ingin dilatih.",
 icon: icon(Clipboard),
 },
 {
 title: "Susun bagian kalimat",
 description: "Perhatikan urutan, partikel, bentuk verba, dan kosakata yang dipakai.",
 icon: icon(Edit, "text-secondary"),
 },
 {
 title: "Bandingkan hasil",
 description: "Gunakan masukan untuk memperbaiki kalimat dan menyimpan pola yang berguna.",
 icon: icon(Check, "text-success"),
 },
 ],
 },
 {
 id: "tools-shadowing",
 match: /^\/tools\/shadowing$/,
 eyebrow: "Shadowing",
 title: "Latih pelafalan dan ritme",
 intro: "Shadowing membantu kamu meniru audio Jepang untuk melatih intonasi dan kelancaran.",
 steps: [
 {
 title: "Dengarkan model audio",
 description: "Putar audio beberapa kali untuk menangkap ritme sebelum ikut bicara.",
 icon: icon(Headphones),
 },
 {
 title: "Ikuti dengan suara",
 description: "Ulangi frasa sambil mengejar tempo, jeda, dan intonasi penutur.",
 icon: icon(Volume2, "text-secondary"),
 },
 {
 title: "Ulangi bagian sulit",
 description: "Fokuskan latihan pada frasa yang masih patah atau terlalu lambat.",
 icon: icon(TimerReset, "text-success"),
 },
 ],
 },
 {
 id: "tools-flashcards",
 match: /^\/tools\/flashcards$/,
 eyebrow: "Flashcards",
 title: "Ulang cepat dengan kartu",
 intro: "Flashcards membantu mengulang kosakata, kanji, atau konsep dengan sesi pendek.",
 steps: [
 {
 title: "Pilih deck",
 description: "Mulai dari kumpulan kartu yang sesuai level atau materi yang sedang dipelajari.",
 icon: icon(Book),
 },
 {
 title: "Jawab sebelum membuka",
 description: "Tebak dulu arti atau bacaan agar latihan benar-benar menguji ingatan.",
 icon: icon(Brain, "text-secondary"),
 },
 {
 title: "Tandai tingkat ingatan",
 description: "Gunakan hasilnya untuk menentukan kartu mana yang perlu sering diulang.",
 icon: icon(Target, "text-success"),
 },
 ],
 },
 {
 id: "tools-survival",
 match: /^\/tools\/survival$/,
 eyebrow: "Survival Japanese",
 title: "Siapkan frasa praktis",
 intro: "Tool survival membantu kamu menemukan frasa cepat untuk situasi sehari-hari.",
 steps: [
 {
 title: "Pilih situasi",
 description: "Mulai dari perjalanan, belanja, makan, bertanya arah, atau kondisi darurat.",
 icon: icon(Compass),
 },
 {
 title: "Dengar dan tirukan",
 description: "Gunakan audio atau romanisasi untuk melatih pengucapan sebelum dipakai.",
 icon: icon(Volume2, "text-secondary"),
 },
 {
 title: "Simpan frasa penting",
 description: "Masukkan frasa yang sering dipakai ke review atau catatan pribadi.",
 icon: icon(BadgeCheck, "text-success"),
 },
 ],
 },
 {
 id: "tools-weak-points",
 match: /^\/tools\/weak-points$/,
 eyebrow: "Weak points",
 title: "Perbaiki titik lemah",
 intro: "Tool ini membantu melihat area yang paling sering salah dan butuh latihan ulang.",
 steps: [
 {
 title: "Lihat pola kesalahan",
 description: "Periksa kategori yang paling sering gagal agar sesi belajar lebih terarah.",
 icon: icon(Target),
 },
 {
 title: "Pilih latihan pemulihan",
 description: "Kerjakan drill pendek untuk memperkuat materi yang belum stabil.",
 icon: icon(Brain, "text-secondary"),
 },
 {
 title: "Balik ke materi sumber",
 description: "Jika kesalahan berulang, buka kembali grammar, vocab, kanji, atau lesson terkait.",
 icon: icon(BookOpen, "text-success"),
 },
 ],
 },
 {
 id: "tools",
 match: /^\/tools$/,
 eyebrow: "Tools",
 title: "Pilih alat bantu belajar",
 intro: "Semua utilitas latihan ada di sini, dari dictionary sampai shadowing.",
 steps: [
 {
 title: "Pilih sesuai kebutuhan",
 description: "Gunakan dictionary untuk memahami, drill untuk menguji, dan flashcards untuk mengulang.",
 icon: icon(Wand2),
 },
 {
 title: "Gabungkan dengan materi",
 description: "Buka tools setelah membaca lesson agar latihan terasa langsung terhubung.",
 icon: icon(BookOpen, "text-secondary"),
 },
 {
 title: "Bangun sesi pendek",
 description: "Satu tool selama 5 sampai 10 menit sudah cukup untuk menjaga momentum harian.",
 icon: icon(TimerReset, "text-success"),
 },
 ],
 },
];

const fallbackTourBase = {
 eyebrow: "Panduan halaman",
 title: "Kenali halaman ini",
 intro: "Panduan singkat ini membantu kamu menemukan aksi utama di halaman yang baru dibuka.",
 steps: [
 {
 title: "Scan bagian utama",
 description: "Mulai dari judul, tombol utama, dan panel yang paling menonjol di halaman.",
 icon: icon(Compass),
 },
 {
 title: "Cari aksi belajar",
 description: "Gunakan tombol, filter, tab, atau kartu yang tersedia untuk melanjutkan aktivitas.",
 icon: icon(Search, "text-secondary"),
 },
 {
 title: "Kembali jika perlu",
 description: "Jika belum yakin, buka dashboard, library, atau tools untuk memilih aktivitas lain.",
 icon: icon(Home, "text-success"),
 },
 ],
} satisfies Omit<PageTour, "id" | "match">;

/**
 * Clean trailing slashes from pathname.
 */
function normalizePathname(pathname: string | null): string {
 if (!pathname) return "/";
 const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
 return normalized || "/";
}

/**
 * Generate fallback tour configuration for unmatched routes.
 */
function createFallbackTour(pathname: string): PageTour {
 const pageId = pathname.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "home";

 return {
 ...fallbackTourBase,
 id: `fallback-${pageId}`,
 match: /^.*$/,
 };
}

/**
 * Match route to tour configuration. Return null if route is disabled.
 */
function resolveTour(pathname: string | null): PageTour | null {
 const normalizedPathname = normalizePathname(pathname);

 if (disabledPathPatterns.some((pattern) => pattern.test(normalizedPathname))) {
 return null;
 }

 return pageTours.find((tour) => tour.match.test(normalizedPathname)) ?? createFallbackTour(normalizedPathname);
}

/**
 * Get local storage key for tour.
 */
function getSeenKey(tourId: string) {
 return `${TOUR_SEEN_PREFIX}${tourId}`;
}

/**
 * Read value from local storage. Safe for SSR.
 */
function readStorage(key: string) {
 try {
 return window.localStorage.getItem(key);
 } catch {
 return null;
 }
}

/**
 * Write value to local storage. Safe for SSR.
 */
function writeStorage(key: string, value: string) {
 try {
 window.localStorage.setItem(key, value);
 } catch {
 // Local storage can be blocked by browser privacy settings.
 }
}

/**
 * Restrict value to range.
 */
function clamp(value: number, min: number, max: number) {
 return Math.min(Math.max(value, min), max);
}

/**
 * Check if element is visible and has size.
 */
function isElementUsable(element: HTMLElement) {
 const rect = element.getBoundingClientRect();
 const style = window.getComputedStyle(element);

 return (
 rect.width > 8 &&
 rect.height > 8 &&
 style.display !== "none" &&
 style.visibility !== "hidden" &&
 style.opacity !== "0"
 );
}

/**
 * Find first visible element matching selectors.
 */
function findVisibleElement(selectors: string[]) {
 for (const selector of selectors) {
 try {
 const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
 const visibleElement = elements.find(isElementUsable);

 if (visibleElement) {
 return visibleElement;
 }
 } catch {
 // Ignore selectors that are unsupported in older browser engines.
 }
 }

 return null;
}

/**
 * Convert DOMRect to spotlight coordinates with padding.
 */
function toSpotlightRect(rect: DOMRect): SpotlightRect {
 const top = clamp(rect.top - SPOTLIGHT_PADDING, 12, window.innerHeight - 24);
 const left = clamp(rect.left - SPOTLIGHT_PADDING, 12, window.innerWidth - 24);
 const right = clamp(rect.right + SPOTLIGHT_PADDING, 24, window.innerWidth - 12);
 const bottom = clamp(rect.bottom + SPOTLIGHT_PADDING, 24, window.innerHeight - 12);

 return {
 bottom,
 height: Math.max(24, bottom - top),
 left,
 right,
 top,
 width: Math.max(24, right - left),
 };
}

const defaultStepTargets = [
 [
 "main h1",
 "h1",
 "main header",
 "[data-tour='topbar']",
 "[data-tour='main-content']",
 "main",
 ],
 [
 "[data-tour='dashboard-tabs']",
 "[role='tablist']",
 "[data-tour='library-category-card']",
 "[data-tour='tool-card']",
 "main input",
 "main textarea",
 "main form",
 "main a[href]",
 "main button",
 ],
 [
 "[data-tour='topbar-search']",
 "[data-tour='topbar-search-mobile']",
 "[data-tour='reading-mode']",
 "[data-tour='sidebar-nav']",
 "[data-tour='mobile-nav']",
 "[data-tour='main-content']",
 "main",
 ],
] satisfies string[][];

const routeTargetSelectors: Record<string, string[][]> = {
 "cheatsheet": [
 ["main h1", "h1", "main header"],
 ["a[href^='/library/cheatsheet/']", "main a[href]"],
 ["[data-tour='topbar-search']", "[data-tour='nav-review']", "[data-tour='sidebar-nav']"],
 ],
 "course-category": [
 ["main h1", "h1", "main header"],
 ["a[href*='/courses/']", "main article", "main a[href]"],
 ["[data-tour='nav-exams']", "a[href='/exams']", "[data-tour='sidebar-nav']"],
 ],
 "courses": [
 ["main h1", "h1", "main header"],
 ["a[href^='/courses/']", "main article", "main a[href]"],
 ["[data-tour='nav-exams']", "a[href='/exams']", "[data-tour='sidebar-nav']"],
 ],
 "dashboard": [
 ["[data-tour='dashboard-tab-beranda']", "[data-tour='dashboard-tabs']", "#beranda-panel", "main h1"],
 ["[data-tour='dashboard-tab-progres']", "[data-tour='dashboard-tabs']"],
 ["[data-tour='dashboard-tab-pengaturan']", "[data-tour='dashboard-tabs']", "[data-tour='topbar-search']"],
 ],
 "exams": [
 ["main h1", "h1", "main header"],
 ["a[href^='/exams/']", "main button", "main a[href]"],
 ["[data-tour='nav-library']", "[data-tour='nav-courses']", "[data-tour='sidebar-nav']"],
 ],
 "home": [
 ["main h1", "h1", "main header"],
 ["a[href='/courses']", "a[href='/dashboard']", "main a[href]", "main section"],
 ["a[href='/login']", "a[href='/dashboard']", "main a[href]"],
 ],

 "library": [
 ["main h1", "h1", "main header"],
 ["[data-tour='library-category-card']", "a[href^='/library/']", "a[href='/exams']"],
 ["[data-tour='topbar-search']", "[data-tour='nav-tools']", "[data-tour='sidebar-nav']"],
 ],
 "review": [
 ["main h1", "h1", "main header"],
 ["main button", "[role='button']", "main article", "main section"],
 ["[data-tour='nav-tools']", "[data-tour='nav-library']", "[data-tour='sidebar-nav']"],
 ],
 "settings": [
 ["main h1", "h1", "main header"],
 ["main button", "main input", "main form", "main section"],
 ["[data-tour='topbar']", "[data-tour='reading-mode']", "[data-tour='sidebar-nav']"],
 ],
 "share": [
 ["main h1", "h1", "main header"],
 ["main button", "main article", "main section"],
 ["[data-tour='nav-social']", "[data-tour='sidebar-nav']", "[data-tour='mobile-nav']"],
 ],
 "social": [
 ["main h1", "h1", "main header"],
 ["main article", "main section", "main button"],
 ["[data-tour='nav-share']", "[data-tour='sidebar-nav']", "[data-tour='mobile-nav']"],
 ],
 "support": [
 ["main h1", "h1", "main header"],
 ["main a[href]", "main button", "main section"],
 ["[data-tour='sidebar-nav']", "[data-tour='mobile-nav']", "[data-tour='topbar']"],
 ],
 "tools": [
 ["main h1", "h1", "main header"],
 ["[data-tour='tool-card']", "a[href^='/tools/']", "main a[href]"],
 ["[data-tour='topbar-search']", "[data-tour='nav-library']", "[data-tour='sidebar-nav']"],
 ],
};

/**
 * Get dynamic selectors based on route patterns.
 */
function getDerivedTargets(tourId: string, stepIndex: number) {
 if (tourId.startsWith("tools-")) {
 return [
 ["main h1", "h1", "main header"],
 ["main input", "main textarea", "main form", "canvas", "[role='tablist']", "main button", "main section"],
 ["main button", "[data-tour='topbar-search']", "[data-tour='nav-review']", "[data-tour='sidebar-nav']"],
 ][stepIndex] ?? [];
 }

 if (tourId.endsWith("-detail") || tourId === "lesson-detail") {
 return [
 ["main h1", "h1", "article", "main header"],
 ["main h2", "main section", "main [class*='prose']", "main p"],
 ["[data-tour='topbar-search']", "[data-tour='nav-review']", "[data-tour='nav-tools']", "[data-tour='sidebar-nav']"],
 ][stepIndex] ?? [];
 }

 if (["vocab", "kanji", "grammar", "reading", "listening"].includes(tourId)) {
 return [
 ["main h1", "h1", "main header"],
 ["main input", "main form", `a[href^='/library/${tourId}/']`, "main a[href]"],
 ["[data-tour='topbar-search']", "[data-tour='nav-tools']", "[data-tour='sidebar-nav']"],
 ][stepIndex] ?? [];
 }

 return [];
}

/**
 * Get target selectors for step.
 */
function getStepTargetSelectors(tour: PageTour, stepIndex: number, step: TourStep) {
 return [
 ...(step.targetSelectors ?? []),
 ...(routeTargetSelectors[tour.id]?.[stepIndex] ?? []),
 ...getDerivedTargets(tour.id, stepIndex),
 ...(defaultStepTargets[stepIndex] ?? []),
 "[data-tour='main-content']",
 "main",
 ];
}

/**
 * Calculate tooltip layout style and placement.
 */
function getTooltipLayout(rect: SpotlightRect | null, size: TooltipSize): TooltipLayout {
 if (typeof window === "undefined") {
 return { placement: "center", style: {} };
 }

 const viewportWidth = window.innerWidth;
 const viewportHeight = window.innerHeight;
 const isMobile = viewportWidth < MOBILE_BREAKPOINT;
 const edgeMargin = isMobile ? 12 : 16;
 const width = isMobile ? viewportWidth - edgeMargin * 2 : Math.min(TOOLTIP_WIDTH, viewportWidth - edgeMargin * 2);
 const measuredHeight = Math.min(size.height || TOOLTIP_HEIGHT_ESTIMATE, viewportHeight - edgeMargin * 2);

 if (!rect) {
 return {
 placement: "center",
 style: {
 left: edgeMargin,
 maxHeight: viewportHeight - edgeMargin * 2,
 maxWidth: viewportWidth - edgeMargin * 2,
 top: edgeMargin,
 width,
 },
 };
 }

 const aboveSpace = Math.max(0, rect.top - edgeMargin - TOOLTIP_MARGIN);
 const belowSpace = Math.max(0, viewportHeight - rect.bottom - edgeMargin - TOOLTIP_MARGIN);
 const leftSpace = Math.max(0, rect.left - edgeMargin - TOOLTIP_MARGIN);
 const rightSpace = Math.max(0, viewportWidth - rect.right - edgeMargin - TOOLTIP_MARGIN);

 if (isMobile) {
 const preferBelow = belowSpace >= aboveSpace;
 const placement = preferBelow ? "below" : "above";
 const availableHeight = Math.max(96, preferBelow ? belowSpace : aboveSpace);
 const top = preferBelow
 ? rect.bottom + TOOLTIP_MARGIN
 : Math.max(edgeMargin, rect.top - TOOLTIP_MARGIN - Math.min(measuredHeight, availableHeight));

 return {
 placement,
 style: {
 left: edgeMargin,
 maxHeight: availableHeight,
 maxWidth: viewportWidth - edgeMargin * 2,
 top,
 width,
 },
 };
 }

 const sidePlacementCandidates = [
 { placement: "right" as const, space: rightSpace },
 { placement: "left" as const, space: leftSpace },
 ].filter((candidate) => candidate.space >= width);

 if (sidePlacementCandidates.length > 0) {
 const placement = sidePlacementCandidates.sort((a, b) => b.space - a.space)[0].placement;
 const left = placement === "right" ? rect.right + TOOLTIP_MARGIN : rect.left - TOOLTIP_MARGIN - width;
 const top = clamp(rect.top + rect.height / 2 - measuredHeight / 2, edgeMargin, viewportHeight - measuredHeight - edgeMargin);

 return {
 placement,
 style: {
 left,
 maxHeight: viewportHeight - edgeMargin * 2,
 maxWidth: width,
 top,
 width,
 },
 };
 }

 const preferBelow = belowSpace >= aboveSpace;
 const placement = preferBelow ? "below" : "above";
 const availableHeight = Math.max(128, preferBelow ? belowSpace : aboveSpace);
 const top = preferBelow
 ? rect.bottom + TOOLTIP_MARGIN
 : Math.max(edgeMargin, rect.top - TOOLTIP_MARGIN - Math.min(measuredHeight, availableHeight));
 const left = clamp(rect.left + rect.width / 2 - width / 2, edgeMargin, viewportWidth - width - edgeMargin);

 return {
 placement,
 style: {
 left,
 maxHeight: availableHeight,
 maxWidth: width,
 top,
 width,
 },
 };
}

/**
 * Main onboarding tour component.
 */
export default function OnboardingTour() {
 const pathname = usePathname();
 const tour = useMemo(() => resolveTour(pathname), [pathname]);

 return <OnboardingTourSession key={tour?.id ?? "no-tour"} tour={tour} />;
}

/**
 * Active onboarding tour session.
 */
function OnboardingTourSession({ tour }: { tour: PageTour | null }) {
 const tourId = tour?.id;
 const tooltipRef = useRef<HTMLDivElement | null>(null);
 const [currentStep, setCurrentStep] = useState(0);
 const [isOpen, setIsOpen] = useState(false);
 const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
 const [tooltipSize, setTooltipSize] = useState<TooltipSize>({
 height: TOOLTIP_HEIGHT_ESTIMATE,
 width: TOOLTIP_WIDTH,
 });

 // Trigger tour delay.
 useEffect(() => {
 if (!tourId) return;
 if (readStorage(TOUR_SKIP_ALL_KEY) === "true") return;
 if (readStorage(getSeenKey(tourId)) === "true") return;

 const timer = window.setTimeout(() => setIsOpen(true), TOUR_DELAY_MS);
 return () => window.clearTimeout(timer);
 }, [tourId]);

 // Track target element and update spotlight.
 useEffect(() => {
 if (!isOpen || !tour) return;

 let frameId = 0;
 let resizeFrameId = 0;
 let targetElement: HTMLElement | null = null;
 const step = tour.steps[currentStep] ?? tour.steps[0];

 const updateSpotlight = () => {
 targetElement = findVisibleElement(getStepTargetSelectors(tour, currentStep, step));

 if (!targetElement) {
 setSpotlightRect(null);
 return;
 }

 const rect = targetElement.getBoundingClientRect();
 const viewportWidth = window.innerWidth;
 const viewportHeight = window.innerHeight;
 const desiredTop = viewportWidth < MOBILE_BREAKPOINT ? viewportHeight * 0.28 : viewportHeight * 0.38;
 const shouldScroll =
 rect.top < 104 ||
 rect.bottom > viewportHeight - 132 ||
 rect.left < 0 ||
 rect.right > viewportWidth;

 // Scroll target into view.
 if (shouldScroll) {
 const targetY = window.scrollY + rect.top - desiredTop;
 window.scrollTo({
 behavior: "smooth",
 top: Math.max(0, targetY),
 });
 }

 // Delay spotlight update to allow scroll animation to finish.
 frameId = window.setTimeout(() => {
 if (!targetElement) return;
 setSpotlightRect(toSpotlightRect(targetElement.getBoundingClientRect()));
 }, shouldScroll ? 360 : 40);
 };

 const handleResizeOrScroll = () => {
 if (!targetElement) return;
 window.cancelAnimationFrame(resizeFrameId);
 resizeFrameId = window.requestAnimationFrame(() => {
 if (!targetElement) return;
 setSpotlightRect(toSpotlightRect(targetElement.getBoundingClientRect()));
 });
 };

 updateSpotlight();
 window.addEventListener("resize", handleResizeOrScroll);
 window.addEventListener("scroll", handleResizeOrScroll, true);

 return () => {
 window.clearTimeout(frameId);
 window.cancelAnimationFrame(resizeFrameId);
 window.removeEventListener("resize", handleResizeOrScroll);
 window.removeEventListener("scroll", handleResizeOrScroll, true);
 };
 }, [currentStep, isOpen, tour]);

 // Track tooltip size changes.
 useEffect(() => {
 if (!isOpen) return;

 const updateTooltipSize = () => {
 const tooltip = tooltipRef.current;
 if (!tooltip) return;

 const rect = tooltip.getBoundingClientRect();
 setTooltipSize((currentSize) => {
 const nextSize = {
 height: Math.ceil(rect.height),
 width: Math.ceil(rect.width),
 };

 if (Math.abs(currentSize.height - nextSize.height) < 2 && Math.abs(currentSize.width - nextSize.width) < 2) {
 return currentSize;
 }

 return nextSize;
 });
 };

 updateTooltipSize();

 const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateTooltipSize) : null;

 if (tooltipRef.current && observer) {
 observer.observe(tooltipRef.current);
 }

 window.addEventListener("resize", updateTooltipSize);

 return () => {
 observer?.disconnect();
 window.removeEventListener("resize", updateTooltipSize);
 };
 }, [currentStep, isOpen]);

 /**
 * Close tour and save state.
 */
 const closeTour = (skipAll = false) => {
 if (tourId) {
 writeStorage(getSeenKey(tourId), "true");
 }

 if (skipAll) {
 writeStorage(TOUR_SKIP_ALL_KEY, "true");
 }

 setIsOpen(false);
 setSpotlightRect(null);
 };

 /**
 * Advance to next step or close tour.
 */
 const handleNext = () => {
 if (!tour) return;

 if (currentStep < tour.steps.length - 1) {
 setCurrentStep((step) => step + 1);
 return;
 }

 closeTour();
 };

 if (!isOpen || !tour) return null;

 const step = tour.steps[currentStep] ?? tour.steps[0];
 const isLastStep = currentStep === tour.steps.length - 1;

 // Check if there are explicit target elements for this step.
 const hasExplicitTarget = 
 (step.targetSelectors && step.targetSelectors.length > 0) ||
 (routeTargetSelectors[tour.id]?.[currentStep] && routeTargetSelectors[tour.id]?.[currentStep].length > 0) ||
 (getDerivedTargets(tour.id, currentStep) && getDerivedTargets(tour.id, currentStep).length > 0);

 // If there's an explicit target but spotlightRect is not measured yet, hide the tooltip to prevent CLS.
 const shouldShowTooltip = !hasExplicitTarget || spotlightRect !== null;

 const tooltipLayout = getTooltipLayout(spotlightRect, tooltipSize);
 const spotlightStyle: CSSProperties | undefined = spotlightRect
 ? {
 height: spotlightRect.height,
 left: spotlightRect.left,
 top: spotlightRect.top,
 width: spotlightRect.width,
 }
 : undefined;
 const overlayPanelClassName = "pointer-events-auto fixed bg-background/80 -[2px]";

 return (
 <AnimatePresence>
 <div className="fixed inset-0 z-[100] pointer-events-none">
 {spotlightRect ? (
 <>
 {/* Top overlay */}
 <div className={overlayPanelClassName} style={{ height: spotlightRect.top, insetInline: 0, top: 0 }} />
 {/* Bottom overlay */}
 <div
 className={overlayPanelClassName}
 style={{ bottom: 0, height: Math.max(0, window.innerHeight - spotlightRect.bottom), insetInline: 0 }}
 />
 {/* Left overlay */}
 <div
 className={overlayPanelClassName}
 style={{ height: spotlightRect.height, left: 0, top: spotlightRect.top, width: spotlightRect.left }}
 />
 {/* Right overlay */}
 <div
 className={overlayPanelClassName}
 style={{
 height: spotlightRect.height,
 right: 0,
 top: spotlightRect.top,
 width: Math.max(0, window.innerWidth - spotlightRect.right),
 }}
 />
 </>
 ) : (
 <div className="pointer-events-auto absolute inset-0 bg-background/80 -[2px]" />
 )}

 {spotlightRect && (
 <m.div
 animate={{
 height: spotlightRect.height,
 left: spotlightRect.left,
 top: spotlightRect.top,
 width: spotlightRect.width,
 }}
 className="pointer-events-none fixed rounded-lg border-2 border-primary shadow-[0_0_0_9999px_rgb(0_0_0/0.02),0_0_34px_hsl(var(--primary)/0.45)]"
 data-tour="spotlight-frame"
 initial={false}
 style={spotlightStyle}
 transition={{ duration: 0.22, ease: "easeOut" }}
 >
 <div className="absolute -inset-1 rounded-[1.15rem] border border-primary/40" />
 <div className="absolute -right-2 -top-2 size-4 rounded-full bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.9)]" />
 </m.div>
 )}

 {shouldShowTooltip && (
 <m.div
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="pointer-events-auto fixed overflow-y-auto overscroll-contain"
 data-tour="tour-tooltip"
 exit={{ opacity: 0, scale: 0.96, y: 12 }}
 initial={{ opacity: 0, scale: 0.96, y: 12 }}
 ref={tooltipRef}
 style={tooltipLayout.style}
 transition={{ duration: 0.22, ease: "easeOut" }}
 >
 <Card
 aria-describedby="page-tour-description"
 aria-labelledby="page-tour-title"
 aria-modal="true"
 className="relative overflow-hidden rounded-lg border border-primary/25 bg-card/95 p-4 shadow-2xl shadow-background/40 sm:p-5"
 role="dialog"
 >
 <div className="pointer-events-none absolute inset-x-0 top-0 h-px " />

 <button
 aria-label="Tutup panduan halaman ini"
 className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
 onClick={() => closeTour()}
 type="button"
 >
 <X size={18} />
 </button>

 <div className="pr-11">
 <div className="mb-2 flex flex-wrap items-center gap-2">
 <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-primary">
 {tour.eyebrow}
 </span>
 <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
 Langkah {currentStep + 1}/{tour.steps.length}
 </span>
 </div>
 <div className="flex items-start gap-3">
 <div className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-background/70 shadow-inner">
 {step.icon}
 </div>
 <div className="min-w-0">
 <h2 className="text-lg uppercase leading-tight text-foreground sm:text-xl" id="page-tour-title">
 {step.title}
 </h2>
 <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground" id="page-tour-description">
 {step.description}
 </p>
 </div>
 </div>
 </div>

 <div className="mt-4 flex items-center justify-center gap-2" aria-label="Progres panduan">
 {tour.steps.map((tourStep, index) => (
 <button
 aria-label={`Buka langkah ${index + 1}: ${tourStep.title}`}
 className={`h-2 rounded-full transition-all ${
 index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/50"
 }`}
 key={`${tour.id}-dot-${tourStep.title}`}
 onClick={() => setCurrentStep(index)}
 type="button"
 />
 ))}
 </div>

 <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
 <Button className="h-11 rounded-xl uppercase tracking-[0.12em]" onClick={handleNext}>
 {isLastStep ? tour.cta ?? "Mulai" : "Lanjut"}
 <ArrowRight size={17} />
 </Button>
 <Button
 className="h-11 rounded-xl px-3 text-xs"
 onClick={() => closeTour()}
 type="button"
 variant="secondary"
 >
 Lewati
 </Button>
 </div>

 <button
 className="mt-3 w-full text-center text-[11px] font-bold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
 onClick={() => closeTour(true)}
 type="button"
 >
 Lewati semua panduan halaman
 </button>
 </Card>
 </m.div>
 )}
 </div>
 </AnimatePresence>
 );
}