# 🌀 NihongoRoute (日本語ルート)

<div align="center">
  <img src="./public/logo-branding.svg" alt="Logo NihongoRoute" width="160" height="160" style="margin-bottom: 20px;" />
  <h2><b>Ekosistem Pembelajaran Bahasa Jepang Kelas Enterprise untuk Indonesia</b></h2>
  <p align="center">
    Platform modern berbasis <strong>Offline-First (Luring-Pertama)</strong> dengan performa tinggi (< 16ms), dirancang menggunakan sistem desain semantik <strong>Cyber-Glass</strong> dan bebas dari kesenjangan bahasa.
  </p>

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=nextdotjs" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Pengetikan_Ketat-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://sanity.io/"><img src="https://img.shields.io/badge/Sanity-Content_CMS-F03E3E?style=for-the-badge&logo=sanity&logoColor=white" alt="Sanity" /></a>
  </p>
</div>

---

## 🌌 Filosofi & Visi Utama

**NihongoRoute** mendefinisikan ulang cara pembelajar Indonesia menguasai bahasa Jepang secara mandiri tanpa hambatan teknologi maupun finansial. Ekosistem ini berdiri di atas empat pilar filosofi utama:

*   **Offline-First & Zero Latency (<16ms)**: Seluruh interaksi belajar, penambahan kartu memori, dan perolehan XP diproses langsung di sisi klien secara instan. Latensi jaringan sama sekali tidak menghalangi kelancaran proses belajar.
*   **Bebas Biaya Tersembunyi (Zero Gatekeeping)**: Akses penuh tanpa batas untuk seluruh modul pelajaran dan simulasi ujian tanpa kewajiban membuat akun. Pendaftaran akun murni bersifat opsional untuk keperluan pencadangan awan (*cloud sync*).
*   **Tanpa Hambatan Bahasa (Zero Language-Gap)**: Seluruh istilah teknologi SaaS yang membingungkan atau singkatan asing yang kaku dieliminasi dan diganti dengan padanan bahasa Indonesia yang intuitif, santun, dan ramah pemula.
*   **Integritas Multi-Tab Sempurna**: Menggunakan saluran penyiaran lokal (*BroadcastChannel*) untuk mensinkronisasi data belajar secara instan di seluruh tab peramban yang aktif tanpa memuat ulang halaman (*zero-refresh cache invalidation*).

---

## ⚡ Lima Pilar Arsitektur Mesin Belajar

### 💎 1. Sistem Desain Semantik Cyber-Glass
Antarmuka visual premium bergaya futuristik *Neo-Tokyo Cyber-Glass* (`backdrop-blur` tebal, border translusen, bayangan neon lembut) yang beradaptasi 100% secara dinamis antara mode Terang dan Gelap. Setiap warna dan efek pendar (*glow*) dikontrol menggunakan variabel semantik terpusat, memberikan kenyamanan mata tingkat tinggi selama sesi belajar larut malam.

### 🔄 2. Protokol Sinkronisasi Awan 3-Tier
Aliran data *offline-first* yang tangguh dirancang melalui pemisahan tiga lapisan (*3-Tier Sync*):
1.  **Tier 1: Zustand Store + IndexedDB**: Mengelola pembacaan dan penulisan status lokal asinkron asinkron asinkron secara instan via `idb-keyval`. Memberikan *instant feedback* kepada pengguna.
2.  **Tier 2: Orchestration Layer (`useSyncProgress`)**: Melakukan pemantauan berkala dan *debouncing* asinkron untuk menyusun data lokal yang berubah (*dirty data*).
3.  **Tier 3: Cloud Persistence Layer (`useCloudMutation`)**: Tanstack Query (React Query) mengeksekusi sinkronisasi terkompresi langsung ke Supabase RPC (`sync_user_progress`).

### 📚 3. Mesin Simulasi JLPT & JFT-Basic Tingkat Lanjut
*   **Answer Sheet Grid Interaktif**: Modal ringkasan visual bergaya grid futuristik untuk memantau status pengerjaan soal (Hijau: Terisi, Amber Kedip: Kosong, Abu-abu Gembok: Bagian yang Terkunci) dengan fitur lompat soal instan.
*   **Batas Keras Audio 1-Kali Putar**: Meniru aturan resmi ujian asli. Tombol audio dikunci seketika saat diputar. Jika pengguna berganti soal di tengah pemutaran, sistem secara fisik mematikan audio latar belakang dan mengunci statusnya menjadi `'played'` secara permanen.
*   **Logika Kelulusan Maiten (Sectional Pass Marks)**: Penilaian kelulusan riil di mana peserta dinyatakan gagal apabila akurasi di salah satu kategori materi berada di bawah ambang batas minimal $32\%$, walaupun total skor mencukupi.
*   **Visualisasi Sertifikat Otentik**: Dasbor laporan hasil dual-view interaktif yang dapat beralih antara data analitik modern dan sertifikat fisik otentik (JLPT vintage parchment lengkap dengan segel merah Hanko yang berputar realistis, serta JFT-Basic CBT CEFR A2 bilingual).

### 🧠 4. Smart Japanese Parser & Smart Rendering
*   **`SmartJapanese` Engine**: Komponen rendering yang mendeteksi teks Jepang secara dinamis untuk menyisipkan anotasi Furigana di atas Kanji dengan proporsi presisi `0.55em`.
*   **Word Popover Dinamis**: Klik pada kosakata apa pun saat membaca materi untuk memunculkan kamus leksikal dinamis (definisi, pengucapan TTS, serta integrasi tombol instan `AddToSRSButton` untuk penambangan kalimat langsung ke antrean kartu flashcard lokal & cloud).

### 🎮 5. Gamifikasi Luring & Anti-Cheat
Sistem perkembangan level, kalkulasi rekor belajar berturut-turut (*streak*), dan perolehan XP yang diamankan dengan enkripsi validasi di sisi pelayan (*server-side validated payload*) untuk mencegah manipulasi data, didukung oleh *Leaderboard caching* berkinerja tinggi menggunakan IndexedDB dan strategi **SWR (Stale-While-Revalidate)**.

---

## 🛠️ Tumpukan Teknologi Tingkat Tinggi

| Layer | Teknologi Utama | Fungsi Utama |
| :--- | :--- | :--- |
| **Kerangka Kerja** | Next.js 16 (App Router), React 19, TS | Core aplikasi server-side rendering & type safety. |
| **Gaya & Visual** | Tailwind CSS v3, Framer Motion, Radix UI | Estetika semantik *Cyber-Glass*, transisi fisik pegas. |
| **State Server** | TanStack Query v5 (React Query) | Caching, orkestrasi mutasi data, retries otomatis 3x. |
| **State Lokal** | Zustand v5 + `idb-keyval` (IndexedDB) | Tier 1 data penyimpanan offline, latency < 16ms. |
| **Penyedia Awan** | Supabase (PostgreSQL, Auth, RPC) | Otentikasi aman, basis data progres dinamis pengguna. |
| **Penyedia Konten** | Sanity CMS (Studio Tertanam v3) | Sumber utama konten editorial statik (Pelajaran, Ujian). |
| **Media & Audio** | Native HTML5 Audio, Web Audio API | Pemutar audio kuis dan simulasi ujian linear. |

---

## 📂 Struktur Direktori Modular

Aplikasi mengikuti struktur arsitektur modular yang memisahkan logika bisnis visual dengan utilitas murni secara ketat:

```text
src/
├── actions/             # Server Actions Next.js (Dapur pacu interaksi basis data)
├── app/                 # Layer Perutean App Router Next.js 16
│   ├── (main)/          # Halaman utama aplikasi (Dashboard, Courses, Exams, dll.)
│   ├── auth/            # Gateway alur masuk, daftar, & reset sandi
│   ├── api/             # API Endpoints internal (Furigana generation, dll.)
│   └── studio/          # Sanity Studio CMS tersemat (Embedded CMS)
├── components/          
│   ├── features/        # Logika domain fitur (course, srs, exams, review)
│   ├── layout/          # Komponen kerangka global (Sidebar, Topbar, MobileNav)
│   └── ui/              # Komponen atomik semantik (SmartJapanese, Button, Card)
├── hooks/               # Custom hooks global (useSyncProgress, useCloudData)
├── lib/                 # Utilitas murni, algoritma SM-2, GROQ queries (Bebas JSX/TSX)
├── store/               # Zustand global stores terfragmentasi (Auth, User, SRS, UI)
└── types/               # Pengetikan statis TypeScript universal
```

---

## ⚙️ Memulai Pengembangan Lokal

### 1. Prasyarat Sistem
*   Node.js v18.x atau versi lebih tinggi
*   NPM (versi bawaan Node) atau PNPM

### 2. Instalasi Dependensi
```bash
# Clone repositori NihongoRoute
git clone https://github.com/zan-118/nihongoroute.git

# Masuk ke direktori proyek
cd nihongoroute

# Instal seluruh dependensi proyek
npm install
```

### 3. Konfigurasi Kunci Lingkungan (`.env.local`)
Buat berkas `.env.local` di root direktori proyek, lalu isi kunci berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Menjalankan Server Pengembangan
```bash
# Jalankan server Next.js lokal
npm run dev
```
Aplikasi kini dapat diakses secara lokal pada alamat [http://localhost:3000](http://localhost:3000).

---

## 🔒 Protokol Keamanan & Penanganan Kueri Dinamis

Untuk menjamin standar keamanan kelas enterprise, platform ini menerapkan protokol pertahanan berlapis:

1.  **Tameng XSS Konten Dinamis (`src/lib/sanitize.ts`)**:
    Seluruh konten HTML dinamis dari basis data atau input pengguna dibersihkan secara ketat menggunakan fungsi penyanitasi khusus sebelum disajikan ke komponen visual klien untuk menghindari eksekusi kode injeksi jahat.
2.  **Escape SQL Wildcard**:
    Semua parameter pencarian dinamis (misalnya pencarian teks kamus) di-escape dari karakter wildcard database (`%` dan `_`) secara otomatis di tingkat Server Actions guna memblokir manipulasi kueri PostgreSQL.
3.  **Next.js 16 Suspense Boundaries**:
    Setiap halaman klien yang menggunakan parameter kueri dinamis (`useSearchParams`) dibungkus dalam pembatas `<Suspense>` untuk mencegah deoptimisasi build Next.js dan memastikan kelancaran pembuatan halaman statik (*Static Site Generation*).
4.  **Keamanan Hydration & requestAnimationFrame**:
    Komponen server dilarang menerima event handler klien (seperti `onClick`, `onMouseEnter`) secara langsung. Seluruh interaksi visual yang membutuhkan interaktivitas dinamis wajib diekstraksi ke komponen klien terpisah dengan direktif `"use client";`. Inisialisasi state klien otomatis wajib dibungkus `requestAnimationFrame` untuk menghindari ketidakcocokan DOM hasil pre-render.
5.  **Aksesibilitas Tombol Ikonik (A11y)**:
    Setiap tombol navigasi visual yang hanya menggunakan simbol grafis tanpa teks visual diwajibkan menggunakan properti `aria-label` deskriptif terlokalisasi agar ramah bagi pembaca layar (*screen reader*).
6.  **Pemisahan Logika Halaman (Zero God-Files)**:
    Untuk menjaga kebersihan modularitas dan kemudahan pemeliharaan, berkas `page.tsx` di dalam `app/` dilarang memuat state logic kompleks. Seluruh logika tersebut diekstraksi ke dalam custom hook domain spesifik di dalam direktori `components/features/[domain]/`.

---

## 👨‍💻 Kontributor & Pemelihara

**Fauzan Abdul Basith**
*   GitHub: [@zan-118](https://github.com/zan-118)
*   Website Resmi: [fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
<div align="center">
  Dibuat dengan dedikasi tinggi untuk menghadirkan kualitas pendidikan bahasa Jepang terbaik, bebas hambatan, dan berkinerja tinggi bagi seluruh pembelajar di Indonesia. 🇯🇵💙
</div>
