# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)

## 📝 Deskripsi

**NihongoRoute** adalah platform edutech profesional yang dirancang untuk membantu pembelajar menguasai bahasa Jepang (JLPT N5 - N2) dengan pendekatan yang terstruktur, interaktif, dan visual yang memukau. Mengusung desain **Cyber-Dark Neumorphic**, aplikasi ini menggabungkan efisiensi Spaced Repetition System (SRS) dengan antarmuka modern yang dioptimalkan untuk perangkat seluler.

Seluruh ekosistem NihongoRoute telah **dilokalisasi penuh ke bahasa Indonesia**, memberikan aksesibilitas tanpa batas bagi pelajar lokal untuk memahami konsep bahasa Jepang yang kompleks melalui materi yang mudah dicerna.

---

## ✨ Fitur Unggulan

- **🧠 Hybrid SRS Engine (SM-2 Modified)** — Algoritma pengulangan cerdas yang menjamin hafalan terkunci di ingatan jangka panjang.
- **📚 Next-Gen Library Ecosystem** — Modul Pustaka (Kosakata, Tata Bahasa, Kata Kerja, Cheatsheet) dengan layout **Bento-Grid** dan sistem **Pagination** yang teratur.
- **📄 Global PDF Generator** — Ekspor materi belajar ke format PDF profesional secara instan menggunakan `@react-pdf/renderer`.
- **🎮 Gamified Dashboard** — Pantau progres melalui Heatmap, XP, Level, dan rayakan pencapaian dengan efek **Canvas Confetti**.
- **⌨️ Smart Input with Wanakana** — Input teks Jepang otomatis yang cerdas dan intuitif.
- **📱 PWA & Local-First** — Dukungan instalasi aplikasi (PWA) dengan persistensi data menggunakan **IndexedDB (idb-keyval)** untuk pengalaman offline yang mulus.
- **🔍 Smart Dictionary Popup** — Kamus mengambang yang muncul saat menyorot teks Jepang di mana pun dalam aplikasi.

---

## 🛠️ Stack Teknologi (Lengkap)

| Kategori | Teknologi |
|---|---|
| **Core Framework** | [Next.js 15+](https://nextjs.org/) (App Router), React 19, TypeScript |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/), Radix UI, Shadcn UI, Framer Motion |
| **Backend & Auth** | [Supabase](https://supabase.com/) (PostgreSQL), [Sanity CMS](https://www.sanity.io/) |
| **State & Sync** | [Zustand](https://zustand-demo.pmnd.rs/), [TanStack Query v5](https://tanstack.com/query) |
| **Persistence** | IndexedDB via `idb-keyval` (Local-First Architecture) |
| **Japanese Tools** | [Wanakana](https://wanakana.com/) (Romaji-Kana conversion) |
| **Export & Utils** | `@react-pdf/renderer`, `date-fns`, `canvas-confetti` |
| **Testing** | Vitest, Playwright, Testing Library |
| **Dev Ops** | Husky, Lint-Staged, ESLint |

---

## 🏗️ Arsitektur & Pola Desain

NihongoRoute mengadopsi prinsip **Clean Architecture** dengan pemisahan tanggung jawab yang ketat:
- **Feature-Sliced Design (FSD):** Memisahkan domain logika ke dalam modul-modul independen.
- **Atomic Components:** UI yang dibangun dari unit terkecil untuk konsistensi desain maksimal.
- **Type-Safety:** Implementasi TypeScript 100% pada seluruh jalur data (dari CMS hingga Client).

---

## 🧪 Quality Assurance

Kualitas adalah prioritas utama. NihongoRoute melewati rangkaian pengujian otomatis:
- **Unit Testing:** 150+ test cases untuk menjamin akurasi algoritma SRS.
- **E2E Testing:** Skenario kritis diuji menggunakan Playwright untuk menjamin kelancaran navigasi.
- **Pre-commit Checks:** Husky memastikan kode selalu bersih sebelum masuk ke repositori.

---

## 🚀 Instalasi & Pengembangan

1. **Clone Proyek:**
   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   ```
2. **Setup Env:**
   Salin `.env.example` menjadi `.env.local` dan lengkapi API Keys.
3. **Mulai Belajar:**
   ```bash
   npm install
   npm run dev
   ```

---

## 👤 Maintainer

**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Portfolio: [www.fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
Dibuat dengan semangat untuk mendemokratisasi akses belajar bahasa Jepang yang berkualitas. 🇯🇵💙
