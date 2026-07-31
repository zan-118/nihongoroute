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

