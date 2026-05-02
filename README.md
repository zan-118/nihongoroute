# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

## 📝 Deskripsi

**NihongoRoute** adalah platform pembelajaran mandiri (*self-learning*) bahasa Jepang tingkat profesional untuk pembelajar JLPT N5 hingga N2. Dibangun dengan estetika modern **Cyber-Dark Neumorphic**, aplikasi ini memberikan pengalaman belajar yang imersif dan tergamifikasi untuk menguasai kosakata, tata bahasa, dan kanji.

Platform ini mengutamakan arsitektur **local-first** dengan sinkronisasi cloud yang mulus menggunakan Supabase dan Sanity CMS sebagai headless content engine.

---

## ✨ Fitur Utama

- **🧠 Hybrid SRS Engine** — Algoritma Spaced Repetition System berbasis SM-2 yang dimodifikasi dengan *Modern Halving Strategy*. Bekerja instan di localStorage (Guest Mode) dan disinkronkan ke cloud secara otomatis.
- **🔄 Sync & Data Control** — Dashboard sinkronisasi real-time dengan indikator *dirty data* dan fitur **Manual Sync** untuk menjamin integritas progres lintas perangkat.
- **👤 Profile Customization** — Manajemen akun lengkap dengan fitur edit profil yang tersinkronisasi langsung ke Cloud.
- **🎮 Progres Tergamifikasi** — Dashboard interaktif dengan sistem XP, level (formula akar kuadrat), streak harian, daily quests, dan heatmap aktivitas.
- **🎓 Mock Exam Engine** — Simulasi ujian JLPT lengkap dengan timer, *section breakdown*, skor skala 180, dan mekanisme anti-curang.
- **📜 Sertifikat Digital & Sharing** — Generator hasil ujian yang dapat dibagikan via media sosial melalui mekanisme **Base64-encoded achievement links** yang aman dan interaktif.
- **⚡ Quiz Engine** — Mode kuis cepat dengan *bonus perfect score*, *auto-advance*, dan proteksi *double-answer*.
- **🎯 Survival Mode** — Mode tantangan *endless* untuk melatih pengenalan Kana secara intensif.
- **🖋️ Kanji Writing Pad** — Modal latihan menulis digital full-screen dengan animasi *stroke order* interaktif.
- **📚 Perpustakaan Referensi** — Database konjugasi kata kerja, artikel tata bahasa, cheatsheet, dan tabel referensi cepat.
- **🔊 TTS Reader** — Integrasi Web Speech API untuk pengucapan teks Jepang secara langsung.
- **📄 PDF Export** — Generator PDF untuk materi kosakata dan lesson yang bisa diunduh offline.
- **📱 PWA Optimized** — Pengalaman aplikasi native di perangkat seluler dengan fitur instalasi dan *service worker*.

---

## 🛠️ Stack Teknologi

| Kategori | Teknologi |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL & Auth) |
| **CMS** | [Sanity.io](https://www.sanity.io/) (Content Lake) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) + `persist` middleware + `useShallow` selectors |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) |
| **Animasi** | [Framer Motion](https://www.framer.com/motion/) |
| **Testing** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) |
| **PWA** | [@ducanh2912/next-pwa](https://github.com/nicedoc/next-pwa) |
| **Library Tambahan** | Wanakana (teks Jepang), Lucide React (ikon), React PDF, Sonner (toast) |

---

## 🏗️ Arsitektur

NihongoRoute mengadopsi pola **Feature-Sliced Design (FSD)** yang memisahkan UI murni (*presentational shells*) dari logika bisnis (*custom hooks*). Setiap komponen mematuhi prinsip **Single Responsibility Principle (SRP)**.

### Pola State Management

```
┌──────────────────────────────────────────────────┐
│                  Zustand Store                   │
│        store/useProgressStore.ts                 │
│  ┌────────────────────────────────────────────┐  │
│  │ progress (xp, level, streak, srs, ...)    │  │
│  │ isAuthenticated, userFullName              │  │
│  │ updateProgress(), addToSRS(), ...          │  │
│  └────────────────────────────────────────────┘  │
│        │ persist (localStorage)                  │
│        │ useShallow (atomic selectors)           │
└────────┼─────────────────────────────────────────┘
         │
    ┌────▼────┐     ┌──────────────┐
    │  Hooks  │────▶│ Components   │
    │  (.ts)  │     │   (.tsx)     │
    └─────────┘     └──────────────┘
         │
    ┌────▼──────────────────────────┐
    │  ProgressProvider             │
    │  (Auth Listener + Cloud Sync) │
    └───────────────────────────────┘
```

- **Komponen `.tsx`** hanya merender UI — tidak mengandung logika bisnis.
- **Custom Hooks `.ts`** menangani state, kalkulasi, dan side-effects.
- **Zustand Store** menyimpan *global state* dengan *atomic selectors* untuk mencegah *unnecessary re-renders*.
- **ProgressProvider** menangani autentikasi Supabase dan sinkronisasi data cloud di *background*.

---

## 📂 Struktur Proyek

```text
nihongoroute/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Rute utama (Dashboard, Courses, Library, Review, dll)
│   ├── studio/                   # Sanity Studio (Embedded CMS)
│   └── auth/                     # Callback autentikasi Supabase
│
├── components/                   # Komponen UI (Presentational Shells)
│   ├── features/                 # Logic hooks per domain fitur
│   │   ├── dashboard/            #   ├── quests/ (useDailyQuests)
│   │   │                         #   └── heatmap/ (useHeatmap, getBoxStyle)
│   │   ├── exams/                #   ├── mock-engine/ (useMockExamEngine)
│   │   │                         #   └── quiz-engine/ (useQuizEngine)
│   │   ├── flashcards/           #   └── master/ (useFlashcardMaster)
│   │   ├── srs/                  #   ├── review/ (useSRSReview)
│   │   │                         #   ├── stats/ (useMemoryStats)
│   │   │                         #   ├── analytics/ (useSRSAnalytics)
│   │   │                         #   └── button/ (useAddToSRS)
│   │   ├── games/                #   └── survival/ (useSurvivalMode)
│   │   ├── tools/                #   ├── useWritingCanvas
│   │   │                         #   ├── useAnimatedKanji
│   │   │                         #   └── useTTSReader
│   │   ├── pdf/                  #   ├── usePdfGenerator
│   │   │                         #   └── useDownloadPdfButton
│   │   ├── gamification/         #   └── useLevelUpOverlay
│   │   ├── feedback/             #   └── useFeedbackWidget
│   │   └── support/              #   └── useFloatingSupport
│   ├── layout/                   # Layout hooks (useNavbar, useMobileNav)
│   ├── providers/                # ProgressProvider (Auth + Cloud Sync)
│   └── ui/                       # Shadcn UI primitives (Button, Card, Badge, dll)
│
├── store/                        # Zustand Global State
│   └── useProgressStore.ts       #   State: XP, Level, Streak, SRS, Auth
│
├── lib/                          # Pure Functions & Utilities
│   ├── srs.ts                    #   Algoritma SRS (SM-2 Modified)
│   ├── level.ts                  #   Kalkulasi Level & XP (Quadratic Scaling)
│   ├── audio.ts                  #   SoundEngine (Web Audio API procedural tones)
│   ├── helpers.ts                #   Utilitas (formatTime, shuffleArray, getTodayDateString)
│   ├── daily.ts                  #   Daily Mission management
│   ├── queries.ts                #   Sanity GROQ queries
│   ├── utils.ts                  #   Utilitas CSS (cn/clsx)
│   └── supabase/                 #   Supabase client & sync logic
│
├── __tests__/                    # Unit Tests (Vitest)
│   ├── lib/                      #   Tests untuk pure functions
│   ├── store/                    #   Tests untuk Zustand store
│   └── hooks/                    #   Tests untuk component hooks
│
├── sanity/                       # Skema data CMS & konfigurasi
├── public/                       # Aset statis (PWA icons, audio, images)
└── supabase/                     # Konfigurasi & migrasi database
```

---

## 🧪 Testing

NihongoRoute menggunakan **Vitest** dengan **React Testing Library** untuk unit testing seluruh logika bisnis.

```bash
# Jalankan semua test
npm test

# Mode watch (auto-rerun saat file berubah)
npm run test:watch
```

### Coverage Saat Ini: **155 tests — 100% passed**

| Area Test | File | Jumlah Test |
|---|---|---|
| **Pure Functions** | `lib/srs.ts`, `lib/level.ts`, `lib/helpers.ts` | 55 |
| **Zustand Store** | `store/useProgressStore.ts` | 23 |
| **Flashcard Engine** | `useFlashcardMaster` | 14 |
| **Mock Exam Engine** | `useMockExamEngine` | 18 |
| **Quiz Engine** | `useQuizEngine` | 10 |
| **Daily Quests** | `useDailyQuests` | 9 |
| **SRS Stats & Analytics** | `useMemoryStats`, `useSRSAnalytics` | 14 |
| **SRS Button** | `useAddToSRS` | 4 |
| **Heatmap** | `getBoxStyle` | 8 |

---

## 📖 Alur Data & Sinkronisasi

NihongoRoute menggunakan pendekatan **Hybrid-Sync** dengan Zustand sebagai pusat data:

1. **Local-First** — Semua progres disimpan secara instan ke `localStorage` via Zustand `persist` middleware.
2. **First Login** — Sistem memigrasikan data lokal ke database Supabase secara otomatis.
3. **Debounced Cloud Sync** — Perubahan SRS dicatat ke dalam `dirtySrs` set dan disinkronkan ke Supabase setiap 1.5 detik untuk mengurangi beban *write request*.
4. **Offline Resilient** — Aplikasi tetap berfungsi penuh saat offline berkat data lokal.

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

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint check |
| `npm test` | Jalankan semua unit test |
| `npm run test:watch` | Test mode watch |

---

## 👤 Maintainer

**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Portfolio: [www.fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
Dikembangkan dengan 💙 untuk komunitas pembelajar bahasa Jepang.
