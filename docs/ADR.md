# Architecture Decision Records (ADR)

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
> **Ruang Lingkup**: Catatan Keputusan Arsitektural, Arsitektur Informasi, & Trade-Off System Design  
> **Rujukan Utama**: [README.md](../README.md) | [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📋 Daftar Isi

1. [ADR-001: Separation of Pustaka (Browse) vs Kamus Terpadu (Search)](#adr-001-separation-of-pustaka-browse-vs-kamus-terpadu-search)
2. [ADR-002: Standalone Root Navigation for Exam Module](#adr-002-standalone-root-navigation-for-exam-module)
3. [ADR-003: Offline-First 3-Tier Sync Strategy](#adr-003-offline-first-3-tier-sync-strategy)

---

## ADR-001: Separation of Pustaka (Browse) vs Kamus Terpadu (Search)

- **Tanggal**: Juli 2026
- **Status**: Disetujui (Accepted)

### Konteks
Pustaka (`/library`) dan Kamus Terpadu (`/tools/dictionary`) keduanya menampilkan data dari entitas leksikal yang sama (kosakata, kanji, tata bahasa) dengan fitur pencarian dan penambahan ke SRS.

### Keputusan
Kedua rute dipertahankan untuk melayani dua model mental pengguna yang berbeda:
- **Pustaka (`/library`)**: Pola **BROWSE** (Eksplorasi berurutan per kategori → halaman detail → tambah SRS).
- **Kamus Terpadu (`/tools/dictionary`)**: Pola **SEARCH** (Pencarian cepat lintas kategori dalam satu input modal).

### Konsekuensi
Deskripsi kartu Kamus Terpadu di `src/lib/constants/tools.ts` diperjelas untuk menegaskan perbedaan rute Search vs Browse.

---

## ADR-002: Standalone Root Navigation for Exam Module

- **Tanggal**: Juli 2026
- **Status**: Disetujui (Accepted)

### Konteks
Terdapat duplikasi jalur navigasi simulasi ujian JLPT antara `/library` dan `/exams`.

### Keputusan
Modul Ujian (`/exams`) dijadikan navigasi root-level independen. Kartu rujukan ujian di `/library` dihapus untuk mencegah kebingungan navigasi.

### Konsekuensi
Rute `/exams` menjadi lokasi tunggal untuk seluruh simulasi CBT JLPT N5–N1.

---

## ADR-003: Offline-First 3-Tier Sync Strategy

- **Tanggal**: Juli 2026
- **Status**: Disetujui (Accepted)

### Konteks
Koneksi internet pembelajar sering tidak stabil, menyebabkan potensi kehilangan progres jika setiap aktivitas tergantung pada network request.

### Keputusan
Mengadopsi arsitektur 3-tier: **Zustand memory ➔ IndexedDB persistence ➔ RPC Server Sync** dengan debounce 2000ms dan server-calculated XP validation.

### Konsekuensi
Aplikasi berfungsi 100% offline tanpa latency, dan data disinkronkan secara background saat internet terhubung.
