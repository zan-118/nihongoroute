# 🌀 NihongoRoute (日本語ルート) v2.5

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)

## 📝 Deskripsi

**NihongoRoute** adalah ekosistem pembelajaran bahasa Jepang profesional yang menggabungkan **Big Data Pedagogis** dengan antarmuka **Cyber-Dark Neumorphic**. Dirancang untuk pembelajar Indonesia (JLPT N5 - N2), platform ini menawarkan lebih dari sekadar materi—ia menyediakan rute belajar yang cerdas, lokal, dan terstruktur secara masif.

Dengan basis data lebih dari **10.000+ kosakata** dan **1.500+ kata kerja**, NihongoRoute menghadirkan kedalaman informasi yang jarang ditemukan di aplikasi lain, termasuk status transitivitas kata kerja, rumus tata bahasa yang presisi, hingga catatan nuansa budaya yang dilokalisasi penuh.

---

## ✨ Fitur Unggulan v2.5 (Enriched Edition)

### 📚 Big Data Pedagogis & Library
- **AI-Enriched Dictionary** — Akses ke 10.000+ kosakata dan 1.500+ kata kerja dengan metadata lengkap (transitivitas, mnemonik, dan contoh penggunaan).
- **Comprehensive Grammar Guides** — Ratusan panduan tata bahasa yang dilengkapi dengan **Rumus (Formation)** dan **Catatan Nuansa (Notes)** untuk pemahaman yang lebih mendalam.
- **75-Chapter Structured Curriculum** — Kurikulum terbagi rata (25 Umum, 25 N5, 25 N4) untuk memastikan progres belajar yang linear dan terukur.

### 🧠 Smart Learning Engine
- **Hybrid SRS (Spaced Repetition System)** — Algoritma cerdas yang menjamin hafalan terkunci di ingatan jangka panjang melalui kartu flashcard interaktif.
- **Smart Furigana & Audio TTS** — Rendering Furigana granular dan integrasi Text-to-Speech (TTS) di setiap kata dan contoh kalimat untuk melatih pendengaran.
- **Dynamic PDF Generator** — Ekspor bab belajar atau daftar kosakata ke format PDF profesional secara instan untuk belajar offline.

### 📝 Tipografi & Visual Premium
- **Cyber-Dark Neumorphic UI** — Antarmuka modern yang dioptimalkan untuk fokus tinggi dan keindahan visual di perangkat mobile maupun desktop.
- **Interactive Verb Matrix** — Visualisasi konjugasi kata kerja yang dinamis, memudahkan pemahaman perubahan bentuk kata secara visual.

---

## 🛠️ Stack Teknologi

| Kategori | Teknologi |
|---|---|
| **Core Framework** | [Next.js 15+](https://nextjs.org/) (App Router), React 19, TypeScript |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), Shadcn UI, Framer Motion |
| **Backend & Auth** | [Supabase](https://supabase.com/) (Auth & Sync), [Sanity CMS](https://www.sanity.io/) (Content Hub) |
| **State & Storage** | [Zustand](https://zustand-demo.pmnd.rs/), IndexedDB via `idb-keyval` (Local-First) |
| **Performance** | Incremental Static Regeneration (ISR) & PWA Support |

---

## 🏗️ Arsitektur Data

NihongoRoute menggunakan pola **Local-First Architecture** untuk memastikan kecepatan akses data raksasa:
- **Fast Search:** Pencarian kosakata dan kata kerja dioptimalkan melalui debouncing dan caching client-side.
- **Content Sync:** Data pedagogis dikelola melalui Sanity Studio yang terhubung langsung ke frontend untuk update konten tanpa redeploy.
- **Type-Safety:** Skema data 100% tersinkronisasi antara database CMS dan TypeScript frontend.

---

## 🚀 Instalasi & Pengembangan

1. **Clone & Install:**
   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   npm install
   ```
2. **Setup Environment:**
   Siapkan `.env.local` dengan API Key Sanity & Supabase.
3. **Run Dev:**
   ```bash
   npm run dev
   ```

---

## 👤 Maintainer

**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Website: [www.fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
Dibuat dengan semangat untuk mendemokratisasi akses belajar bahasa Jepang yang berkualitas di Indonesia. 🇯🇵💙
