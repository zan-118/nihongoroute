---

# 🌀 NihongoRoute (日本語ルート)

**NihongoRoute** adalah platform e-learning bahasa Jepang modern dengan estetika **Cyber Dark Neumorphic**. Aplikasi ini dirancang untuk membantu pejuang JLPT (dimulai dari N5) menguasai kosakata, tata bahasa, dan kanji melalui sistem **Spaced Repetition System (SRS)** yang cerdas dan perpustakaan data yang interaktif.

---

## 🚀 Fitur Unggulan

### 1. **Curriculum-Based Learning**

- **Kana Basics:** Modul interaktif Hiragana & Katakana yang dilengkapi dengan **SVG Stroke Order** dinamis dari KanjiVG.
- **JLPT Roadmap:** Struktur materi yang rapi (N5 - N1) berdasarkan bab, mencakup Kosakata, Pola Kalimat, Percakapan (Kaiwa), dan Kuis.

### 2. **Smart Library Hub**

- **Verb Archive:** Mesin konjugasi otomatis untuk 120+ kata kerja N5 (Masu, Te, Nai, Ta, hingga bentuk Potensial & Kausatif).
- **Grammar Guide:** Dokumentasi mendalam pola kalimat yang ditarik langsung dari Sanity CMS.
- **Reference Sheets:** Tabel referensi cepat untuk angka, waktu, partikel, dan penghitung (_counters_).

### 3. **Memory Engine**

- **Flashcards Mastery:** Kartu hafalan interaktif dengan layout vertikal yang menyertakan diagram urutan coretan Kanji.
- **Integrated SRS:** Algoritma _Spaced Repetition_ untuk mengoptimalkan jadwal review kosakata berdasarkan daya ingat pengguna.
- **XP & Leveling:** Sistem gamifikasi untuk memantau progres belajar secara _real-time_.

---

## 🛠️ Stack Teknologi

- **Framework:** [Next.js 14/15](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **CMS:** [Sanity.io](https://www.sanity.io/) (Headless CMS untuk konten dinamis)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Database (State):** Browser LocalStorage (untuk progres User tanpa login)

---

## 📂 Struktur Folder Utama

```text
├── app/
│   ├── jlpt/              # Modul kurikulum (Basics, N5, N4, dll)
│   ├── library/           # Hub data (Verbs, Grammar, Cheatsheets)
│   ├── dashboard/         # Progres user & sesi Review SRS
│   ├── studio/            # Akses ke Sanity Studio
│   └── support/           # Halaman donasi (Trakteer & Saweria)
├── components/            # Reusable UI (Flashcards, TTS, FloatingSupport)
├── context/               # Global state (UserProgressContext)
├── lib/                   # Utility (SRS Logic, GROQ Queries, Audio)
└── schemas/               # Definisi skema konten Sanity
```

---

## ⚙️ Cara Menjalankan Proyek

1. **Clone repositori:**

   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   cd nihongoroute
   ```

2. **Install dependensi:**

   ```bash
   npm install
   ```

3. **Setup Environment Variables:**
   Buat file `.env.local` dan masukkan kredensial Sanity kamu:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_id
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

4. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

---

## 🎨 Konsep Desain

Aplikasi ini menggunakan tema **Cyber Dark Neumorphic**:

- **Primary Color:** `#0ef` (Cyan Neon) sebagai aksen futuristik.
- **Background:** `#1f242d` (Deep Dark) untuk kenyamanan mata saat belajar malam hari.
- **Efek:** Shadow ganda (light/dark) untuk memberikan kesan elemen yang timbul atau tenggelam (_soft UI_).

---

## 💙 Kontribusi & Dukungan

NihongoRoute dikembangkan sebagai platform gratis dan terbuka. Kamu bisa mendukung keberlangsungan server dan pengembangan konten melalui:

- [Trakteer (E-Wallet)](https://trakteer.id/Zan118/tip)
- [Saweria (QRIS)](https://saweria.co/Zan118)

---

**Developed with 💙 by Fauzan Abdul Basith** _Mastering Japanese, one step at a time._

---
