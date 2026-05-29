# 🌀 NihongoRoute (日本語ルート)

<div align="center">
  <img src="./public/logo-branding.svg" alt="Logo NihongoRoute" width="140" height="140" style="margin-bottom: 16px;" />
  <h2><b>Platform Pembelajaran Bahasa Jepang Tingkat Enterprise Berbasis Offline-First</b></h2>
  <p align="center">
    Ekosistem pembelajaran mandiri berkinerja tinggi dengan latensi super rendah (&lt; 16ms), dirancang menggunakan visual modern <strong>Cyber-Glass</strong>, sistem data terdistribusi <strong>3-Tier Sync</strong>, serta bebas hambatan terminologi.
  </p>

  <p align="center">
    <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16_App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Strict_Type-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Backend_RPC-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://sanity.io/"><img src="https://img.shields.io/badge/Sanity.io-Editorial_CMS-F03E3E?style=for-the-badge&logo=sanity&logoColor=white" alt="Sanity" /></a>
  </p>
</div>

---

## 🌌 Filosofi & Visi Utama Ekosistem

**NihongoRoute** mendefinisikan ulang batas-batas media pembelajaran bahasa asing secara mandiri di Indonesia. Kami mengeliminasi seluruh hambatan finansial, teknologi, dan bahasa melalui empat pilar dasar:

*   **⚡ Zero Latency & Offline-First (< 16ms)**: Seluruh pencatatan progres, penyelesaian kuis kosakata, perolehan Poin XP, dan kalkulasi interval memori pengulangan cerdas (SRS) diproses secara instan di sisi peramban klien. Interaksi berjalan lancar tanpa terhalang ketidakstabilan jaringan internet.
*   **🔓 Zero Gatekeeping (Akses Tanpa Batas)**: Pengguna memiliki hak akses penuh 100% untuk menikmati seluruh modul pelajaran dan simulasi ujian tanpa kewajiban pendaftaran akun. Akun pengguna bersifat opsional, murni digunakan untuk melakukan pencadangan otomatis ke awan (*cloud storage*).
*   **🌐 Zero Language-Gap (Terminologi Intuitif)**: Semua jargon teknologi SaaS yang membingungkan, singkatan asing yang kaku, atau istilah penerbangan yang tidak relevan dieliminasi seutuhnya dari antarmuka visual. Seluruh copywriting dirancang dalam Bahasa Indonesia yang santun, presisi, dan ramah pemula.
*   **🔄 Sinkronisasi Tab Instan**: Memanfaatkan API `BroadcastChannel` lokal untuk menyelaraskan status belajar di seluruh tab aktif peramban secara real-time tanpa membutuhkan muat ulang halaman (*zero-refresh caching*).

---

## 💎 Empat Pilar Arsitektur Sistem Utama

### 1. Sistem Desain Semantik Cyber-Glass
Mengusung estetika visual futuristik bergaya *Neo-Tokyo Cyber-Glass* (`backdrop-blur` tebal, border visual transisi, efek glow neon halus). Seluruh sistem styling diatur melalui variabel CSS semantik terpusat (`bg-background`, `text-foreground`, `primary`, `success`, dll.), memastikan antarmuka adaptif yang sangat nyaman di mata untuk penggunaan larut malam maupun luar ruangan.

### 2. Protokol Sinkronisasi Awan 3-Tier
Aliran data offline-first yang andal diatur melalui pembagian tiga lapisan sinkronisasi:
1.  **Lapis UI & Keadaan Lokal (Zustand + IndexedDB)**: Memperbarui Zustand store (`useUserStore`, `useSRSStore`) secara instan demi *instant feedback* kepada pengguna, lalu otomatis dipersistensikan ke IndexedDB via `idb-keyval`.
2.  **Lapis Orkestrasi (`useSyncProgress`)**: Melakukan pemantauan perubahan store secara pasif dan menerapkan strategi *debouncing* asinkron (2 detik) guna memaketkan modifikasi lokal (*dirty data*).
3.  **Lapis Persistensi Awan (`useCloudMutation`)**: Menggunakan TanStack Query untuk mengeksekusi sinkronisasi terkompresi langsung ke prosedur Supabase RPC (`sync_user_progress`) dengan mekanisme ketahanan *3x automatic retries*.

### 3. Mesin Simulasi JLPT & JFT-Basic Terkemuka
*   **Answer Sheet Grid**: Navigasi visual mutakhir berbentuk grid interaktif guna melacak pengerjaan soal ujian secara real-time (Hijau: Terisi, Amber Berkedip: Kosong, Abu-abu Gembok: Bagian Soal Terkunci).
*   **Batas Keras Audio 1-Kali Putar**: Simulasi ketat sesuai regulasi ujian resmi. Jika pengguna berpindah soal saat mendengarkan audio, sistem secara fisik mematikan audio latar belakang dan langsung mengunci statusnya menjadi `'played'` secara permanen.
*   **Penilaian Ambang Batas Kelulusan (Maiten)**: Evaluasi ujian yang menerapkan sistem batas nilai minimal $32\%$ di setiap seksi materi. Peserta dinyatakan tidak lulus apabila ada satu kategori yang berada di bawah ambang batas, meskipun total nilai akumulatif melampaui batas kelulusan global.
*   **Visualisasi Sertifikat Realistis**: Dasbor laporan hasil dual-view interaktif yang dapat beralih secara instan antara visualisasi analitik modern dan sertifikat fisik otentik (JLPT vintage parchment lengkap dengan cap hanko merah berputar, serta JFT-Basic CBT CEFR A2 bilingual).

### 4. Smart Japanese Parser & Smart Rendering
*   **SmartJapanese Engine**: Komponen rendering cerdas yang mendeteksi teks Jepang secara dinamis untuk menyisipkan anotasi Furigana di atas Kanji secara presisi menggunakan skala relatif `0.55em` pada tag `<rt>`.
*   **Word Popover Dinamis**: Pengguna cukup mengeklik kosakata apa pun di dalam teks materi pelajaran untuk memicu popover kamus interaktif (definisi kata, pengucapan teks-ke-suara/TTS luring, dan tombol pintas `AddToSRSButton` untuk memasukkan kartu ke antrean SRS lokal & cloud).

---

## 🛠️ Tumpukan Teknologi Proyek

| Lapisan Sistem | Teknologi | Deskripsi Fungsi |
| :--- | :--- | :--- |
| **Kerangka Kerja Core** | Next.js 16 (App Router) & React 19 | Server-side rendering (RSC), hidrasi asinkron, tipe data statis via TypeScript. |
| **Visual & Estetika** | Tailwind CSS v3 & Framer Motion | Desain semantik siber-glass neon, animasi pegas fisik super mulus. |
| **Manajemen State Awan** | TanStack Query v5 (React Query) | Sinkronisasi asinkron latar belakang, caching data dinamis, retry otomatis. |
| **Manajemen State Lokal** | Zustand v5 & `idb-keyval` (IndexedDB) | Tier-1 offline storage, sinkronisasi luring tanpa hambatan latensi jaringan. |
| **Integritas Transaksi** | Supabase (PostgreSQL, Auth, RPC) | Autentikasi sesi aman, validasi logika anti-cheat level database. |
| **Manajemen Konten** | Sanity CMS (Studio v3 Tersemat) | Sumber kebenaran modular untuk konten edukasi editorial statis. |
| **Efek Suara & Audio** | Web Audio API & HTML5 Audio | Orkestrasi SoundEngine untuk audio prosedural dan pemutar audio linear ujian. |

---

## ⚙️ Memulai Pengembangan Lokal

### 1. Prasyarat Sistem
*   Node.js v18.x atau versi lebih tinggi
*   NPM (bawaan Node) atau PNPM

### 2. Langkah Instalasi Proyek
```bash
# Klon repositori NihongoRoute
git clone https://github.com/zan-118/nihongoroute.git

# Masuk ke folder proyek
cd nihongoroute

# Pasang seluruh dependensi
npm install
```

### 3. Pengaturan Kunci Lingkungan (`.env.local`)
Buat berkas `.env.local` pada direktori root proyek, lalu isi variabel lingkungan berikut:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SANITY_PROJECT_ID=your-sanity-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Menjalankan Server Pengembangan Lokal
```bash
# Jalankan server Next.js lokal
npm run dev
```
Aplikasi kini dapat diakses secara lokal pada alamat [http://localhost:3000](http://localhost:3000).

---

## 🔒 Protokol Keamanan & Sanitasi Kueri Dinamis

Untuk memenuhi standar keamanan dan keandalan rekayasa enterprise, NihongoRoute mengimplementasikan proteksi berlapis:

1.  **Tameng XSS Konten Dinamis (`src/lib/sanitize.ts`)**: Seluruh visualisasi HTML dinamis (misalnya ulasan jawaban ujian atau tabel lembar contekan interaktif) disaring secara ketat melalui fungsi penyanitasi khusus berbasis ekspresi reguler sebelum dirender untuk mencegah injeksi skrip jahat.
2.  **Pemberhentian Injeksi SQL Wildcard**: Seluruh parameter pencarian dinamis (seperti pencarian teks pada kamus kosakata) di-escape secara otomatis dari karakter database khusus (`%` dan `_`) di tingkat Server Actions sebelum dieksekusi di database Supabase.
3.  **Next.js Suspense Boundaries**: Semua halaman klien yang mengonsumsi parameter kueri dinamis via hook `useSearchParams` dibungkus secara disiplin di dalam komponen `<Suspense>` untuk mencegah terjadinya deoptimisasi build Next.js saat kompilasi static pages.
4.  **Keamanan Hidrasi & Penanganan State Klien**: Komponen server dilarang menerima event handler klien (seperti `onClick`) secara langsung pada elemen mentah HTML. Seluruh komponen interaktif diekstraksi ke komponen klien terpisah dengan direktif `"use client";`. Inisialisasi state otomatis klien di dalam efek samping wajib dibungkus `requestAnimationFrame` guna menghindari ketidakcocokan DOM hasil pre-render.

---

## 👨‍💻 Kontributor & Pemelihara Proyek

*   **Fauzan Abdul Basith** - Pemimpin Rekayasa Teknologi
    *   GitHub: [@zan-118](https://github.com/zan-118)
    *   Website: [fauzanabdulbasith.com](https://www.fauzanabdulbasith.com)

---
<p align="center">
  Dibuat dengan dedikasi penuh untuk menghadirkan media pembelajaran bahasa Jepang gratis berkualitas tinggi, berkinerja tinggi, dan andal bagi seluruh generasi pembelajar di Indonesia. 🇯🇵💙
</p>
