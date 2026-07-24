# Keputusan Arsitektur Informasi

> Terakhir diperbarui: 24 Juli 2026

---

Dokumen ini mencatat keputusan penting terkait tata letak, peran halaman, dan arsitektur informasi untuk mencegah redundansi atau kebingungan rute.

---

## 1. Pustaka vs Kamus Terpadu

**Tanggal**: Juli 2026

### Konteks

Pustaka (`/library`) dan Kamus Terpadu (`/tools/dictionary`) keduanya menyediakan data dari entitas yang sama (kosakata, kanji, tata bahasa) dengan fitur pencarian dan SRS.

### Keputusan

Keduanya dipertahankan — melayani model mental berbeda:

| Fitur | Pustaka (`/library`) | Kamus Terpadu (`/tools/dictionary`) |
|-------|---------------------|-------------------------------------|
| **Pola** | BROWSE | SEARCH |
| **Alur** | Jelajah terstruktur per kategori → halaman detail → tambah SRS | Cari lintas kategori dalam satu input → tambah SRS langsung dari hasil |
| **Kapan dipakai** | Melihat daftar materi berurutan, eksplorasi topik mendalam | Pencarian cepat dan spesifik |

### Aksi

Deskripsi eksplisit ditambahkan di kartu Kamus Terpadu di `src/lib/constants/tools.ts` untuk menegaskan perbedaan Search vs Browse.

---

## 2. Halaman Ujian

**Tanggal**: Juli 2026

### Keputusan

Ujian (`/exams`) berdiri sendiri sebagai navigasi root-level. Kartu "Ujian & Sertifikasi" yang sebelumnya ada di Pustaka dihapus untuk menghindari duplikasi jalur navigasi.
