# Peta Jalan Pengembangan (ROADMAP)

Dokumen ini memuat arah pengembangan produk **NihongoRoute** jangka pendek, menengah, dan panjang.

---

## 🎯 Target Utama

Menjadi platform pembelajaran Bahasa Jepang mandiri terlengkap di Indonesia yang mendukung akses luring penuh (offline-first), berkinerja tinggi, dan gratis untuk pembelajar tingkat JLPT N5 hingga N1.

---

## 🚀 Fase 1: Fondasi & Kualitas Inti (Sudah Berjalan & Aktif)

- [x] Arsitektur Offline-First 3-Tier (IndexedDB + Zustand + Cloud Sync).
- [x] Sistem Pembelajaran Inti: SRS Flashcards, Latihan Kanji, Tata Bahasa, & Mini Drill.
- [x] Modul Simulasi Ujian JLPT N5–N1 dengan generator soal otomatis.
- [x] Integrasi TTS Edge, Audio Caching, & Shadowing Recorder (`src/features/tools/shadowing-recorder/`).
- [x] Modul Sosial & Komunitas Pembelajar (`src/features/social/`, postingan, komentar, notifikasi).
- [x] Sistem Donasi & Webhooks (`Saweria` & `Trakteer`).
- [x] Dokumentasi Teknis Terstruktur 4-Layer.
- [x] Mode tampilan baca global (Kanji/Furigana/Hiragana) — satu sumber kebenaran di `useUIStore`, konsisten lintas halaman.
- [x] Design tokens warna tema-adaptif (`accent-*` + `*-foreground`) dengan kontras ≥ 4.5:1 di mode terang & gelap.
- [x] Pemecahan god files utama (ReadingPageClient 617, ExamReview 713, ListeningWorkspace 748, ExamResult 785, LeaderboardClient 749, learning-ecosystem 851) — seluruhnya di bawah ~430 baris.
- [x] Quality gates lengkap: typecheck `src/` & `__tests__/`, lint 100% bersih, **441 unit test**, Playwright E2E.

---

## ⚡ Fase 2: Pengayaan Fitur Lanjutan (Q4 2026)

- [ ] Pengenalan Pengucapan A.I (AI Speech Recognition Accuracy Scoring).
- [ ] Penambahan Aset Ilustrasi & Mnemonic Visual Kanji Interaktif.
- [ ] Dukungan Export / Import Kartu Flashcard Anki (.apkg).
- [ ] Pengayaan Fitur Gamifikasi (Badges Pembelajaran Tambahan, Tantangan Mingguan).

---

## 🔮 Fase 3: Skalabilitas & Cross-Platform (Q1 2027+)

- [ ] Aplikasi Mobile Native Cross-Platform (PWA / React Native / Tauri).
- [ ] Penilaian Esai & Dokkai Otomatis berbasis AI / LLM.
- [ ] Fitur Sync Multi-Device Realtime via WebSocket / WebRTC.
- [ ] Dasbor Analitik Pembelajaran Mendalam bagi Pengajar / Sekolah.

---

> [!NOTE]
> Peta jalan ini disinkronkan secara berkala dengan fitur aktif di `src/features/`.
