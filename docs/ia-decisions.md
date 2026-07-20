# Keputusan Arsitektur Informasi (IA)

Dokumen ini mencatat keputusan-keputusan penting terkait tata letak, peran halaman, dan arsitektur informasi aplikasi agar tidak terjadi redundansi atau kebingungan rute di masa depan.

## 1. Pustaka vs Kamus Terpadu
**Tanggal**: Juli 2026

Sempat ada kebingungan antara peran Pustaka (`/library`) dan Kamus Terpadu (`/tools/dictionary`), karena keduanya menyediakan data dari entitas yang sama (kosakata, kanji, tata bahasa) dan memiliki fitur pencarian serta SRS.

**Keputusan**: Keduanya dipertahankan karena melayani model mental / alur pengguna yang berbeda:
- **Pustaka (`/library`) — Pola BROWSE**: 
  Fokus pada penjelajahan terstruktur per kategori dengan halaman detail yang lengkap. Pengguna masuk ke Pustaka saat ingin melihat daftar materi secara berurutan atau mengeksplorasi suatu topik secara mendalam. Untuk menambah ke jadwal hafalan (SRS), pengguna perlu masuk ke halaman detail item tersebut.
- **Kamus Terpadu (`/tools/dictionary`) — Pola SEARCH**: 
  Fokus pada kecepatan pencarian lintas batas kategori (kosakata + kanji + tata bahasa) dalam satu kolom input. Pengguna dapat langsung menambahkan item ke SRS dari hasil pencarian seketika, tanpa harus membuka halaman detail. Kamus Terpadu digunakan untuk pencarian instan dan spesifik.

**Aksi yang diambil**: 
Menambahkan deskripsi eksplisit di kartu Kamus Terpadu pada daftar Alat (`src/lib/constants/tools.ts`) untuk menegaskan perbedaan pola *Search* vs *Browse* ini, sehingga pengguna paham harus menggunakan alat yang mana sesuai kebutuhannya.

## 2. Halaman Ujian (Exams)
**Tanggal**: Juli 2026

**Keputusan**: Ujian (`/exams`) berdiri sendiri sebagai root-level navigasi.
Kartu "Ujian & Sertifikasi" yang sebelumnya ada di dalam Pustaka (`/library`) telah dihapus untuk menghindari duplikasi jalur navigasi.
