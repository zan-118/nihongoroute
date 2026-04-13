# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

**NihongoRoute** adalah platform e-learning bahasa Jepang modern dengan estetika **Cyber Dark Neumorphic**. Dirancang khusus untuk pejuang JLPT (dimulai dari N5) untuk menguasai kosakata, tata bahasa, dan kanji melalui pendekatan gamifikasi dan sistem memori yang cerdas. Proyek ini juga diinisiasi sebagai bentuk implementasi riset _Educational Technology_ untuk menguji efektivitas gamifikasi dan simulasi interaktif dalam pembelajaran bahasa.

[**Jelajahi Aplikasi »**](https://www.nihongoroute.my.id)

---

## ✨ Fitur Unggulan

### 🗺️ Curriculum-Based Learning

- **Kana Basics:** Modul interaktif Hiragana & Katakana dilengkapi dengan **SVG Stroke Order** dinamis untuk melatih cara penulisan yang benar.
- **JLPT Roadmap:** Kurikulum terstruktur dari N5 hingga N1 yang mencakup Kosakata, Pola Kalimat, Percakapan (Kaiwa), dan Kuis evaluasi.

### 🎓 Official Mock Exam (JLPT Tryout)

- **Proctoring & Anti-Cheat:** Dilengkapi sistem deteksi _tab-switching_ dan pemutar audio _uninterrupted_ (tanpa jeda/kontrol) khusus untuk sesi _Choukai_ (Mendengar).
- **Sectional Analytics:** Kalkulasi skor JLPT realistis dengan rincian performa visual per bagian (Moji/Goi, Bunpou, Dokkai, Choukai).
- **Candidature Report:** Menghasilkan "Sertifikat Kelulusan" dalam format PDF beresolusi tinggi yang ditarik langsung dari riwayat ujian pengguna di Dashboard.

### 📚 Smart Library Hub

- **Verb Archive:** Mesin konjugasi otomatis untuk 120+ kata kerja N5 (Bentuk Masu, Te, Nai, Ta, hingga Potensial & Kausatif).
- **Grammar Guide:** Dokumentasi mendalam pola kalimat yang dikelola secara dinamis melalui CMS.
- **Reference Sheets:** Tabel referensi cepat (Cheatsheets) untuk angka, waktu, partikel, dan penghitung (_counters_).

### 🧠 Memory Engine (SRS)

- **Integrated SRS:** Algoritma _Spaced Repetition_ yang mengatur jadwal _review_ kosakata secara otomatis berdasarkan level daya ingat pengguna.
- **Flashcards Mastery:** Kartu hafalan interaktif dengan diagram urutan coretan Kanji dan integrasi **Text-to-Speech (TTS)**.
- **XP & Leveling:** Sistem progres gamifikasi global untuk menjaga motivasi belajar.

---

## 🛠️ Stack Teknologi

- **Core:** [Next.js 15](https://nextjs.org/) (App Router & Server Actions)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) dengan konsep _Soft UI / Neumorphism_
- **Content & Database:** [Sanity.io](https://www.sanity.io/) (Real-time Headless CMS) _dengan transisi arsitektur menuju [Supabase](https://supabase.com/) untuk skalabilitas dan manajemen data relasional yang lebih masif._
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) & Context API (Persisted via LocalStorage)
- **Animation & Export:** [Framer Motion](https://www.framer.com/motion/) untuk transisi UI yang _smooth_, dipadukan dengan `html2canvas` & `jspdf` untuk _rendering_ sertifikat klien.
- **Service:** [Next-PWA](https://www.npmjs.com/package/next-pwa) untuk pengalaman aplikasi mobile yang _installable_.

---

## 📂 Arsitektur Proyek

```text
├── app/
│   ├── api/               # Server-side endpoints (misal: Webhook & POST skor ujian)
│   ├── courses/              # Modul kurikulum (Basics, N5, N4, dll)
│   ├── library/           # Database hub (Verbs, Grammar, Cheatsheets)
│   ├── dashboard/         # Pusat progres user, PDF Report, & sesi Review SRS
│   └── studio/            # Interface Sanity Studio (Back-office)
├── components/            # UI Atoms, Molecules, & Organisms (MockExamEngine, CyberCard, dll)
├── context/               # Global state (UserProgressContext)
├── lib/                   # SRS Algorithm, GROQ Queries, & Global Utils
└── public/                # Assets, PWA Icons, & Manifest
```

---

## 🎨 Filosofi Desain

Aplikasi ini mengusung tema **Cyber Dark Neumorphic**:

- **Aksen Futuristik:** Menggunakan warna `#0ef` (Cyan Neon) untuk elemen interaktif.
- **Dark Mode by Default:** Menggunakan `#15171a` untuk mengurangi kelelahan mata (_eye strain_).
- **Neumorphic Depth:** Menggunakan teknik _double shadow_ untuk menciptakan kedalaman visual yang elegan dan modern pada kartu soal dan dasbor.

---

## ⚙️ Instalasi Lokal

1. **Clone & Install:**

   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   cd nihongoroute
   npm install
   ```

2. **Environment Setup:**
   Buat file `.env.local` di root folder:

   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
   NEXT_PUBLIC_SANITY_DATASET="production"
   SANITY_API_WRITE_TOKEN="your_sanity_editor_token_here"
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

3. **Development Mode:**
   ```bash
   npm run dev
   ```

---

## 💙 Dukungan

NihongoRoute adalah proyek _open-source_ yang dikembangkan untuk membantu komunitas pembelajar bahasa Jepang. Dukungan kamu sangat berarti untuk keberlangsungan server dan pembaruan konten secara berkala:

- [**Trakteer (E-Wallet)**](https://trakteer.id/Zan118/tip)
- [**Saweria (QRIS)**](https://saweria.co/Zan118)

---

**Developed with 💙 by [Fauzan Abdul Basith](https://github.com/zan-118)** _Mastering Japanese, one step at a time._ _والله الموفق إلى أقوم الطريق_
