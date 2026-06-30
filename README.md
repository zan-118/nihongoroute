<p align="center">
  <img src="public/logo-branding.svg" alt="NihongoRoute" width="92" />
</p>

<h1 align="center">NihongoRoute</h1>

<p align="center">
  Platform pembelajaran Bahasa Jepang interaktif khusus untuk pelajar Indonesia. Dirancang dengan prinsip <strong>offline-first</strong> (luring), dilengkapi sistem pengulangan cerdas (SRS), gamifikasi dasbor, konten pembelajaran dinamis dari Sanity CMS, dan sinkronisasi progres otomatis yang didukung oleh Supabase.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2.2-black?style=flat-square&logo=nextdotjs" />
  <img alt="React" src="https://img.shields.io/badge/React-19.2.2-149eca?style=flat-square&logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-auth%20%7C%20db%20%7C%20storage-3fcf8e?style=flat-square&logo=supabase&logoColor=white" />
  <img alt="Sanity" src="https://img.shields.io/badge/Sanity-CMS-f03e2f?style=flat-square&logo=sanity&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Vitest-unit-6e9f18?style=flat-square&logo=vitest&logoColor=white" />
  <img alt="Playwright" src="https://img.shields.io/badge/Playwright-E2E-2ead33?style=flat-square&logo=playwright&logoColor=white" />
</p>

---

## Gambaran Umum

NihongoRoute menggabungkan materi pembelajaran terstruktur, pustaka lengkap kosakata/kanji/tata bahasa, latihan membaca dan menyimak interaktif, dek flashcard kustom, dasbor ulasan kartu SRS (Spaced Repetition System), simulasi ujian JLPT (Mock Exam), gamifikasi profil (XP, level, streak), serta Studio Sanity tertanam.

Proyek ini menerapkan **arsitektur split-source**:

| Komponen | Tanggung Jawab |
| --- | --- |
| **Next.js App Router** | Mengatur halaman, layouts, rute API, dan penayangan Sanity Studio tertanam di rute `/studio`. |
| **Supabase** | Otentikasi pengguna, database PostgreSQL (kamus leksikal, progress belajar, log ujian, postingan forum), media audio statis VOICEVOX TTS, dan RPC `sync_user_progress`. |
| **Sanity CMS** | Pusat konten pembelajaran editorial dinamis seperti materi pelajaran, bacaan, listening, dan paket soal ujian. |
| **Zustand** | Manajemen status global klien yang dipersistensikan secara luring ke IndexedDB menggunakan `idb-keyval`. |
| **TanStack Query** | Mengelola fetching sesi, pengambilan progres awal, dan orkestrasi background sync. |
| **Kuroshiro + Kuromoji** | Pemrosesan konversi Furigana pada API route. |

---

## Pusat Dokumentasi Teknis Modular (Bahasa Indonesia)

Seluruh dokumentasi teknis sistem telah dipecah secara modular berdasarkan fungsinya di folder `docs/` untuk mempermudah pemeliharaan:

* 📖 **[Indeks Dokumentasi (README)](docs/README.md)**: Titik masuk utama seluruh file dokumentasi modular.
* ⚙️ **[Arsitektur Aplikasi](docs/arsitektur-aplikasi.md)**: Penjelasan Next.js App Router, orkestrasi Zustand, IndexedDB, dan TanStack Query.
* 🔄 **[Sinkronisasi Progres Luring](docs/sinkronisasi-progres.md)**: Alur sinkronisasi progress 3-tingkat, BroadcastChannel lintas tab, dan validasi anti-cheat XP.
* 🧠 **[Logika SRS & Gamifikasi](docs/logika-srs-dan-gamifikasi.md)**: Cara kerja modifikasi algoritma SM-2, Due-Date Guard, Modern Halving, streak freeze, dan kenaikan level.
* 🔊 **[Sintesis Audio & Furigana](docs/sintesis-audio-dan-furigana.md)**: Integrasi VOICEVOX TTS, fallback Web Speech API, deteksi suara otomatis, dan komponen SmartJapanese.
* 🗄️ **[Skema Database & RLS](docs/skema-database-dan-rls.md)**: Skema tabel relasional Supabase, trigger database, index, policies, dan storage buckets.
* 🔗 **[Server Actions & API Routes](docs/server-actions-dan-api.md)**: Penjelasan actions di `src/actions/` dan endpoint API route.
* 📝 **[Simulasi Ujian JLPT](docs/simulasi-ujian-jlpt.md)**: Arsitektur Mock Exam, format berkas impor JSON, skrip generator CLI, adapter, dan UI engine.
* 🔍 **[Audit Kompatibilitas Ujian](docs/audit-kompatibilitas-ujian.md)**: Lapisan adapter bank soal Supabase ke legacy engine.
* 🎨 **[Visualisasi Arsitektur](docs/visualisasi-arsitektur.md)**: Diagram visual alur data, sync, runtime, dan studio.
* 📂 **[Struktur Folder Proyek](docs/struktur-folder-proyek.md)**: Pemetaan folder dan file di repositori NihongoRoute.
* 📐 **[Cetak Biru Ujian JLPT](docs/cetak-biru-ujian-jlpt.md)**: Arsitektur lengkap dan cetak biru implementasi 7-fase bank soal Supabase.
* 🧪 **[Arsitektur Pengujian](docs/arsitektur-pengujian.md)**: Uji unit Vitest dan pengujian Playwright E2E.
* 🛠️ **[Panduan Operasional & Runbook](docs/operasional-dan-runbook.md)**: Standar deploy, rollback, backup & restore, penanganan insiden, dan skrip utilitas.

---

## Cara Memulai Pengembangan

### 1. Prasyarat Instalasi
Pastikan Node.js terinstal di lokal. Unduh repositori dan pasang dependensi:
```bash
npm install
```

### 2. Menjalankan Server Pengembangan Lokal
Jalankan perintah berikut untuk mengaktifkan server lokal Next.js:
```bash
npm run dev
```
Buka peramban dan navigasikan ke alamat: `http://localhost:3000`

### 3. Membangun dan Menjalankan Mode Produksi
```bash
npm run build
npm run start
```

---

## Skrip NPM yang Tersedia

| Skrip | Deskripsi |
| --- | --- |
| `npm run dev` | Menjalankan server lokal pengembangan Next.js. |
| `npm run build` | Membangun bundel produksi aplikasi mandiri (standalone). |
| `npm run start` | Menjalankan server produksi setelah build. |
| `npm run lint` | Menjalankan analisis statis ESLint untuk mendeteksi kesalahan sintaks. |
| `npm run lint:fix` | Menjalankan analisis statis ESLint dan memperbaiki kesalahan otomatis. |
| `npm run typecheck` | Menjalankan pemeriksaan tipe ketat TypeScript tanpa memproduksi file output. |
| `npm run test` | Menjalankan rangkaian uji unit Vitest satu kali. |
| `npm run test:unit` | Menjalankan uji unit gate kualitas integrasi. |
| `npm run test:watch` | Menjalankan uji unit Vitest dalam mode interaktif (watch mode). |
| `npm run test:e2e` | Menjalankan uji visual ujung-ke-ujung (E2E) menggunakan Playwright. |
| `npm run db:migrations:check` | Memvalidasi integritas nama file dan keunikan stempel waktu migrasi Supabase. |
| `npm run prepare` | Memasang Husky git hooks. |

---

## Konvensi dan Aturan Utama Repositori

1. **Zustand Selectors**: Selalu gunakan selektor atomik (contoh: `useUserStore((s) => s.xp)`) saat berlangganan status store untuk mencegah render ulang berlebih. Jangan melakukan destructuring pada store.
2. **Database Service Role**: Penggunaan `createAdminClient()` murni terbatas di lingkungan server aman (Route Handlers/Server Actions/Skrip). Jangan mengekspos kunci admin ke klien Next.js dengan prefiks `NEXT_PUBLIC_`.
3. **Penyimpanan Audio TTS**: File audio pengucapan kosakata dihasilkan offline menggunakan skrip, bukan secara real-time pada saat user meminta di API route. Cache miss wajib mengembalikan status `404` untuk memicu fallback Web Speech API di peramban klien.
4. **Pembaruan Skema**: Saat melakukan modifikasi tabel database, perbarui juga file `src/types/database.ts` dan pastikan migrasi SQL tercatat dengan nama terurut di folder `supabase/migrations/`.
