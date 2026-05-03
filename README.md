# 🌀 NihongoRoute (日本語ルート) v2.0

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)

## 📝 Deskripsi

**NihongoRoute** adalah platform edutech profesional yang dirancang untuk membantu pembelajar menguasai bahasa Jepang (JLPT N5 - N2) dengan pendekatan yang terstruktur, interaktif, dan visual yang memukau. Mengusung desain **Cyber-Dark Neumorphic**, aplikasi ini menggabungkan efisiensi Spaced Repetition System (SRS) dengan antarmuka modern yang dioptimalkan untuk performa tinggi dan pengalaman belajar yang *distraction-free*.

Seluruh ekosistem NihongoRoute telah **dilokalisasi penuh ke bahasa Indonesia**, memberikan aksesibilitas tanpa batas bagi pelajar lokal untuk memahami konsep bahasa Jepang yang kompleks melalui materi yang elegan.

---

## ✨ Fitur Unggulan v2.0

### 🧠 Spaced Repetition System (SRS) & Analytics
- **Hybrid SRS Engine (SM-2 Modified)** — Algoritma pengulangan cerdas yang menjamin hafalan terkunci di ingatan jangka panjang.
- **SRS Power Analytics** — Visualisasi stabilitas memori (Fragile, Stable, Master) dan heatmap aktivitas belajar harian.
- **Quick Quiz Mode** — Sesi ulasan cepat 60 detik untuk penyegaran memori instan.

### 📝 Tipografi Jepang Tingkat Lanjut
- **Smart Furigana System** — Rendering Furigana granular (hanya di atas Kanji) menggunakan tag `<ruby>` standar industri.
- **Auto-Script Conversion** — Konversi otomatis dari Romaji ke Hiragana/Katakana secara *real-time* menggunakan integrasi `Wanakana`.

### 📚 Ekosistem Library & Learning
- **Next-Gen Library Ecosystem** — Modul Pustaka (Kosakata, Tata Bahasa, Kata Kerja, Kanji, Cheatsheet) dengan layout **Bento-Grid**.
- **Interactive Verb Dictionary** — Modal detail konjugasi kata kerja yang komprehensif untuk memahami perubahan bentuk kata secara visual.
- **Global PDF Generator** — Ekspor materi belajar ke format PDF profesional secara instan.

### 🎮 Gamifikasi & Retensi
- **Daily Mission System** — Target harian dinamis (ulasan & materi baru) untuk menjaga disiplin belajar.
- **Survival Mode Game** — Game edukasi berbasis waktu untuk menguji kecepatan membaca dan pemahaman arti kata.
- **Streak Protection** — Lindungi progres belajar Anda dengan item *Streak Freeze* yang bisa didapatkan melalui XP.

---

## 🛠️ Stack Teknologi (v2.0)

| Kategori | Teknologi |
|---|---|
| **Core Framework** | [Next.js 15+](https://nextjs.org/) (App Router), React 19, TypeScript |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), Radix UI, Shadcn UI, Framer Motion |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL), [Sanity CMS](https://www.sanity.io/) |
| **State & Sync** | [Zustand](https://zustand-demo.pmnd.rs/), [TanStack Query v5](https://tanstack.com/query) |
| **Persistence** | IndexedDB via `idb-keyval` (Local-First Architecture) |
| **Japanese Tools** | [Wanakana](https://wanakana.com/) (Real-time script conversion) |
| **Testing** | Vitest, Playwright, Testing Library |
| **PWA Support** | `@ducanh2912/next-pwa` |

---

## 🏗️ Arsitektur & Pola Desain

NihongoRoute mengadopsi prinsip **Clean Architecture** dengan pemisahan tanggung jawab yang ketat:
- **Local-First Architecture:** Data SRS disimpan di IndexedDB untuk kecepatan akses instan dan dukungan offline, disinkronkan secara cerdas ke Cloud.
- **Feature-Sliced Design (FSD):** Struktur kode yang modular dan mudah dipelihara.
- **100% Type-Safe:** Integrasi TypeScript end-to-end dari skema CMS hingga antarmuka pengguna.

---

## 🚀 Instalasi & Pengembangan

1. **Clone Proyek:**
   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   ```
2. **Instal Dependensi:**
   ```bash
   npm install
   ```
3. **Setup Lingkungan:**
   Buat file `.env.local` dan masukkan kunci API untuk Sanity dan Supabase.
4. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```

---

## 👤 Maintainer

**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Portfolio: [www.fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
Dibuat dengan semangat untuk mendemokratisasi akses belajar bahasa Jepang yang berkualitas. 🇯🇵💙
