# JLPT Mock Test Engine - Implementation Blueprint v2

## 1. Project Overview

Membangun **bank soal JLPT di Supabase/PostgreSQL** sebagai sumber data dinamis untuk mock test, tanpa langsung menghapus skema `mockExam` di Sanity. Sanity tetap menjadi jalur lama/fallback selama migrasi, sedangkan Supabase menjadi fondasi baru untuk:

- menyimpan ribuan soal terstruktur berdasarkan level JLPT, section, mondai, passage, audio, visual, dan pilihan jawaban;
- membuat paket mock test otomatis berdasarkan template/kuota;
- menyimpan sesi ujian, urutan soal, jawaban user, hasil skor, dan review;
- menghubungkan kesalahan ujian ke SRS/weak point;
- memakai ulang `MockExamEngine` yang sudah ada melalui adapter data.

### Implementation Status

- [x] Phase 0: Compatibility audit and adapter boundary.
- [x] Phase 1: Database and storage foundation.
- [x] Phase 2 foundation guardrails: RLS, public read policies, user-owned policies, and initial indexes.
- [x] Phase 3: Backend generator and session flow for fixed templates and `random_by_quota`.
- [x] Phase 4: Frontend integration, server submit, and explicit session resume route.
- [x] Phase 5: Core SRS insert plus review source links/status indicators.
- [ ] Phase 6: Data import pipeline tooling and Moji/Goi draft generator are implemented; real package import is still pending.
- [ ] Phase 7: Unit/local verification is in place; E2E, advisors, and manual RLS checks remain pending.

Deliberately still open:

- DB/API-level anti-scraping hardening for `correct_choice_index`; app payload is masked before completion, but published question rows still expose the column if queried directly through the public Data API.
- Importing and publishing at least one real JLPT package through the pipeline.
- Playwright E2E and manual Supabase security/performance advisor review. MCP advisors currently require OAuth and Supabase CLI is not installed in this environment.

Applied migrations:

- `20260610091707_jlpt_mock_exam_bank_v2.sql`
- `20260610092158_jlpt_mock_exam_bank_v2_advisor_fixes.sql`

### Kondisi Project Saat Ini

- Next.js App Router sudah digunakan.
- Mock exam frontend sudah ada di `src/components/features/exams/mock-engine`.
- Server action exam saat ini masih mengambil data dari Sanity melalui `src/actions/exams.actions.ts`.
- Sanity masih punya schema `mockExam` di `sanity/schemaTypes/mockExam.ts`.
- Supabase sudah punya tabel lama `public.exams` dengan kolom `questions jsonb`.
- SRS sudah ada di `public.user_srs` dan menggunakan `word_id text` sebagai kunci materi user.
- `src/types/database.ts` adalah tipe manual/domain lama yang masih dipakai beberapa modul; generated Supabase types disimpan terpisah di `src/types/supabase.generated.ts`.

### Prinsip Migrasi

- Jangan hapus Sanity dulu.
- Jangan rewrite frontend engine dari nol.
- Buat Supabase bank soal v2 berdampingan dengan flow lama.
- Tambahkan adapter agar payload Supabase bisa dirender oleh `MockExamEngine` existing.
- Pindahkan hal yang sensitif ke server: generate session, scoring final, answer persistence, dan SRS integration.

---

## 2. Target Architecture

### Data Source Layer

- **Sanity legacy:** tetap melayani exam lama sampai migrasi stabil.
- **Supabase v2:** menjadi bank soal dan session store baru.
- **Adapter:** mengubah Supabase v2 payload menjadi `ExamData` lama agar UI existing tetap berjalan.

### Backend Layer

- Server Actions untuk kebutuhan internal App Router.
- Optional RPC untuk query/generator yang murni database dan butuh atomic behavior.
- Route Handler hanya jika dibutuhkan oleh external webhook/tooling.

### Frontend Layer

- Reuse `MockExamEngine`.
- Refactor minimal pada `ExamQuestion` supaya mendukung:
  - passage;
  - choice text/image;
  - per-question metadata;
  - source mapping untuk review/SRS.
- State lokal di engine tetap boleh digunakan untuk UX cepat, tetapi hasil final harus dikirim dan dihitung di server.

---

## 3. Phase 0: Compatibility Audit [DONE]

**Target:** memastikan migrasi tidak memutus flow exam existing.

### Task 0.1: Audit Existing Exam Contract [DONE]

Catat contract yang dipakai engine saat ini:

- `ExamData.id`
- `ExamData.title`
- `ExamData.timeLimit`
- `ExamData.passingScore`
- `ExamData.categorySlug`
- `ExamData.levelCode`
- `ExamData.choukaiAudioUrl`
- `ExamData.questions[]`
- `ExamQuestion._key`
- `ExamQuestion.section`
- `ExamQuestion.questionText`
- `ExamQuestion.imageUrl`
- `ExamQuestion.audioUrl`
- `ExamQuestion.options`
- `ExamQuestion.correctAnswer`

### Task 0.2: Define Adapter Boundary [DONE]

Buat fungsi mapping:

```ts
toLegacyExamData(supabaseExamPackage): ExamData
```

Adapter ini menjadi jembatan agar schema Supabase v2 bisa masuk ke `MockExamEngine` tanpa rewrite besar.

### Task 0.3: Keep Legacy Sanity Flow [DONE]

Pertahankan:

- `/exams`
- `/exams/[id]`
- `getExamsList`
- `getExamByIdOrSlug`
- `sanity/schemaTypes/mockExam.ts`

Tambahkan logic baru secara berdampingan, misalnya:

- `getSupabaseExamTemplateBySlug`
- `startJlptMockSession`
- `getExamSessionPackage`
- `submitJlptMockSession`

---

## 4. Phase 1: Database & Storage Setup [DONE]

**Target:** membuat schema bank soal yang scalable dan tidak bergantung pada satu dokumen JSON besar.

Status:

- [x] Migration file dibuat.
- [x] Migration diterapkan ke Supabase project.
- [x] Bucket `exam-assets` dibuat.
- [x] Tabel bank soal dan session dibuat.
- [x] RLS dan index dasar ikut dibuat sebagai guardrail.

### Task 1.1: Storage Bucket [DONE]

Buat bucket Supabase Storage:

- name: `exam-assets`
- access: public read untuk published asset, atau signed URL jika nanti ingin private
- file size limit: 50MB
- MIME types:
  - `audio/mpeg`
  - `audio/mp3`
  - `audio/ogg`
  - `image/png`
  - `image/jpeg`
  - `image/webp`

Catatan:

- Jangan hardcode URL manual jika bisa menyimpan storage path.
- Simpan `audio_path` / `visual_path`, lalu resolve URL di server/adapter.
- Implementasi saat ini membuat bucket public tanpa broad `storage.objects` listing policy. Public object URL tetap bisa dipakai, tetapi daftar file bucket tidak dibuka lewat policy tambahan.

### Task 1.2: Exam Templates [DONE]

Tambahkan tabel template/paket ujian. Ini belum ada di blueprint lama, tapi penting agar bank soal bisa menghasilkan paket ujian yang punya metadata.

**`jlpt_exam_templates`**

- `id` uuid primary key
- `slug` text unique not null
- `title` text not null
- `description` text nullable
- `jlpt_level` text not null, check `N5`, `N4`, `N3`, `N2`, `N1`
- `time_limit_minutes` int not null
- `passing_score` int not null default 90
- `is_published` boolean not null default false
- `generation_mode` text not null default `fixed`, check `fixed`, `random_by_quota`
- `quota_config` jsonb not null default `{}`
- `category_id` uuid nullable references `course_categories(id)`
- `legacy_sanity_id` text nullable
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Contoh `quota_config`:

```json
{
  "vocabulary": { "total": 33 },
  "grammar": { "total": 26 },
  "reading": { "total": 10 },
  "listening": { "total": 28 }
}
```

### Task 1.3: Passages [DONE]

**`jlpt_passages`**

- `id` uuid primary key
- `jlpt_level` text not null
- `session_type` text not null, check `vocabulary`, `grammar`, `reading`, `listening`
- `mondai_number` int nullable
- `title` text nullable
- `content_html` text nullable, supports ruby/furigana
- `transcript_html` text nullable, terutama untuk listening review
- `audio_path` text nullable
- `visual_path` text nullable
- `source_label` text nullable
- `is_published` boolean not null default false
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

### Task 1.4: Questions [DONE]

**`jlpt_questions`**

- `id` uuid primary key
- `jlpt_level` text not null
- `session_type` text not null, check `vocabulary`, `grammar`, `reading`, `listening`
- `mondai_number` int not null
- `question_number` int nullable
- `passage_id` uuid nullable references `jlpt_passages(id)` on delete set null
- `prompt_html` text nullable
- `visual_path` text nullable
- `audio_path` text nullable
- `choices` jsonb not null
- `correct_choice_index` int not null
- `explanation_html` text nullable
- `difficulty` int nullable
- `source_type` text nullable, check `vocab`, `grammar`, `kanji`, `listening`, `reading`, `custom`
- `source_id` text nullable
- `source_reference` text nullable
- `is_published` boolean not null default false
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()

Format `choices`:

```json
[
  { "type": "text", "value": "..." },
  { "type": "image", "value": "exam-assets/path/to/image.webp", "alt": "..." }
]
```

Catatan:

- `source_type/source_id` lebih aman dari `source_reference` tunggal karena SRS saat ini memakai `word_id text`.
- `source_reference` tetap boleh disimpan untuk label/debug/import provenance.
- Tambahkan check JSONB bahwa `choices` adalah array dan minimal 2 item.

### Task 1.5: Fixed Template Items [DONE]

Untuk paket fixed/manual, gunakan join table agar template bisa menunjuk ke soal tertentu.

**`jlpt_exam_template_questions`**

- `template_id` uuid references `jlpt_exam_templates(id)` on delete cascade
- `question_id` uuid references `jlpt_questions(id)` on delete restrict
- `position` int not null
- `section_order` int not null default 0
- primary key `template_id, question_id`
- unique `template_id, position`

### Task 1.6: User Exam Sessions [DONE]

**`user_exam_sessions`**

- `id` uuid primary key
- `user_id` uuid not null references `auth.users(id)` on delete cascade
- `template_id` uuid nullable references `jlpt_exam_templates(id)` on delete set null
- `jlpt_level` text not null
- `status` text not null default `in_progress`, check `in_progress`, `completed`, `abandoned`
- `question_order` uuid[] not null
- `payload_snapshot` jsonb not null
- `answers_snapshot` jsonb not null default `{}`
- `score_breakdown` jsonb nullable
- `total_score` int nullable
- `started_at` timestamptz not null default now()
- `completed_at` timestamptz nullable
- `updated_at` timestamptz not null default now()

Alasan `payload_snapshot`:

- hasil review lama tetap konsisten walaupun bank soal berubah;
- scoring bisa diaudit;
- UI bisa dibuka ulang tanpa generate ulang soal.

### Task 1.7: User Exam Answers [DONE]

**`user_exam_answers`**

- `id` uuid primary key
- `session_id` uuid not null references `user_exam_sessions(id)` on delete cascade
- `question_id` uuid not null references `jlpt_questions(id)` on delete restrict
- `selected_choice_index` int nullable
- `is_correct` boolean not null default false
- `answered_at` timestamptz nullable
- unique `session_id, question_id`

---

## 5. Phase 2: Security, RLS, and Indexes [FOUNDATION DONE]

**Target:** memastikan bank soal bisa dibaca sesuai kebutuhan, tetapi data user tetap private.

Status:

- [x] RLS aktif untuk semua tabel baru.
- [x] Public read policies dibuat untuk published bank soal.
- [x] User-owned policies dibuat untuk session dan answer.
- [x] Initial indexes dibuat.
- [x] App payload hardening: template preview dan sesi `in_progress` memask `correctAnswer` di payload `MockExamEngine`; snapshot completed diambil ulang setelah submit untuk review.
- [ ] DB/API hardening lanjutan: `correct_choice_index` masih ada di published table read policy jika ada akses langsung ke Supabase Data API.

### Task 2.1: Enable RLS [DONE]

Enable RLS untuk semua tabel baru di `public`.

### Task 2.2: Public Read Policies [DONE]

Untuk bank soal:

- `jlpt_exam_templates`: public/authenticated read hanya `is_published = true`
- `jlpt_passages`: public/authenticated read hanya `is_published = true`
- `jlpt_questions`: public/authenticated read hanya `is_published = true`

App sekarang tidak mengirim jawaban benar ke client saat template preview atau sesi ujian masih berjalan. Jika nanti ingin mencegah scraping lewat Supabase Data API, jangan expose `correct_choice_index` dari tabel published secara langsung; gunakan RPC/view server-side atau private schema khusus jawaban.

### Task 2.3: User-Owned Policies [DONE]

Untuk data user:

- `user_exam_sessions`: user hanya bisa select/insert/update session miliknya.
- `user_exam_answers`: user hanya bisa select/insert/update answer untuk session miliknya.

### Task 2.4: Indexes [DONE]

Tambahkan index:

- `jlpt_questions(jlpt_level, session_type, mondai_number) where is_published = true`
- `jlpt_questions(passage_id)`
- `jlpt_exam_templates(slug) where is_published = true`
- `jlpt_exam_template_questions(template_id, position)`
- `user_exam_sessions(user_id, status, started_at desc)`
- `user_exam_answers(session_id)`

---

## 6. Phase 3: Backend Generator & Session Flow [DONE]

**Target:** membuat paket ujian dari bank soal dan menyimpan session secara server-side.

Status:

- [x] Helper package builder dan scoring server-side dibuat di `src/lib/exams/jlpt-session.ts`.
- [x] `getSupabaseExamTemplateBySlug` dibuat untuk membaca template published dan memask jawaban benar sebelum completion.
- [x] `startJlptMockSession` dibuat untuk user login, template fixed/random, `payload_snapshot`, dan insert session.
- [x] `getExamSessionPackage` dibuat untuk resume/review session dari snapshot.
- [x] `saveJlptMockSessionAnswers` dibuat untuk autosave jawaban sementara sesi `in_progress`.
- [x] `submitJlptMockSession` dibuat untuk upsert answers, hitung skor server-side, dan complete session.
- [x] Unit test helper package/scoring/quota generator ditambahkan di `__tests__/lib/jlpt-session.test.ts`.
- [x] Random generator `random_by_quota` dibuat untuk kuota per section.
- [x] SRS update dari jawaban salah/kosong dieksekusi untuk item source-mapped; `srsCandidates` tetap disimpan di score snapshot untuk audit/review.
- [x] Frontend fixed/random-template sudah memakai action Phase 3 untuk start session, autosave, dan submit server-side.

### Task 3.1: Start Session Server Action [DONE]

Buat server action:

```ts
startJlptMockSession(input: {
  templateSlug?: string;
  jlptLevel?: "N5" | "N4" | "N3" | "N2" | "N1";
}): Promise<{ sessionId: string; exam: ExamData }>
```

Flow:

1. Validasi user dari Supabase server client.
2. Ambil template published.
3. Jika `generation_mode = fixed`, ambil soal dari `jlpt_exam_template_questions`.
4. Jika `generation_mode = random_by_quota`, generate berdasarkan `quota_config`.
5. Join passage jika ada.
6. Resolve asset URL/path.
7. Buat `payload_snapshot`.
8. Insert `user_exam_sessions`.
9. Return payload adapter untuk `MockExamEngine`.

Implementasi saat ini:

- Fixed template mengambil soal dari `jlpt_exam_template_questions`.
- Random template mengambil kandidat published per section lalu memilih sesuai `quota_config`.
- Soal disortir dengan `section_order` lalu `position`.
- Asset storage path di-resolve dari bucket `exam-assets`.
- `payload_snapshot` menyimpan package lengkap agar review tetap stabil.
- Payload client untuk template/sesi berjalan memask `correctAnswer`; jawaban benar tetap ada di server snapshot untuk scoring dan completed review.

### Task 3.2: Question Selection Rules [CORE DONE]

Untuk random generator:

- [x] filter `is_published = true`;
- [x] filter by `jlpt_level`;
- [x] quota per `session_type`;
- [x] pilih soal secara acak di server action dan simpan urutan stabil di `payload_snapshot`/`question_order`;
- [x] jika kuota tidak terpenuhi, return error yang jelas untuk admin;
- [ ] quota per `mondai_number` dan random ordering database/RPC-level masih future optimization untuk bank soal sangat besar.

### Task 3.3: Submit Session Server Action [CORE DONE]

Buat server action:

```ts
submitJlptMockSession(input: {
  sessionId: string;
  answers: Record<string, number | null>;
}): Promise<ExamSubmitResult>
```

Flow:

1. Validasi session milik user.
2. Ambil `payload_snapshot` atau question ids.
3. Ambil correct answers dari `payload_snapshot` server-side.
4. Upsert `user_exam_answers`.
5. Hitung `score_breakdown` server-side.
6. Update `user_exam_sessions.status = completed`.
7. Trigger/update SRS untuk jawaban salah. [DONE]
8. Return result untuk UI.

Catatan implementasi:

- Submit yang sudah completed bersifat idempotent dan mengembalikan stored result.
- Invalid/out-of-range answer dinormalisasi menjadi kosong/null.
- `srsCandidates` disimpan di score snapshot untuk audit/review.

### Task 3.5: In-Progress Answer Persistence [DONE]

- `saveJlptMockSessionAnswers` menyimpan jawaban sementara ke `user_exam_sessions.answers_snapshot`.
- Jawaban sementara dinormalisasi agar hanya question id dari snapshot dan choice index valid yang disimpan.
- `answers_snapshot` dipakai lagi saat membuka `/exams/session/[sessionId]`.

### Task 3.4: Do Not Trust Client Scoring [DONE]

Scoring di `useMockExamEngine` boleh tetap ada untuk feedback UI, tetapi hasil final yang tersimpan harus berasal dari server.

---

## 7. Phase 4: Frontend Integration [DONE]

**Target:** memakai ulang UI existing sambil menambah kemampuan render data bank soal.

Status:

- [x] Daftar exam dan detail exam menggabungkan Sanity legacy + template Supabase published.
- [x] `/exams/[id]` tetap mencoba Sanity dulu, lalu fallback ke Supabase template.
- [x] `MockExamEngine` membuat session Supabase saat user klik mulai, bukan saat page render.
- [x] Setelah session dibuat, URL diganti ke `/exams/session/[sessionId]` agar refresh kembali ke sesi yang sama.
- [x] Submit exam Supabase memakai `submitJlptMockSession` dan result UI memakai skor server.
- [x] Jawaban sementara sesi `in_progress` dihydrate dari `answers_snapshot` dan diautosave saat berubah.
- [x] `ExamPlaying` mendukung passage HTML/visual dan choice text/image.
- [x] `ExamReview` mendukung passage, transcript listening, explanation, dan source metadata.
- [x] Route eksplisit `/exams/session/[sessionId]` untuk resume/review session dibuat.
- [x] Payload engine untuk template preview dan sesi berjalan memask jawaban benar; completed session mengambil ulang snapshot untuk review.
- [ ] Hardening DB/Data API untuk `correct_choice_index` masih mengikuti open decision Phase 2.

### Task 4.1: Add Supabase Exam Entry Route [DONE]

Opsi aman:

- tetap pakai `/exams/[id]`;
- jika slug ditemukan di Sanity, render legacy;
- jika tidak ditemukan, coba Supabase template;
- atau buat route eksplisit `/exams/session/[sessionId]` untuk sesi v2.

Implementasi saat ini:

- `getExamsList` dan `getCourseCategoryData` menambahkan template Supabase published ke daftar ujian.
- `getExamByIdOrSlug` mempertahankan prioritas Sanity dan fallback ke `getSupabaseExamTemplateBySlug`.
- Slug/id yang bentrok dimenangkan oleh Sanity agar legacy flow tidak berubah.
- `/exams/session/[sessionId]` membuka snapshot sesi milik user untuk melanjutkan atau meninjau completed session.
- Sesi baru melakukan `window.history.replaceState` ke URL session agar refresh/browser close tetap mengarah ke session snapshot.

### Task 4.2: Extend Exam Types [DONE]

Extend `ExamQuestion` tanpa merusak field lama:

```ts
type ExamChoice =
  | { type: "text"; value: string }
  | { type: "image"; value: string; alt?: string };
```

Tambahkan field opsional:

- `id`
- `passage`
- `choices`
- `sourceType`
- `sourceId`
- `explanationHtml`
- `transcriptHtml`

Tetap isi field lama `options` dan `correctAnswer` di adapter sampai semua komponen siap membaca `choices`.

Implementasi saat ini:

- `ExamChoice`, `ExamPassage`, dan `ExamServerResult` ditambahkan ke kontrak engine.
- `ExamData` punya metadata sumber (`source`, `slug`, `templateId`, `templateSlug`, `sessionId`, `serverResult`, `savedAnswers`, `remainingTimeSeconds`).
- Adapter Supabase tetap mengisi `options`/`correctAnswer` untuk kompatibilitas, sambil meneruskan `choices`, `passage`, explanation, dan source metadata.
- Server action memask `correctAnswer` menjadi nilai sentinel sebelum payload ujian berjalan sampai session completed.

### Task 4.3: Universal Question Rendering [DONE]

Refactor `ExamPlaying`/komponen child agar:

- jika ada passage, render layout passage + pertanyaan;
- jika choice type `image`, render dengan `next/image`;
- jika choice type `text`, render teks;
- gunakan sanitizer untuk HTML/ruby;
- tetap support `options: string[]` dari Sanity legacy.

Catatan implementasi:

- Passage HTML/visual dirender saat playing.
- Transcript listening sengaja hanya dirender di review agar tidak membocorkan konten saat ujian.
- Image choices memakai `next/image` dengan fallback teks dari `options`.

### Task 4.4: Choukai UX [DONE]

Jangan bergantung penuh pada `<audio autoPlay>`, karena browser bisa menolak autoplay tanpa gesture user.

Gunakan pola:

- user menekan tombol play untuk memulai audio;
- audio hanya bisa diputar sekali;
- jika `onEnded`, tandai audio played;
- untuk mode auto-advance, aktifkan hanya setelah audio benar-benar berhasil diputar.

`baked-in silence` tetap direkomendasikan untuk file listening.

Implementasi saat ini:

- Pola play manual existing dipertahankan.
- Audio tetap dikunci sekali putar melalui `audioStatus`.
- Tombol navigasi/submit diberi guard ketika proses submit berlangsung.

### Task 4.5: Submit Flow [DONE]

Saat user menekan finish:

1. tampilkan answer sheet existing;
2. kirim answers ke `submitJlptMockSession`;
3. gunakan result server untuk summary;
4. fallback ke local result hanya jika session v1/legacy.

Implementasi saat ini:

- Supabase exam tanpa `sessionId` memanggil `startJlptMockSession` saat tombol mulai diklik.
- Supabase exam dengan `sessionId` mengirim jawaban ke `submitJlptMockSession`.
- Sesi Supabase berjalan melakukan autosave `answers_snapshot`; route session menghydrate jawaban tersebut.
- Completed session mengambil ulang snapshot completed agar review punya jawaban benar dan server result.
- Sanity legacy tetap memakai local scoring lama.
- Double submit dicegah dengan `isSubmittingSession`.

---

## 8. Phase 5: SRS & Weak Point Integration [CORE DONE]

**Target:** kesalahan mock test otomatis menjadi bahan latihan.

Status:

- [x] Helper mapping `source_type/source_id` ke `user_srs.word_id` dibuat di `src/lib/exams/jlpt-session.ts`.
- [x] Submit exam memasukkan kartu SRS baru dari jawaban salah/kosong melalui `submitJlptMockSession`.
- [x] Unit test mapping/dedupe SRS ditambahkan.
- [x] Review UI menampilkan source link dan status SRS/weak point untuk item yang salah/kosong.
- [ ] Integrasi materi non-vocab prefixed ke detail/review API masih perlu diperdalam jika ingin pengalaman non-vocab setara vocab.

### Task 5.1: Source Mapping [CORE DONE]

Gunakan mapping:

- `source_type = vocab` + `source_id = vocab.id/string key`
- `source_type = grammar` + `source_id = grammar slug/id`
- `source_type = kanji` + `source_id = kanji id/literal`
- `source_type = custom` untuk soal yang belum punya materi library

Implementasi saat ini:

- `vocab` disimpan sebagai `word_id = source_id` agar kompatibel dengan SRS/review existing.
- `grammar`, `kanji`, `listening`, `reading`, dan `custom` disimpan dengan prefix, misalnya `grammar:te-form` atau `reading:reading-1`.
- Kandidat dengan source kosong/unsupported diabaikan.
- Duplikat kandidat dalam satu submit dideduplikasi berdasarkan `word_id`.

### Task 5.2: SRS Upsert Rule [CORE DONE]

Saat session completed:

- [x] ambil jawaban salah/kosong;
- [x] pilih soal yang punya `source_type/source_id`;
- [x] upsert ke `user_srs`;
- [x] set `next_review` menjadi besok atau sekarang + interval singkat;
- [x] jangan menimpa progress user secara agresif jika item sudah matang kecuali rule-nya jelas.

Catatan:

- Karena `user_srs` saat ini memakai `word_id`, adapter SRS memakai existing vocab key untuk `vocab` dan prefix untuk source lain.
- Insert memakai `upsert(..., { onConflict: "user_id,word_id", ignoreDuplicates: true })`, sehingga kartu yang sudah ada tidak di-reset.
- Kartu baru memakai default `interval = 1`, `repetition = 0`, `ease_factor = 2.5`, `status = learning`, dan `next_review = completed_at + 1 hari`.
- Hindari trigger database yang terlalu sulit diaudit di fase awal. Implementasi saat ini tetap di server action `submitJlptMockSession`; RPC/trigger bisa dipertimbangkan setelah behavior stabil.

### Task 5.3: Review UI [DONE]

Update `ExamReview` agar bisa menampilkan:

- [x] passage;
- [x] transcript listening;
- [x] explanation;
- [x] source metadata;
- [x] source link ke vocab/grammar/reading/listening/kanji;
- [x] status apakah item masuk SRS otomatis atau weak point.

Catatan:

- `vocab` yang salah/kosong ditandai “Masuk SRS otomatis”.
- Source lain yang punya mapping ditandai “Masuk weak point”.
- Link materi mengikuti route library yang sudah ada (`/library/vocab/[id]`, `/library/grammar/[slug]`, `/library/reading/[slug]`, `/library/listening/[slug]`, `/library/kanji/[id]`).

---

## 9. Phase 6: Data Import Pipeline

**Target:** memasukkan bank soal dari file mentah secara konsisten dan bisa diaudit.

Status:

- [x] Intermediate JSON format dibuat dan didokumentasikan di `docs/jlpt-import-format.md`.
- [x] Contoh package import tersedia di `docs/jlpt-import-sample.json`.
- [x] Validator lokal dibuat di `src/lib/exams/import-pipeline.ts`.
- [x] CLI dry-run/plan tersedia lewat `npm run exam:import:validate -- <file.json>`.
- [x] Unit test validator dan import planner ditambahkan di `__tests__/lib/jlpt-import-pipeline.test.ts`.
- [x] Uploader asset ke bucket `exam-assets` tersedia di CLI `--apply`.
- [x] Importer insert/update passages, questions, template, dan template positions ke Supabase tersedia di CLI `--apply`.
- [x] Generator draft Moji/Goi dari tabel `vocab` tersedia di `src/lib/exams/moji-goi-generator.ts`.
- [x] CLI generator Moji/Goi tersedia lewat `npm run exam:generate:moji-goi -- --level N5 --limit 100`.
- [x] Dokumentasi generator tersedia di `docs/jlpt-moji-goi-generator.md`.
- [x] Unit test generator Moji/Goi tersedia di `__tests__/lib/moji-goi-generator.test.ts`.
- [x] Generator Moji/Goi mendukung matrix mondai official per level serta LLM enhancement opt-in.
- [x] Generator draft Bunpou dari tabel `grammar` tersedia di `src/lib/exams/bunpou-generator.ts`.
- [x] CLI generator Bunpou tersedia lewat `npm run exam:generate:bunpou -- --level N5 --limit 100`.
- [x] Dokumentasi generator Bunpou tersedia di `docs/jlpt-bunpou-generator.md`.
- [x] Unit test generator Bunpou tersedia di `__tests__/lib/bunpou-generator.test.ts`.
- [x] Generator Bunpou mendukung semua mondai grammar official dengan `sentential_grammar_1` rule-based dan `sentential_grammar_2`/`text_grammar` via LLM enhancement opt-in.
- [ ] Belum ada satu paket soal real yang masuk lewat pipeline ini.

### Task 6.1: Import Format [DONE]

Buat format intermediate JSON sebelum insert SQL:

```json
{
  "template": {
    "slug": "jlpt-n4-paket-2",
    "title": "JLPT N4 Paket 2",
    "jlptLevel": "N4",
    "timeLimitMinutes": 125,
    "generationMode": "fixed"
  },
  "passages": [],
  "questions": [],
  "templateQuestions": [],
  "assets": []
}
```

Catatan implementasi:

- Format memakai key camelCase di level aplikasi, lalu nanti importer yang memetakan ke kolom snake_case Supabase.
- Asset path dinormalisasi relatif terhadap bucket `exam-assets`; prefix `exam-assets/` boleh ada di input.
- `correctChoiceIndex` memakai index 0-based agar sama dengan schema Supabase dan scoring server.

### Task 6.2: Validation Script [DONE]

Buat script validasi:

- [x] semua question punya level/section/mondai;
- [x] `choices` array minimal 2;
- [x] `correctChoiceIndex` valid;
- [x] passage references valid;
- [x] asset paths bisa dicek via manifest atau `--asset-root`;
- [x] jumlah soal sesuai quota template untuk `random_by_quota`.

Command:

```bash
npm run exam:import:validate -- docs/jlpt-import-sample.json
```

Opsi:

- `--require-declared-assets` untuk mewajibkan setiap asset reference ada di `assets`.
- `--asset-root <dir>` untuk mengecek keberadaan file asset lokal.
- `--json` untuk output report lengkap yang bisa dipakai CI/tooling.
- `--plan` untuk melihat row Supabase, asset, dan key map yang akan digunakan.
- `--apply` untuk upload asset dan upsert row ke Supabase memakai service role key.
- `--skip-assets` untuk apply database tanpa upload asset.

### Task 6.3: Import Strategy [CORE DONE]

Urutan aman:

1. [x] upload asset ke `exam-assets`;
2. [x] insert/update passages;
3. [x] insert/update questions;
4. [x] insert template;
5. [x] insert template question positions;
6. [ ] set `is_published = true` setelah validasi lulus dan review manual.

Catatan:

- Validator sudah menjadi gate pertama sebelum strategi import ini dijalankan.
- Importer database tetap dry-run/plan by default; perubahan Supabase hanya terjadi dengan `--apply`.
- ID template, passage, dan question dibuat deterministik dari `template.slug` + key agar re-run import menargetkan row yang sama.
- Template positions untuk fixed template di-reset dan diinsert ulang per template supaya perubahan urutan tidak meninggalkan row lama.
- Apply membutuhkan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.

### Task 6.4: Moji/Goi Draft Generator [DONE]

Generator vocabulary:

- [x] mengambil data dari tabel `vocab` Supabase;
- [x] membuat soal `kanji_reading` untuk kata berkanji;
- [x] membuat soal `orthography` dari `furigana` ke bentuk kata/kanji;
- [x] membuat soal `paraphrase` dari `meaning_id`;
- [x] mendukung tipe official LLM-only: `context`, `usage`, dan `word_formation`;
- [x] memilih distractor dari level JLPT yang sama, dengan prioritas `hinshi` yang sama untuk soal `paraphrase`;
- [x] menghasilkan intermediate JSON import dengan `sourceType: "vocab"`, `sourceId`, dan `isPublished: false`;
- [x] menjaga output deterministik lewat seed agar review/import bisa diulang;
- [x] mencegah duplikasi soal identik lewat signature prompt + jawaban benar.

Catatan coverage:

- `--types official` mengikuti matrix vocabulary JLPT per level.
- Rule-based mencakup `kanji_reading`, `orthography`, dan `paraphrase`.
- `--llm-enhance` dipakai untuk full coverage tipe yang butuh generasi kalimat/konteks: `context`, `usage`, dan N2 `word_formation`.
- Matrix saat ini: N5 = 4 mondai; N4/N3 = 5 mondai; N2 = 6 mondai; N1 = 4 mondai.

Command:

```bash
npm run exam:generate:moji-goi -- --level N5 --limit 100 --types official --llm-enhance
```

Output default ditulis ke `data/imports/jlpt-n5-moji-goi-draft.json`, lalu tetap divalidasi dengan:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-moji-goi-draft.json --plan
```

### Task 6.5: Bunpou Draft Generator [DONE]

Generator grammar:

- [x] mengambil data dari tabel `grammar` Supabase;
- [x] membuat soal `sentential_grammar_1` rule-based dari `title`, `meaning`, dan `formation`;
- [x] mendukung tipe official LLM-only: `sentential_grammar_2` dan `text_grammar`;
- [x] membuat `passages` dan relasi `passageKey` untuk `text_grammar`;
- [x] memilih distractor dari level JLPT yang sama;
- [x] menghasilkan intermediate JSON import dengan `sourceType: "grammar"`, `sourceId`, dan `isPublished: false`;
- [x] menjaga output deterministik lewat seed agar review/import bisa diulang;
- [x] mencegah duplikasi soal identik lewat signature prompt + passage + jawaban benar.

Catatan coverage:

- `--types official` mengikuti matrix grammar JLPT: `sentential_grammar_1`, `sentential_grammar_2`, dan `text_grammar`.
- Rule-based mencakup `sentential_grammar_1`.
- `--llm-enhance` dipakai untuk full coverage tipe yang butuh susun kalimat atau konteks bacaan: `sentential_grammar_2` dan `text_grammar`.
- Matrix grammar official saat ini sama untuk N5 sampai N1: 3 mondai.

Command:

```bash
npm run exam:generate:bunpou -- --level N5 --limit 100 --types official --llm-enhance
```

Output default ditulis ke `data/imports/jlpt-n5-bunpou-draft.json`, lalu tetap divalidasi dengan:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-bunpou-draft.json --plan
```

---

## 10. Phase 7: Testing & Verification

**Target:** migrasi aman secara behavior, bukan hanya schema berhasil dibuat.

Status:

- [x] Unit/local tests untuk adapter, scoring, quota generator, SRS mapping, import planner, dan review analysis.
- [x] `npm run lint` hijau.
- [x] `npm run typecheck` hijau.
- [x] `npm run exam:import:validate -- docs/jlpt-import-sample.json --plan` hijau.
- [x] `npm run db:migrations:check` hijau.
- [ ] Integration test terhadap Supabase project/live DB belum dibuat.
- [ ] Playwright E2E flow belum dibuat.
- [ ] Supabase advisors dan manual RLS check belum dijalankan; MCP membutuhkan OAuth dan Supabase CLI tidak tersedia di environment ini.

### Unit Tests

Tambahkan test untuk:

- [x] adapter Supabase payload ke `ExamData`;
- [x] score calculation server-side;
- [x] quota generator;
- [x] SRS mapping;
- [x] import package validation and import planner;
- [x] review analysis dengan passage/choices baru.

### Integration Tests

Tambahkan test untuk:

- [ ] start session creates `user_exam_sessions`;
- [ ] submit session writes `user_exam_answers`;
- [ ] completed session stores `score_breakdown`;
- [ ] wrong answers generate SRS candidates.

### E2E Tests

Tambahkan Playwright flow:

- [ ] user membuka exam v2;
- [ ] mulai ujian;
- [ ] menjawab beberapa soal;
- [ ] submit;
- [ ] melihat result;
- [ ] membuka review.

### Supabase Verification

Setelah migration:

- [x] run migration check;
- [x] regenerate database types;
- [ ] run security/performance advisors; pending OAuth MCP atau Supabase CLI yang terpasang/link ke project.
- [ ] cek RLS manual dengan user authenticated.

---

## 11. Rollout Plan

### Milestone A: Foundation

- [x] schema v2 dibuat;
- [x] RLS/indexes dibuat;
- [x] storage bucket siap;
- [x] types generated di `src/types/supabase.generated.ts`.

### Milestone B: Adapter [DONE]

- [x] Supabase template bisa dirender oleh `MockExamEngine`.
- [x] Legacy Sanity exam tetap berjalan.

### Milestone C: Session Persistence [DONE]

- [x] Start/submit session aktif untuk template fixed dan `random_by_quota`.
- [x] Scoring final server-side.
- [x] Result memakai server result untuk exam v2.
- [x] Resume session setelah refresh/browser close dibuat lewat `/exams/session/[sessionId]`, autosave `answers_snapshot`, URL session replace, dan `remainingTimeSeconds`.

### Milestone D: Bank Soal Import

- [x] format intermediate dan validator import tersedia.
- [x] validasi quota tersedia untuk package `random_by_quota`.
- [x] importer `--apply` tersedia untuk asset upload dan upsert row Supabase.
- [ ] satu paket N4/N5 berhasil masuk dari pipeline import.
- [ ] review bisa menampilkan passage/transcript dari paket hasil import real.

### Milestone E: SRS Integration

- [x] jawaban salah/kosong masuk SRS untuk item source-mapped.
- [x] format `word_id` disepakati untuk fase awal: `vocab` memakai ID asli, source lain memakai prefix.
- [x] tidak merusak SRS existing karena kartu existing diabaikan saat conflict.
- [x] review UI menampilkan status/link SRS/weak point.

### Milestone F: Gradual Migration

- exam baru dibuat di Supabase;
- Sanity `mockExam` tetap read-only/legacy;
- setelah stabil, putuskan apakah Sanity mock exam akan diarsipkan.

---

## 12. Open Decisions

Keputusan/status arsitektur saat ini:

1. Template fixed dan `random_by_quota` sama-sama didukung. [DECIDED/IMPLEMENTED]
2. `correct_choice_index` tidak dikirim sebagai jawaban benar di payload template preview atau sesi berjalan; payload dimask sampai session completed. DB/Data API-level anti-scraping masih perlu keputusan lanjutan. [APP-LEVEL DECIDED/IMPLEMENTED]
3. Apakah asset exam public, atau perlu signed URL? Bucket `exam-assets` saat ini public untuk fase awal; signed URL bisa dipilih jika paket real butuh proteksi asset.
4. Format final `word_id` untuk SRS: diputuskan untuk fase awal, `vocab` memakai existing id langsung; source lain memakai prefix seperti `grammar:<id>`, `reading:<id>`, `listening:<id>`, `kanji:<id>`, atau `custom:<id>`. [DECIDED FOR PHASE 5 CORE]
5. Satu passage bisa dipakai banyak soal lewat `passage_id`; lintas template tetap aman selama row passage tidak dihapus. [SUPPORTED]
6. Session yang belum selesai bisa dilanjutkan setelah refresh/browser close lewat `/exams/session/[sessionId]`, autosave answer snapshot, dan remaining time dari `started_at`. [DECIDED/IMPLEMENTED]

---

## 13. Recommended First Implementation Slice

Implementasi pertama yang paling aman:

1. Buat schema v2 + RLS + indexes.
2. Buat satu seed/template manual dengan 5-10 soal dummy.
3. Buat adapter Supabase -> `ExamData`.
4. Render exam v2 memakai `MockExamEngine` existing.
5. Submit answers ke server dan simpan session.
6. Baru expand ke import pipeline dan SRS.

Dengan slice ini, project mendapat jalur bank soal Supabase tanpa mematikan Sanity dan tanpa rewrite besar pada UI ujian.
