# Catatan Perubahan (CHANGELOG)

Semua perubahan penting pada proyek **NihongoRoute** dicatat dalam dokumen ini. Format penulisan mengikuti standar [Keep a Changelog](https://keepachangelog.com/id/1.0.0/).

---

## [Unreleased]

### Ditambahkan
- Penataan ulang arsitektur dokumentasi multi-layer (Layer 1 Root, Layer 2 Technical Docs, Layer 3 Code Docs, Layer 4 Community Docs).
- Penamaan ulang file dokumentasi teknis ke format standar UPPERCASE (`ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, dll).
- Template Issue & Pull Request terstruktur di `.github/`.
- File `CHANGELOG.md`, `ROADMAP.md`, `CONTRIBUTING.md`, dan `LICENSE`.
- Dokumen `docs/IMPROVEMENT_PLAN.md` untuk rencana hardening P0/P1/P2, status eksekusi P0 lokal, dan sisa live Supabase RLS audit.
- Audit auth/ownership P0 di `docs/API_REFERENCE.md` untuk API routes dan Server Actions kritis.
- Script audit RLS lokal `supabase/audit-rls.sql` untuk status RLS dan jumlah policy aktif per tabel `public`.

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
- **Sentralisasi warna aksen**: warna hardcoded palet (amber/cyan/purple/emerald/rose/slate/orange) diganti palet token generik bernama warna — `accent-violet`, `accent-cyan`, `accent-emerald`, `accent-rose`, `accent-amber` (+`*-foreground`), `surface-well` (dark) di `globals.css` + `tailwind.config.js` (reusable lintas fitur, bukan terikat nama kategori); badge status memakai token `success`/`warning`/`muted`; gradien `dark:from-[…]`/`dark:to-[…]` inert & class `bg-linear-` rusak dihapus dari `VocabFilterPanel`/`VocabHero`.
- **Aksesibilitas kontras lintas mode**: aksen kini tema-adaptif (gelap + fg putih di mode terang, terang + fg 950 di mode gelap) — kontras teks aksen naik dari 1.9–3.8:1 jadi ≥ 4.5:1 di mode terang; `text-white` di atas aksen solid diganti `text-accent-*-foreground` (kontras putih-on-aksen dari 2.1–4.0:1 jadi ≥ 4.7:1); `--success` & `--warning` mode terang digelapkan sedikit agar lulus AA-normal (success 4.56:1); aksen inline-RGB halaman library home (`LibraryCategoryCard`, stats, `buildLibraryCategories`) dikonversi ke `hsl(var(--accent-*))` + token baru `--accent-blue` — kini adaptif per mode (kartu Kanji home ikut diseragamkan ke `accent-rose` sesuai KanjiGrid).
- **Audit aksen inline tools/srs/review + dashboard**: `backgroundColor: "var(--primary)"` (raw, tanpa wrapper `hsl()`) pada mark sudut Tombou di `ContinueLearning`, `DashboardHero`, `ReviewModeCard` adalah CSS invalid setelah substitusi (triplet mentah `215 80% 32%` bukan <color>) → mark tak pernah render — diperbaiki jadi `hsl(var(--x))`; shimmer rusak (`before: before: before: before:` kosong) di `ContinueLearning` & `WeakPointPanel` diberi `before:bg-white/30`; verifikasi `AnimatedKanji` `#a855f7` (warna kuas, sengaja dipertahankan — canvas tak bisa CSS var).
- **Perbaikan sistem glow inline di Courses**: `rgb(var(--primary))`/`rgba(var(--primary), 0.3)` pada `CategoryHero`, `GeneralCategoryCard`, `LessonCard`, `TrainingGround` adalah CSS invalid/berwarna salah (triplet HSL diinterpretasikan sebagai channel RGB → render mustard) — dikonversi ke `hsl(var(--x))` & `hsl(var(--x) / alpha)` (37 titik), sehingga glow kini render warna tema yang benar & adaptif di kedua mode; teks/hover di atasnya (`hsl(var(--background))`/`hsl(var(--foreground))`/`hsl(var(--primary-foreground))`) sudah berpasangan tema-adaptif dan lolos AA.
- **State interaktif & class rusak**: `text-white` di atas solid `bg-primary` diganti `text-primary-foreground` (StickerScene tombol Putar/Lanjut + tag pembicara aktif + chip label speaker per-token `success/secondary/primary/muted-foreground`-foreground, `VocabCard` group-hover, `VocabView` tombol Detail) — kontras di mode gelap naik dari 2.6:1 jadi ≥ 7:1; seluruh sisa class `bg-linear-` rusak (tanpa arah gradien = background hilang) dibersihkan: tombol "Tandai Selesai" `ReadingWorkspace`, teks gradien "MATERI" halaman library (sebelumnya `bg-clip-text text-transparent` = tak terlihat) kini `bg-linear-to-r from-primary to-accent-cyan`, avatar `UserNav` (sebelumnya tak berlatar) kini gradien `from-primary to-accent-violet`, corner marks privacy/terms (`bg-primary/50`/`bg-secondary/50`), divider `VocabHero` (sekaligus hapus shadow teal `rgba(0,122,124)` sisa era accentRgb), overlay avatar `ProfileSection` (`bg-primary/10`), card & divider `GrammarDetailClient` (`bg-card/60`, `bg-primary/20`), divider `ReadingQuizSection` (`bg-border`), shimmer `DashboardStats` (`before:bg-white/30`, hapus 3 class `before:` kosong).

### Perbaikan Bug
- **Permissions-Policy microphone diperbaiki**: header global kini memakai `microphone=(self)` agar fitur rekam suara tidak diblokir browser di production.
- **Proteksi burst `/api/tts`**: endpoint TTS publik kini dibatasi `30 request/menit/IP` untuk menahan penyalahgunaan biaya sintesis audio.
- **Toggle mode baca global kini berlaku di semua halaman**: `SmartJapanese` sebelumnya me-hardcode default `mode="furigana"` sehingga `JapaneseText` selalu menerima mode truthy dan tidak pernah jatuh ke `globalMode` dari `useUIStore` — toggle Kanji/Furigana/Hiragana di Topbar mati di 16 pemakaian SmartJapanese (vocab, kanji, grammar, cheatsheet, listening, games, review). Default `mode` dihapus agar mengikuti mode global (default tetap furigana, tanpa perubahan visual sampai user toggle).
- **Halaman reading tersinkron mode global**: `ReadingContext` sebelumnya hardcode `useState("furigana")` dan tak tersinkron store — kini `mode` diikat ke `useUIStore.readingState.mode` (satu sumber kebenaran); kontrol mode di halaman reading menulis balik ke store sehingga preferensi pengguna bertahan & berlaku lintas halaman.
- **Mode `romaji` dihapus dari kontrol tampilan global**: romaji bukan mode siklus (Topbar & control bar reading hanya kanji/furigana/hiragana) dan bukan toggle global — setiap kalimat/kata sudah punya romaji sendiri di datanya (mis. toggle romaji per kata yang sudah ada di halaman vocab). Toggle global `showRomaji` yang sempat ditambahkan dihapus kembali; mode `kanji` = full kanji murni tanpa furigana maupun romaji.
- **Pembersihan dead code FAB `FloatingActions`**: blok aksi `isReadingPage`/`isListeningPage` (Audio, Mode Cycle, Translation Toggle, Scroll ke Kuis) ternyata tak pernah dirender karena early `return null` di halaman reading/listening — dihapus beserta selector `readingState`/`listeningState`/`setReadingState`/`setListeningState` (yang terakhir tak pernah dipakai), array `modes`, impor `AudioController`/`ReadingMode`/`cn`/ikon tak terpakai, dan branch ikon `BookIcon`/`Headphone` di tombol utama (kini selalu `Add`). FAB tetap tampil di halaman lain dengan menu Feedback/Donasi, dan tetap sembunyi di halaman reading/listening (kontrolnya sudah ada di halaman itu sendiri).

### Test
- `__tests__/config/security-headers.test.ts` menjaga `Permissions-Policy` tetap mengizinkan microphone same-origin.
- `__tests__/api/tts.test.ts` memastikan burst request `/api/tts` ke IP sama mendapat `429` setelah limit.
- `__tests__/api/contract.test.ts` menutup regresi webhook Saweria tanpa signature dan Trakteer dengan token salah.
- `__tests__/actions/community-auth.test.ts` memastikan mutasi community unauthenticated ditolak sebelum akses database/admin client.
- `__tests__/security/supabase-admin-imports.test.ts` menjaga `createAdminClient()` tidak diimpor dari Client Component.
- `__tests__/security/supabase-migration-security.test.ts` menjaga RLS 28 tabel, `security_invoker = true` pada `leaderboard_profiles`, dan revoke default function execute.
- `__tests__/components/ui/FuriganaText.test.tsx` diperluas 1 → 6 test: mode kanji/hiragana, mengikuti mode global store, regresi toggle topbar (SmartJapanese tanpa mode), dan prop eksplisit menimpa global.
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
