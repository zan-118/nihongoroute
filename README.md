# 🌀 NihongoRoute (日本語ルート)

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Sanity](https://img.shields.io/badge/Sanity-F1662A?style=for-the-badge&logo=sanity&logoColor=white)](https://www.sanity.io/)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📝 Deskripsi
**NihongoRoute** adalah platform pembelajaran mandiri (self-learning) bahasa Jepang tingkat profesional untuk pembelajar JLPT N5 hingga N2. Dibangun dengan estetika modern **Cyber-Dark Neumorphic**, aplikasi ini memberikan pengalaman belajar yang imersif dan tergamifikasi untuk menguasai kosakata, tata bahasa, dan kanji. Platform ini mengutamakan performa *local-first* yang dikombinasikan dengan arsitektur headless CMS yang tangguh.

---

## ✨ Fitur Utama
- **🧠 SRS Memory Engine:** Sistem Repetisi Spasi (Spaced Repetition System) canggih untuk retensi kosakata yang efisien.
- **🎮 Progres Tergamifikasi:** Dashboard interaktif dengan sistem XP, level, dan heatmap aktivitas.
- **🎓 Mock Exam Engine:** Simulasi ujian JLPT lengkap dengan sesi waktu, penguncian audio, dan mekanisme anti-curang.
- **🖋️ Interactive Kanji Pad:** Animasi urutan coretan (*stroke order*) dan kanvas menulis digital untuk latihan aktif.
- **📚 Perpustakaan Referensi:** Database lengkap konjugasi kata kerja, artikel tata bahasa, dan tabel referensi cepat interaktif.
- **📱 Siap PWA:** Dapat diinstal di perangkat seluler dan desktop untuk pengalaman layaknya aplikasi native.

---

## 🛠️ Stack Teknologi
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
- **CMS:** [Sanity.io](https://www.sanity.io/) (Content Lake)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Animasi:** [Framer Motion](https://www.framer.com/motion/)
- **Manajemen State:** React Context API dengan persistensi LocalStorage
- **Library Tambahan:** Wanakana (Pemrosesan teks Jepang), Lucide React (Ikon), Canvas Confetti

---

## 📂 Struktur Proyek
```text
├── app/                  # Next.js App Router (Halaman & API)
│   ├── (main)/           # Rute utama aplikasi (Dashboard, Kursus, Perpustakaan)
│   ├── studio/           # Rute untuk Sanity Studio (Embedded)
│   └── api/              # Endpoint API backend
├── components/           # Komponen UI yang dapat digunakan kembali (Atomic design)
├── context/              # Provider state global (XP, Progress, Tema)
├── lib/                  # Fungsi utilitas & logika inti (SRS, Formatter)
├── public/               # Aset statis (Gambar, Audio, Font)
├── sanity/               # Konfigurasi Sanity CMS & skema data
│   ├── schemaTypes/      # Definisi Dokumen & Objek
│   └── lib/              # Client Sanity & logika pengambilan data
└── types/                # Interface TypeScript global
```

---

## 🚀 Instalasi
1. **Clone repositori:**
   ```bash
   git clone https://github.com/zan-118/nihongoroute.git
   cd nihongoroute
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

---

## 🔑 Variabel Lingkungan
Buat file `.env.local` di direktori root dan tambahkan variabel berikut:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="id_proyek_anda"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2024-04-01"
```

---

## 🏃 Menjalankan Proyek
- **Mode Pengembangan:**
  ```bash
  npm run dev
  ```
- **Build Produksi:**
  ```bash
  npm run build
  npm run start
  ```
- **Linting:**
  ```bash
  npm run lint
  ```

---

## 📖 Dokumentasi API
Proyek ini menggunakan **Sanity GROQ** untuk pengambilan data. Struktur data utama meliputi:
- `vocab`: Item kosakata dengan level JLPT dan terjemahan.
- `grammarArticle`: Penjelasan tata bahasa mendalam.
- `mockExam`: Soal ujian simulasi JLPT dan audio terkait.
- `kanji`: Karakter kanji dengan data urutan coretan.
- `verbDictionary`: Aturan konjugasi dan contoh penggunaan.

Akses CMS Studio di rute `/studio` untuk mengelola konten secara lokal atau melalui Sanity Cloud.

---

## 🧪 Pengujian (Testing)
Saat ini, proyek fokus pada QA manual dan pengujian unit untuk logika inti.
- **Logika Inti:** Berada di dalam direktori `lib/`.
- **Komponen UI:** Diuji melalui iterasi cepat di mode `dev`.

*Direncanakan: Implementasi Playwright untuk pengujian E2E.*

---

## 🌐 Deployment
Proyek ini dioptimalkan untuk **Vercel**.
1. Push kode Anda ke GitHub.
2. Hubungkan repositori Anda ke Vercel.
3. Konfigurasi [Variabel Lingkungan](#-variabel-lingkungan).
4. Deploy.

---

## 🤝 Kontribusi
Kami menerima kontribusi dengan senang hati! Langkah-langkah kontribusi:
1. Fork Proyek ini.
2. Buat Branch Fitur baru (`git checkout -b feature/FiturKeren`).
3. Commit Perubahan Anda (`git commit -m 'Menambahkan FiturKeren'`).
4. Push ke Branch tersebut (`git push origin feature/FiturKeren`).
5. Buka Pull Request.

---

## 👤 Maintainer
**Fauzan Abdul Basith**
- GitHub: [@zan-118](https://github.com/zan-118)
- Website: [nihongoroute.my.id](https://www.nihongoroute.my.id)

---
Dikembangkan dengan 💙 untuk komunitas pembelajar bahasa Jepang.
