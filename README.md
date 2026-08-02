<p align="center">
  <a href="https://nihongoroute.my.id">
    <img src="public/opengraph-image.png" alt="NihongoRoute Banner" width="100%" style="border-radius: 8px;" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.8-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Quality_Gate-Passed-4EAA25?style=for-the-badge&logo=githubactions&logoColor=white" alt="Quality Gate" />
</p>

<p align="center">
  <strong>NihongoRoute</strong> adalah <em>self-study platform</em> modern untuk belajar Bahasa Jepang tanpa pusing soal koneksi internet. Mengusung arsitektur <strong>Offline-First</strong>, platform ini memastikan sesi belajar Anda tetap mulus, instan, dan bebas lemot—di mana saja, kapan saja.
</p>

<p align="center">
  <a href="docs/README.md">📖 Baca Dokumentasi Teknis</a> 
  • 
  <a href="#-memulai-cepat-quick-start">🚀 Panduan Instalasi</a> 
  • 
  <a href="CONTRIBUTING.md">🤝 Kontribusi</a>
  • 
  <a href="ROADMAP.md">🗺️ Roadmap</a>
</p>

---

## ⚡ Fitur Utama

### 🔋 Offline-First: Belajar Tanpa Putus
Semua data belajar, kuis, dan review kartu flashcard (SRS) langsung tersimpan aman di browser Anda menggunakan IndexedDB (via Zustand & `idb-keyval`). UI super responsif dengan latensi 0ms.

### 🔄 Sync 3-Tingkat yang Pintar
Progres lokal Anda otomatis diunggah ke cloud Supabase secara cerdas menggunakan *dirty tracking* dan *debouncing* 2000ms.

### 🛡️ Anti-Cheat XP & Gamifikasi Adil
Perolehan XP, level, dan streak dihitung dan divalidasi langsung di server PostgreSQL lewat RPC `sync_user_progress`.

### 🔊 Smart Cache Text-to-Speech (TTS)
Pelafalan audio bahasa Jepang secepat kilat via `tts_cache` Supabase dan MsEdgeTTS.

### 📝 Simulasi Ujian JLPT Realistis
Simulasi CBT JLPT N5 hingga N1 dengan generator soal relasional Supabase.

---

## 🛠️ Di Balik Layar (Tech Stack)

- **Sisi Klien (Client-Side)**: Next.js 16 Client Components, Zustand, React Query v5, Tailwind CSS, Framer Motion, Wanakana.
- **Sisi Server (Server-Side)**: Next.js Server Actions, Route Handlers, Kuroshiro & Kuromoji, Google Gemini API.
- **Infrastruktur**: Supabase (PostgreSQL Database, Auth, Storage Buckets, & RLS Policies).

---

## 🚀 Memulai Cepat (Quick Start)

### 1. Prasyarat
Node.js versi **`>= 20.x`** (CI pakai `22.x`).

### 2. Kloning & Instalasi
```bash
git clone https://github.com/zan-118/nihongoroute.git
cd nihongoroute
npm install
```

### 3. Konfigurasi Kunci API (.env)
```bash
cp .env.example .env.local
```

### 4. Jalankan Server Development
```bash
npm run dev
```

### 5. Pengujian Quality Gate
```bash
npm run typecheck             # Validasi tipe TypeScript
npm run lint                  # Pengecekan linter kode (ESLint)
npm run test:unit             # Eksekusi unit test fungsional (Vitest)
npm run db:migrations:check   # Validasi stempel berkas migrasi database
npm run build                 # Kompilasi build rilis produksi
```

---

## 📂 Peta Dokumentasi Teknis Multi-Layer

Dokumentasi detail arsitektur sistem dan model data tersimpan secara terstruktur pada direktori [`docs/`](docs/README.md):

* 📖 **[Indeks Utama Dokumentasi (docs/README.md)](docs/README.md)**
* 🗺️ **[Overview & Deskripsi Proyek](docs/OVERVIEW.md)**
* 🏛️ **[Arsitektur Sistem & Alur Data](docs/ARCHITECTURE.md)**
* 📦 **[Panduan Memulai & Setup](docs/GETTING_STARTED.md)**
* ⚙️ **[Konfigurasi Variabel Lingkungan](docs/CONFIGURATION.md)**
* 🔌 **[Referensi API & Route Handlers](docs/API_REFERENCE.md)**
* 💾 **[Model Data & Skema Database (28 Tabel)](docs/DATA_MODEL.md)**
* 🚢 **[Deployment & Ops Runbook](docs/DEPLOYMENT.md)**
* 🔒 **[Keamanan, RLS, & Enkapsulasi Token](docs/SECURITY.md)**
* 🎨 **[Design System & Token UI](docs/DESIGN_SYSTEM.md)**
* 🛠️ **[Troubleshooting & FAQ Operasional](docs/TROUBLESHOOTING.md)**
* 🤝 **[Panduan Kontribusi Teknis](docs/CONTRIBUTING.md)**
* 📜 **[Architecture Decision Records (ADR)](docs/ADR.md)**

---

<p align="center">
  <sub>Dikelola oleh tim pengembang NihongoRoute • Rilis terakhir diperbarui pada 2 Agustus 2026.</sub>
</p>
