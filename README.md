# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**NihongoRoute** adalah platform _self-learning_ bahasa Jepang modern dengan estetika **Cyber-Dark Neumorphic**. Aplikasi ini dirancang untuk memandu pembelajar (khususnya tingkat N5 hingga N2) menguasai kosakata, tata bahasa, dan kanji melalui sistem yang tergamifikasi, responsif, dan berbasis data.

[**Jelajahi Aplikasi »**](https://www.nihongoroute.my.id)

---

## ✨ Fitur Unggulan Berbasis Kode

### 🧠 Spaced Repetition System (SRS) Engine

Implementasi algoritma memori di `lib/srs.ts` yang mengatur interval pengulangan kosakata. Terintegrasi dengan `UserProgressContext` menggunakan teknik _debouncing_ canggih untuk memastikan performa aplikasi tetap secepat kilat tanpa _memory leak_, meskipun pengguna memiliki ribuan kata hafalan.

### 🎮 Gamified Dashboard & XP System

Sistem progres pengguna yang interaktif dan berjalan 100% secara lokal:

- **XP & Leveling:** Dapatkan XP dari setiap aktivitas belajar.
- **Activity Heatmap:** Pelacakan konsistensi belajar visual layaknya kontribusi GitHub.
- **Daily Quests:** Tantangan harian untuk meningkatkan motivasi.

### 🎓 Serverless Mock Exam Engine

Simulasi ujian JLPT lengkap (`components/MockExamEngine.tsx`) dengan fitur berstandar resmi:

- **Hidden Audio Logic:** Audio _Choukai_ otomatis mengunci diri setelah 1 kali pemutaran (mereplikasi ujian asli).
- **Grace-Period Anti-Cheat:** Deteksi perpindahan _tab_ dengan toleransi waktu manusiawi untuk pengguna perangkat seluler.
- **Base64 Certificate Sharing:** Sistem berbagi hasil ujian menggunakan _URL Encoding_ yang 100% _serverless_, mencegah _bot spam_, dan menjaga biaya _database_ tetap Rp 0.

### 🖋️ Interactive Kanji & Writing Pad

- **Animated Stroke Order:** Visualisasi urutan coretan kanji menggunakan data SVG.
- **Writing Canvas:** Fitur latihan menulis karakter secara langsung di layar perangkat sentuh menggunakan `WritingCanvas.tsx`.

### 📚 Smart Reference Library

- **Verb Conjugation Matrix:** Kamus perubahan bentuk kata kerja (Masu, Te, Nai, Ta, dll) yang dilengkapi akordion detail.
- **Interactive Cheatsheet:** Tabel referensi cepat untuk angka, waktu, dan partikel yang mudah dinavigasi.

---

## 🛠️ Stack Teknologi & Arsitektur

- **Core:** Next.js 15 (App Router), TypeScript.
- **State Management:** React Context API (`UserProgressContext`) dengan persistensi LocalStorage yang aman.
- **Backend/CMS:** Sanity.io (Akses _Read-Only_ berkinerja tinggi untuk pelajaran, kuis, dan simulasi ujian).
- **Styling & UI:** Tailwind CSS (Mobile-First Layout), Framer Motion (Animasi Transisi Mulus), Lucide React (Ikon).
- **Audio:** Web Speech API (TTS) & Integrasi file audio bawaan Sanity.

---

## 📂 Struktur Proyek

```text
├── app/
│   ├── (main)/              # Main App Group (Menggunakan layout aman 'Safe Zone')
│   │   ├── courses/         # Hub Materi & Rute JLPT
│   │   ├── exams/[id]/      # Mesin Ujian Simulasi Mandiri (Mock Exam)
│   │   ├── library/         # Koleksi Cerdas (Vocab, Kanji, Grammar, Verbs, Cheatsheet)
│   │   ├── review/          # Sesi Hafalan Aktif (SRS)
│   │   ├── share/           # Generator Sertifikat Ujian Base64 URL
│   │   ├── support/         # Halaman Donasi & Transparansi
│   │   └── dashboard/       # Pusat Progres Belajar
│   ├── layout.tsx           # Root Layout (Menangani margin Navbar Mobile)
│   └── page.tsx             # Landing Page
├── components/              # UI Inti (Flashcards, ExamEngine, WritingCanvas, Navbar)
├── context/                 # Logic utama XP, Progres Belajar, dan Sinkronisasi Lokal
├── lib/                     # Utilitas (Algoritma SRS, Pembaca Audio, Konverter XP)
└── sanity/                  # Definisi skema Content Lake terpisah (Kanji, Vocab, Exam, dll.)
```

## ⚙️ Instalasi Lokal

Karena NihongoRoute kini menggunakan arsitektur _Serverless Read-Only_, Anda tidak lagi memerlukan token tulis (Write Token) yang rumit. Cukup atur ID publik Sanity Anda.

1. **Clone & Install:**

   ```bash
   git clone [https://github.com/zan-118/nihongoroute.git](https://github.com/zan-118/nihongoroute.git)
   cd nihongoroute
   npm install
   ```

2. **Environment Setup:**
   Buat file `.env.local` di _root directory_:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID="project_id_kamu"
   NEXT_PUBLIC_SANITY_DATASET="production"
   ```

3. **Jalankan:**
   ```bash
   npm run dev
   ```

---

## 💙 Dukungan & Kontribusi

NihongoRoute dikembangkan sebagai proyek riset _Educational Technology_ yang 100% Gratis dan Open-Source. Dukungan kamu adalah bahan bakar utama untuk menjaga server tetap hidup dan membiayai pengembangan silabus materi baru:

- [**Trakteer (E-Wallet/Gopay/OVO)**](https://trakteer.id/Zan118/tip)
- [**Saweria (QRIS/Dana)**](https://saweria.co/Zan118)

**Developed with 💙 by [Fauzan Abdul Basith](https://github.com/zan-118)**

```

```
