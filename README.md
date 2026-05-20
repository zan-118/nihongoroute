# 🌀 NihongoRoute (日本語ルート)

<div align="center">
  <img src="./public/logo-branding.svg" alt="Logo NihongoRoute" width="120" height="120" />
  <h3>Ekosistem Pembelajaran Bahasa Jepang Profesional untuk Indonesia</h3>
  <p align="center">
    Platform pembelajaran generasi baru berbasis <strong>Offline-First</strong>, dirancang dengan estetika Cyber-Glass dan performa tingkat tinggi.
  </p>

  [![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
</div>

---

## 📖 Gambaran Proyek

**NihongoRoute** adalah ekosistem pembelajaran bahasa Jepang kelas enterprise yang disesuaikan khusus untuk pembelajar di Indonesia. Platform ini mengintegrasikan data pedagogis masif dengan **Sistem Desain Semantik Cyber-Glass** yang mutakhir. Fokus utama platform ini adalah pada performa tinggi dan interaksi berbasis *offline-first*, sembari memastikan sinkronisasi *cloud* yang mulus melalui protokol **3-Tier Sync** yang tangguh.

---

## ✨ Fitur Unggulan

### 💎 UI/UX Semantic Cyber-Glass
Antarmuka imersif yang dibangun sepenuhnya di atas **Token Desain Semantik** dan **Variabel RGB**. Sistem kami beradaptasi 100% secara dinamis antara mode Terang dan Gelap. Setiap border, shadow, dan efek neon (glow) memanfaatkan variabel dinamis untuk menyediakan lingkungan yang berorientasi pada fokus belajar dengan estetika premium.

### 🎯 Standardisasi Copywriting Ramah Pengguna (Language-Gap Elimination)
Aplikasi ini dirancang 100% ramah bagi pembelajar lokal di Indonesia dengan mengeleminasi kesenjangan bahasa (*language gap*) dari istilah teknologi yang rumit. Kami menggunakan padanan kata yang intuitif (seperti mengubah *Spaced Repetition (SRS)* menjadi "pengulangan cerdas", *Paywall* menjadi "biaya tersembunyi", dan *Streak* menjadi "hari beruntun") untuk menjamin navigasi yang bersih dan transparan bagi semua orang.

### 🧠 Mesin Pembelajaran Cerdas & SRS
- **Spaced Repetition (SRS) Lanjutan**: Algoritma SM-2 yang dimodifikasi dengan dukungan *due-date guarding* untuk retensi ingatan jangka panjang.
- **Arsitektur Split-Source Terpusat**: Konten editorial interaktif ditenagai oleh Sanity CMS, sementara data leksikal dan progres dinamis dikelola oleh Supabase melalui Server Actions berkinerja tinggi menggunakan *Parallel Fetching* (`Promise.all`).
- **Smart Japanese Rendering**: Komponen `SmartJapanese` yang melakukan parsing cerdas dan rendering Furigana dengan skala presisi `0.55em`.

### 🛡️ Arsitektur Offline-First
Dibangun dengan **Protokol Sinkronisasi 3-Tier**:
1. **Lapis Store (Zustand + IndexedDB)**: Umpan balik instan tanpa latensi (< 16ms).
2. **Lapis Orkestrasi (useSyncProgress)**: Pendeteksian perubahan otomatis dan *debouncing* di latar belakang.
3. **Lapis Mutasi (Supabase RPC)**: Sinkronisasi paket data "dirty" ke cloud dengan integritas multi-tab melalui BroadcastChannel API.

### 🔒 Keamanan Enterprise, Aksesibilitas & Penanganan Kueri Dinamis
- **Sanitasi HTML & Pelindung XSS**: Konten dinamis yang dimuat pengguna disaring secara ketat melalui fungsi `sanitizeHtml` (`src/lib/sanitize.ts`) untuk mencegah eksekusi skrip berbahaya.
- **Pencegahan SQL Injection**: Pengamanan kueri teks pencarian dengan meng-escape karakter wildcard SQL (`%` dan `_`) secara otomatis di Server Actions.
- **Next.js 16 Suspense Guards**: Membungkus penggunaan `useSearchParams` dengan `<Suspense>` di halaman-halaman dinamis klien guna menjamin kelancaran build statik di Next.js 16.
- **Keamanan Hydration & Kepatuhan Aksesibilitas**: Melindungi interaksi event handler Next.js dengan membatasi hook/callback visual ke komponen klien (`"use client"`) secara ketat, serta menstandarisasi atribut `aria-label` deskriptif di seluruh tombol pagination ikonik perpustakaan untuk ramah pembaca layar (*screen reader*).

### 🎮 Perjalanan Pedagogis Tergamifikasi
- **Sistem XP, Level & Streak**: Pembelajaran berbasis imbalan untuk menjaga motivasi belajar setiap hari.
- **Penguasaan JLPT N5 - N1**: Pelajaran terstruktur, panduan tata bahasa komprehensif, serta simulasi ujian interaktif.

---

## 🛠️ Stack Teknologi

| Layer | Teknologi |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS (Semantik), Framer Motion, Radix UI |
| **Database, Auth & CMS** | Supabase (PostgreSQL, RPC, Auth) & Sanity CMS |
| **State Management** | Zustand (Persisten via idb-keyval), TanStack Query v5 |
| **Media Layer** | Sanity Media Asset Management & Cloudinary (Legacy) |
| **Audio Engine** | Procedural Web Audio API & TTS Integration |

---

## 📂 Arsitektur Sistem

NihongoRoute mengikuti standar direktori yang ketat untuk modularitas dan skalabilitas:

- `app/`: Layer perutean (routing), komposisi halaman, dan Server Actions.
- `components/features/`: Logika bisnis spesifik domain (Quiz, SRS, Exams, Lessons).
- `components/ui/`: Komponen primitif atomik berbasis semantik.
- `lib/`: Fungsi utilitas murni, algoritma pedagogi, dan konfigurasi (**Tanpa TSX**).
- `store/`: Manajemen state global terfragmentasi dengan persistensi offline.

---

## 🚀 Memulai (Getting Started)

### 1. Prasyarat
- Node.js 18.x atau versi lebih tinggi
- NPM atau PNPM

### 2. Instalasi
```bash
# Clone repositori
git clone https://github.com/zan-118/nihongoroute.git

# Instal dependensi
npm install
```

### 3. Konfigurasi Lingkungan (Environment)
Buat file `.env.local` di direktori root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Pengembangan
```bash
npm run dev
```

---

## 🛡️ Pemeliharaan & Dukungan

**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Website: [fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
<div align="center">
  Dibangun dengan semangat untuk mendemokratisasi akses pendidikan Bahasa Jepang berkualitas di Indonesia. 🇯🇵💙
</div>
