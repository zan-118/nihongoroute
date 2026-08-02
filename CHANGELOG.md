# Catatan Perubahan (CHANGELOG)

Semua perubahan penting pada proyek **NihongoRoute** dicatat dalam dokumen ini. Format penulisan mengikuti standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased]

### Ditambahkan
- Penataan ulang arsitektur dokumentasi multi-layer (Layer 1 Root, Layer 2 Technical Docs, Layer 3 Code Docs, Layer 4 Community Docs).
- Penamaan ulang file dokumentasi teknis ke format standar UPPERCASE (`ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, dll).
- Template Issue & Pull Request terstruktur di `.github/`.
- File `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, dan `LICENSE`.

---

## [1.0.0] - 2026-08-02

### Ditambahkan
- Arsitektur Offline-First 3-tier (Zustand store local + IndexedDB persistence + Supabase cloud sync).
- Modul pembelajaran Bahasa Jepang: SRS Flashcard Engine, Lesson System, Drill Tata Bahasa & Kanji.
- Sistem Ujian Simulasi JLPT (Moji-Goi, Bunpou, Dokkai, Choukai) dengan skoring otomatis.
- Pipeline TTS Edge & Caching Suara.
- Sistem Gamifikasi (XP, Streak, Level, Leaderboard).
- Proteksi Keamanan RLS Supabase & Anti-Cheat XP.
