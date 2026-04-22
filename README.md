# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📝 Deskripsi
**NihongoRoute** adalah platform pembelajaran mandiri (self-learning) bahasa Jepang tingkat profesional untuk pembelajar JLPT N5 hingga N2. Dibangun dengan estetika modern **Cyber-Dark Neumorphic**, aplikasi ini memberikan pengalaman belajar yang imersif dan tergamifikasi untuk menguasai kosakata, tata bahasa, dan kanji. Platform ini mengutamakan performa *local-first* dengan sinkronisasi cloud yang mulus menggunakan Supabase dan Sanity CMS.

---

## ✨ Fitur Utama
- **🧠 Hybrid SRS Engine:** Sistem Repetisi Spasi (Spaced Repetition System) yang bekerja secara instan di LocalStorage (Guest Mode) dan disinkronkan ke cloud secara otomatis setelah login.
- **🎮 Progres Tergamifikasi:** Dashboard interaktif dengan sistem XP, level, dan heatmap aktivitas untuk melacak konsistensi belajar.
- **🎓 Mock Exam Engine:** Simulasi ujian JLPT lengkap dengan sesi waktu, penguncian audio, dan mekanisme anti-curang.
- **🖋️ Full-Screen Kanji Pad:** Modal latihan menulis digital dengan animasi urutan coretan (*stroke order*) untuk pengalaman belajar yang lebih fokus.
- **📚 Perpustakaan Referensi:** Database lengkap konjugasi kata kerja, artikel tata bahasa, dan tabel referensi cepat interaktif.
- **📱 PWA Optimized:** Pengalaman aplikasi native di perangkat seluler dengan fitur instalasi dan performa yang dioptimalkan untuk layar sentuh.

---

## 🛠️ Stack Teknologi
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router & Server Actions)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL & Auth Go)
- **CMS:** [Sanity.io](https://www.sanity.io/) (Content Lake untuk materi ajar)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animasi:** [Framer Motion](https://www.framer.com/motion/)
- **State Management:** React Context API dengan integrasi LocalStorage & Sinkronisasi DB.
- **Library Tambahan:** Wanakana (Pemrosesan teks Jepang), Lucide React (Ikon), Canvas Confetti.

---

## 📂 Struktur Proyek
```text
├── app/                  # Next.js App Router (Halaman & API)
│   ├── (main)/           # Rute utama aplikasi (Dashboard, Kursus, Pustaka)
│   ├── studio/           # Rute untuk Sanity Studio (Embedded)
│   └── auth/             # Logika otentikasi & callback Supabase
├── components/           # Komponen UI (Atomic design, Cyber-Dark aesthetic)
├── context/              # Provider state global (XP, SRS Progress, Auth)
├── lib/                  # Logika inti (SRS algorithms, formatting, Supabase client)
├── public/               # Aset statis (PWA Icons, Audio, Images)
├── sanity/               # Skema data materi & konfigurasi CMS
└── types/                # Definisi TypeScript global
```

---

## 🚀 Instalasi & Setup
1. **Clone repositori:**
   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   cd nihongoroute
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan:**
   Buat file `.env.local` dan lengkapi variabel berikut:
   ```env
   # Sanity Configuration
   NEXT_PUBLIC_SANITY_PROJECT_ID="..."
   NEXT_PUBLIC_SANITY_DATASET="production"

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL="..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
   ```

---

## 🏃 Perintah Terminal
- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Start Production:** `npm run start`
- **Lint Check:** `npm run lint`

---

## 📖 Alur Data & Sinkronisasi
NihongoRoute menggunakan pendekatan **Hybrid-Sync**:
1. **Guest Mode:** Semua progres disimpan di browser (`localStorage`).
2. **First Login:** Sistem memigrasikan data lokal ke database Supabase secara otomatis.
3. **Continuous Sync:** Progres belajar disinkronkan secara real-time ke cloud untuk akses antar perangkat.

---

## 👤 Maintainer
**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Portfolio: [www.fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
Dikembangkan dengan 💙 untuk komunitas pembelajar bahasa Jepang.
