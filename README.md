````markdown
# 🌸 NihongoPath

NihongoPath adalah platform belajar bahasa mandiri yang gratis dan berbasis donasi, didesain khusus untuk membantu pelajar menguasai bahasa Jepang dari level dasar (N5) hingga mahir (N1).

Dibangun dengan arsitektur web modern, platform ini menggabungkan kurikulum yang terstruktur dengan teknik belajar saintifik seperti _Spaced Repetition System_ (SRS) dan Gamifikasi.

## ✨ Fitur Utama

- **📖 Kurikulum Terstruktur:** Materi pembelajaran komprehensif dari JLPT N5 hingga N1 yang dikelola sepenuhnya melalui antarmuka CMS yang lincah.
- **🧠 SRS Flashcard Engine:** Sistem pengingat kosakata pintar yang meniru algoritma Anki/WaniKani, memastikan pengguna me-review kosakata tepat saat mereka hampir melupakannya.
- **🎮 Gamifikasi & Progres:** Dilengkapi dengan sistem XP, _Leveling_, _Daily Streaks_, dan _Achievements_ untuk menjaga motivasi belajar.
- **🗣️ Text-to-Speech (TTS):** Dukungan audio pelafalan bahasa Jepang asli (ja-JP) terintegrasi langsung di dalam materi menggunakan Web Speech API.
- **🎨 Rich Text & Interaktif:** Artikel materi mendukung _Furigana_ (cara baca kanji), _Callout Info Boxes_, dan _Interactive Kana Tables_.
- **⚡ Headless Architecture:** Performa sangat cepat dengan pemisahan antara konten materi (Sanity CMS) dan data pengguna (Supabase).

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) & React 19
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Content Management (CMS):** [Sanity.io](https://www.sanity.io/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Animation:** Canvas Confetti

## 🚀 Cara Menjalankan di Komputer Lokal

### 1. Prasyarat

Pastikan kamu sudah menginstal Node.js (versi 18.x atau terbaru) dan npm.

### 2. Clone Repositori

```bash
git clone [https://github.com/username-kamu/nihongopath.git](https://github.com/username-kamu/nihongopath.git)
cd nihongopath
```
````

### 3. Instalasi Dependensi

Karena penggunaan kombinasi Next.js 15 dan ekosistem Sanity/React 19 terbaru, sangat disarankan menggunakan _flag_ ini untuk menghindari _dependency conflict_:

```bash
npm install --legacy-peer-deps
```

### 4. Konfigurasi Environment Variables

Buat file bernama `.env.local` di _root folder_ dan isi dengan kredensial dari Supabase dan Sanity milikmu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browsermu untuk melihat hasil akhirnya.

## 🗄️ Manajemen Konten (Sanity Studio)

NihongoPath memiliki _admin dashboard_ internal yang bisa diakses langsung di lingkungan _development_ maupun _production_ tanpa perlu membuka tab baru.

Akses URL berikut untuk masuk ke mode Editor Konten:
[http://localhost:3000/studio](http://localhost:3000/studio)

## 🤝 Dukungan & Donasi

Platform ini 100% gratis dan terbuka untuk siapa saja yang ingin belajar. Jika platform ini membantumu, pertimbangkan untuk memberikan dukungan melalui donasi agar server tetap berjalan dan fitur baru terus dikembangkan!

```

```
