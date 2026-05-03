# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-45BA4B?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

## 📝 Deskripsi

**NihongoRoute** adalah platform pembelajaran mandiri (*self-learning*) bahasa Jepang tingkat profesional untuk pembelajar JLPT N5 hingga N2. Dibangun dengan estetika modern **Cyber-Dark Neumorphic**, aplikasi ini memberikan pengalaman belajar yang imersif dan tergamifikasi untuk menguasai kosakata, tata bahasa, dan kanji.

Platform ini mengutamakan arsitektur **local-first** dengan sinkronisasi cloud yang mulus menggunakan Supabase dan Sanity CMS sebagai headless content engine. Seluruh antarmuka telah **dilokalisasi penuh ke bahasa Indonesia** untuk memudahkan pelajar lokal tanpa hambatan bahasa.

---

## ✨ Fitur Utama

- **🧠 Hybrid SRS Engine** — Algoritma Spaced Repetition System berbasis SM-2 yang dimodifikasi. Bekerja instan di localStorage (Guest Mode) dan disinkronkan ke cloud secara otomatis.
- **🔄 Sync & Data Control** — Dashboard sinkronisasi real-time dengan indikator *dirty data* dan fitur **Manual Sync** untuk menjamin integritas progres lintas perangkat.
- **🎮 Progres Tergamifikasi** — Sistem XP, level, streak harian, daily quests, heatmap, dan fitur **Pelindung Streak** (Streak Freeze) untuk menjaga progres.
- **🎓 Mock Exam Engine** — Simulasi ujian JLPT lengkap dengan timer, *section breakdown*, dan skor skala 180.
- **⚡ Quiz & Survival Mode** — Mode latihan cepat dan tantangan bertahan hidup untuk menguji kecepatan ingatan.
- **🖋️ Kanji Writing Pad** — Latihan menulis digital dengan animasi *stroke order* interaktif dan detail Onyomi/Kunyomi.
- **📚 Pustaka Lengkap** — Database tata bahasa, kosakata, kanji, dan cheatsheet konjugasi kata kerja yang komprehensif.
- **📱 PWA Ready** — Aplikasi dapat diinstal di Android/iOS/Desktop dengan performa tinggi dan akses cepat.

---

## 🛠️ Stack Teknologi

| Kategori | Teknologi |
|---|---|
| **Framework** | [Next.js 15+](https://nextjs.org/) (App Router) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Database & Auth** | [Supabase](https://supabase.com/) |
| **CMS** | [Sanity.io](https://www.sanity.io/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) |
| **Testing (Unit)** | [Vitest](https://vitest.dev/) |
| **Testing (E2E)** | [Playwright](https://playwright.dev/) |
| **Automation** | Husky & Lint-Staged |

---

## 🏗️ Arsitektur

NihongoRoute mengadopsi pola **Feature-Sliced Design (FSD)** yang memisahkan UI murni dari logika bisnis melalui *custom hooks*.

- **Komponen `.tsx`** hanya merender UI — tidak mengandung logika bisnis.
- **Custom Hooks `.ts`** menangani state, kalkulasi, dan side-effects.
- **Zustand Store** menyimpan *global state* dengan *atomic selectors*.

---

## 📂 Struktur Proyek

```text
nihongoroute/
├── app/                          # Next.js App Router (Routes & Pages)
├── components/                   # UI Components
│   ├── features/                 # Domain-specific logic & components
│   ├── layout/                   # Global layouts (Navbar, Sidebar)
│   ├── providers/                # Auth & Context providers
│   └── ui/                       # Shadcn UI primitives
├── e2e/                          # Playwright End-to-End Tests
├── __tests__/                    # Vitest Unit Tests
├── store/                        # Zustand Stores
├── lib/                          # Core Utilities & SRS Algorithm
├── hooks/                        # Shared Custom Hooks
├── sanity/                       # Sanity CMS Schema
├── public/                       # Static Assets & PWA Icons
└── supabase/                     # Database Migrations & Config
```

---

## 🧪 Quality Assurance

Kami menjaga kualitas kode dengan pengujian otomatis yang ketat di setiap level.

### 1. Unit Testing (Vitest)
Fokus pada logika bisnis, algoritma SRS, dan kalkulasi progres.
- **Status:** **158 tests — 100% passed**
- Perintah: `npm test`

### 2. E2E Testing (Playwright)
Memastikan alur pengguna dari login hingga latihan berjalan mulus.
- **Cakupan:** Navigasi, Learning Flow, Dashboard, & Library.
- Perintah: `npx playwright test`

### 3. Pre-commit Hooks
Menggunakan **Husky** dan **Lint-staged** untuk memastikan kode yang di-commit selalu bersih (linting) dan bebas error TypeScript.

---

## 🚀 Instalasi & Setup

1. **Clone & Install:**
   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   npm install
   ```

2. **Environment Variables:**
   Buat file `.env.local` dan isi kredensial Sanity & Supabase Anda.

3. **Run Project:**
   ```bash
   npm run dev
   ```

---

## 👤 Maintainer

**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Portfolio: [www.fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
Dikembangkan dengan 💙 untuk komunitas pembelajar bahasa Jepang.
