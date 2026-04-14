# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**NihongoRoute** adalah platform _self-learning_ bahasa Jepang modern dengan estetika **Cyber-Dark Neumorphic**. Aplikasi ini dirancang untuk memandu pembelajar (khususnya tingkat N5) menguasai kosakata, tata bahasa, dan kanji melalui sistem yang tergamifikasi dan berbasis data.

[**Jelajahi Aplikasi »**](https://www.nihongoroute.my.id)

---

## ✨ Fitur Unggulan Berbasis Kode

### 🧠 Spaced Repetition System (SRS) Engine

Implementasi algoritma memori di `lib/srs.ts` yang mengatur interval pengulangan kosakata. Terintegrasi dengan `UserProgressContext` untuk memastikan pengguna mengulang kata tepat sebelum mereka melupakannya.

### 🎮 Gamified Dashboard & XP System

Sistem progres pengguna yang interaktif (diatur di `context/UserProgressContext.tsx`):

- **XP & Leveling:** Dapatkan XP dari setiap aktivitas belajar.
- **Activity Heatmap:** Pelacakan konsistensi belajar visual seperti GitHub kontribusi.
- **Daily Quests:** Tantangan harian untuk meningkatkan motivasi.

### 🎓 Professional Mock Exam Engine

Simulasi ujian JLPT lengkap (`components/MockExamEngine.tsx`) dengan fitur:

- **Hidden Audio Logic:** Audio _Choukai_ otomatis tanpa kontrol jeda (mereplikasi ujian asli).
- **Anti-Cheat:** Deteksi _Visibility Change_ untuk mencegah pengguna berpindah tab selama ujian.
- **Automated Grading:** Penilaian instan berdasarkan kategori (Moji/Goi, Bunpou, Dokkai, Choukai).

### 🖋️ Interactive Kanji & Writing Pad

- **Animated Stroke Order:** Visualisasi urutan coretan kanji menggunakan data SVG.
- **Writing Canvas:** Fitur latihan menulis langsung di layar menggunakan `WritingCanvas.tsx`.

### 📚 Smart Reference Library

- **Verb Conjugation Matrix:** Kamus perubahan bentuk kata kerja (Masu, Te, Nai, Ta, dll) yang dinamis.
- **Interactive Cheatsheet:** Tabel referensi cepat untuk angka, waktu, dan partikel.

---

## 🛠️ Stack Teknologi

- **Core:** Next.js 15 (App Router), TypeScript.
- **State Management:** React Context API (`UserProgressContext`) dengan persistensi LocalStorage.
- **Backend/CMS:** Sanity.io (Skema kustom untuk pelajaran, kuis, dan simulasi ujian).
- **Styling & UI:** Tailwind CSS, Framer Motion (Animasi), Lucide React (Ikon).
- **Audio:** Web Speech API & Integrasi file audio Sanity.

---

## 📂 Arsitektur Proyek

```text
├── app/                  # Route Pages (Dashboard, Courses, Library, Exam)
│   ├── api/              # API Route untuk menyimpan hasil ujian ke Sanity
│   └── (routes)/         # Struktur folder berbasis level (Basics, N5)
├── components/           # UI Inti (Flashcards, ExamEngine, WritingCanvas, XPPop)
├── context/              # Logic utama XP, Progres Belajar, dan SRS
├── lib/                  # Utilitas (SRS logic, achievement system, Groq queries)
├── public/               # Aset statis & PWA Manifest
└── sanity/               # Definisi skema Content Lake (Mock Exam, Lessons, Verbs)
```

## ⚙️ Instalasi Lokal

1. **Clone & Install:**

   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   cd nihongoroute
   npm install
   ```

2. **Environment Setup:**
   Buat file `.env.local`:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID="project_id_kamu"
   NEXT_PUBLIC_SANITY_DATASET="production"
   SANITY_API_WRITE_TOKEN="token_untuk_save_hasil_ujian"
   ```

3. **Jalankan:**
   ```bash
   npm run dev
   ```

---

## 💙 Dukungan & Kontribusi

NihongoRoute dikembangkan sebagai proyek riset _Educational Technology_. Dukungan kamu membantu pengembangan konten materi yang lebih luas:

- [**Trakteer (E-Wallet)**](https://trakteer.id/Zan118/tip)
- [**Saweria (QRIS)**](https://saweria.co/Zan118)

**Developed with 💙 by [Fauzan Abdul Basith](https://github.com/zan-118)**
