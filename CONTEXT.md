# NihongoRoute Domain Glossary & Context

Dokumen ini mendefinisikan istilah domain utama yang digunakan dalam sistem NihongoRoute.

## Lexical Domain (Domain Leksikal)
- **Lexical Content Engine**: Modul dalam (*deep module*) yang mengelola seluruh kueri pencarian, penyaringan, dan pengurutan entitas leksikal (Vocab, Kanji, Grammar, Expression, Sentence).
- **Lexical Type**: Jenis materi leksikal yang didukung: `vocab`, `kanji`, `grammar`, `expression`, `sentence`, `cheatsheet`.
- **queryLexicalDomain**: Antarmuka terpadu untuk mengambil data leksikal secara efisien dengan penyembunyian detail skema basis data di balik modul domain.

## Sync & Offline Mutation Domain (Domain Sinkronisasi & Mutasi Awan)
- **SyncPipelineEngine**: Modul dalam yang mengapsulasi penjadwalan *debounce* (2000ms), penyiaran multi-tab (`BroadcastChannel`), dan validasi *anti-cheat accepted_xp* dari Supabase RPC `sync_user_progress`.
- **dispatchSyncEvent**: Antarmuka terpadu (*seam*) untuk memicu eksekusi sinkronisasi progres belajar dari klien ke awan Supabase.

## Practice Tools Domain (Domain Alat Latihan Interaktif)
- **PracticeSessionEngine**: Modul dalam yang menyatukan penyusunan dek latihan (*deck assembly*), pemilihan opsi distraksi adaptif (*adaptive distractors*), dan kalkulasi akurasi serta skor sesi latihan.
- **assemblePracticeDeck**: Antarmuka penyusun dek materi latihan terstruktur dengan pengacakan otomatis.
- **generateAdaptiveDistractors**: Algoritma pemilih opsi jawaban pengacau tanpa duplikasi dengan jawaban benar.

## Lesson Hydration Domain (Domain Hidrasi Pelajaran)
- **LessonHydrationEngine**: Modul dalam yang mengapsulasi parsing Markdown ke blok konten, normalisasi field camelCase, dan hidrasi relasi paralel (vocab, kanji, grammar, listening, reading) tanpa ketergantungan I/O langsung.
- **hydrateLessonDetail**: Antarmuka terpadu (*seam*) untuk menghidrasi raw DB row menjadi `LibraryItem` siap render. Menerima `RawLessonRow` + `LessonRelationFetcher` (kontrak abstrak), mengembalikan `LibraryItem`.
- **LessonRelationFetcher**: Interface kontrak untuk mengambil data relasi dari sumber data eksternal. Implementasi konkret (Supabase-backed) hidup di `lesson.service.ts`.

## Learning Ecosystem Domain (Domain Ekosistem Pembelajaran)
- **EcosystemEngine**: Kumpulan modul di `src/lib/learning/ecosystem/` yang menyusun rekomendasi dasbor, insight weak points, dan rute belajar harian.
- **buildEcosystemRecommendations**: Antarmuka penyusun rekomendasi konten personal berdasarkan riwayat & SRS (`ecosystem/recommendations.ts`).
- **buildWeakPointInsights**: Antarmuka analisis kelemahan user per kategori beserta metadata kategori (`ecosystem/weak-points.ts`).
- **buildDailyRoute**: Antarmuka penyusun rute belajar harian; mengonsumsi rekomendasi & insight weak points (`ecosystem/daily-route.ts`).
- Modul dipecah per domain (`types`, `urls`, `recommendations`, `weak-points`, `daily-route`) dengan barrel re-export agar API publik identik.

## Listening Workspace Domain (Domain Workspace Menyimak)
- **ListeningWorkspace**: Orkestrator tipis (`src/features/library/listening/components/ListeningWorkspace.tsx`) yang menggabungkan tab selector, tiga panel belajar, dan media control bar.
- **WorkspacePanel**: Komponen panel terpisah di `components/workspace/` — `StudyPanel` (visualizer + transkrip), `DictationPanel` (latihan dikte), `QuizPanel` (kuis pemahaman), `MediaControlBar` (sticky bottom bar), dan `WorkspaceTabs` (selector tab).
- Semua panel tetap ter-*mount* dan disembunyikan via CSS `hidden` saat tab tidak aktif, sehingga state per-panel (progres dikte, jawaban kuis) bertahan saat pengguna berpindah tab.

## Furigana & Reading Mode Domain (Domain Tampilan Teks Jepang)
- **JapaneseText**: Komponen inti terpadu (`src/components/ui/japanese/JapaneseText.tsx`) untuk merender teks Jepang — mode `kanji` (full kanji murni, tanpa furigana), `furigana` (ruby `<ruby>/<rt>`), dan `hiragana` (teks diganti kana).
- **SmartJapanese / FuriganaDisplay**: Facade kompatibilitas yang mendelegasikan ke `JapaneseText`; **tidak** men-default `mode` agar selalu jatuh ke mode global dari store.
- **Global Mode (Satu Sumber Kebenaran)**: `useUIStore.readingState.mode` — toggle di Topbar & control bar reading menulis ke store, sehingga mode berlaku konsisten di seluruh halaman (vocab, kanji, grammar, cheatsheet, listening, games, review) dan preferensi ter-persist di IndexedDB.
- **splitFurigana**: Algoritma pemetaan kanji → furigana dengan skor heuristik + LRU cache (1000 entri) di `src/components/ui/japanese/splitFurigana.ts`.
- **Mode `romaji`**: Dihapus dari kontrol tampilan (bukan mode siklus) — romaji tetap tersedia sebagai data per kata (halaman vocab) dan per paragraf di data reading.

## Reading Session Domain (Domain Sesi Membaca)
- **ReadingPageClient**: Orkestrator tipis (`src/features/library/reading/ReadingPageClient.tsx`) yang menyimpan state bersama (progress, zen, vocab, font, mode) dan menyusun panel: `ReadingPageHeader`, `ReadingVisuals`, `ReadingControlBar`, `VocabularyDrawer`, `ReadingQuizSection` + util murni `utils/reading-metrics.ts`.
- **useReadingLogic**: Hook pengelola parsing teks multi-format (Plain/Rich Text), ekstraksi varian (body/hiragana/translation), dan sinkronisasi metadata artikel ke `useUIStore`.
- **ReadingContext**: Provider yang mengikat `mode` ke `useUIStore.readingState.mode` (satu sumber kebenaran), sedangkan `showTranslation` tetap lokal per halaman.

