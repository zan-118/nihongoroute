# Catatan Perubahan (CHANGELOG)

Semua perubahan penting pada proyek **NihongoRoute** dicatat dalam dokumen ini. Format penulisan mengikuti standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased]

### Ditambahkan
- Penataan ulang arsitektur dokumentasi multi-layer (Layer 1 Root, Layer 2 Technical Docs, Layer 3 Code Docs, Layer 4 Community Docs).
- Penamaan ulang file dokumentasi teknis ke format standar UPPERCASE (`ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, dll).
- Template Issue & Pull Request terstruktur di `.github/`.
- File `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, dan `LICENSE`.

### Ditingkatkan (Refactoring Kualitas Codebase)
- **Deduplikasi parser & helper**: Markdown parser yang diduplikasi di `GrammarDetailClient`/`SmartText` kini memakai shared parser `lib/core/`; helper `firstParam`/`buildContextLabel` yang tersebar di 5 halaman tools digabung ke `lib/core/utils.ts`.
- **Penghapusan hack circular-dependency** `window.useSRSStore` diganti lazy `import()`.
- **Logging terstandar**: `lib/core/logger.ts` diperluas jadi generic logger; 18 file server (`src/actions/*`, `lib/services/*`) dimigrasi dari `console.error` mentah.
- **Data-fetching via Server Actions**: server action baru `lookupDictionaryWordAction`; `DictionaryPopup` & `WordPopover` tidak lagi query Supabase langsung dari client.
- **Typecheck test diaktifkan**: `tsconfig.tests.json` + script `typecheck:tests` (memperbaiki 27 error tipe tersembunyi di `__tests__/`); step `Typecheck (tests)` ditambahkan ke CI workflow.
- **Pemecahan god files**:
  - `LeaderboardClient.tsx` (749 baris) → hook `useLeaderboard` + komponen UI murni.
  - `ExamResult.tsx` (785 baris) → komposisi tipis + `OfficialCertificateView` + `ModernBreakdownView` + modul logika murni `examResultData.ts` (+12 unit test).
  - `learning-ecosystem.ts` (851 baris) → folder `lib/learning/ecosystem/` (types, urls, recommendations, weak-points, daily-route) + barrel re-export API identik.
  - `ListeningWorkspace.tsx` (748 baris) → orkestrator tipis + folder `workspace/` (`WorkspaceTabs`, `StudyPanel`, `DictationPanel`, `QuizPanel`, `MediaControlBar`); panel tetap ter-mount agar state per-panel bertahan saat pindah tab.
- **Quality gates**: ESLint ignore `coverage/` → lint 100% bersih; `as unknown as` dikurangi 51 → 41 (sisa boundary legit Supabase `Json`/react-pdf/window).

### Test
- `__tests__/lib/exams/exam-result-data.test.ts` (12 test skor JLPT/JFT).
- `__tests__/actions/dictionary-lookup.test.ts` (7 test `lookupDictionaryWordAction`).
- `__tests__/features/library/listening-workspace.test.tsx` (6 test `WorkspaceTabs` & `QuizPanel`).
- `__tests__/features/library/listening-workspace-state.test.tsx` (1 test regresi state lintas tab).

---

## [1.0.0] - 2026-08-02

### Ditambahkan
- Arsitektur Offline-First 3-tier (Zustand store local + IndexedDB persistence + Supabase cloud sync).
- Modul pembelajaran Bahasa Jepang: SRS Flashcard Engine, Lesson System, Drill Tata Bahasa & Kanji.
- Sistem Ujian Simulasi JLPT (Moji-Goi, Bunpou, Dokkai, Choukai) dengan skoring otomatis.
- Pipeline TTS Edge & Caching Suara.
- Sistem Gamifikasi (XP, Streak, Level, Leaderboard).
- Proteksi Keamanan RLS Supabase & Anti-Cheat XP.
