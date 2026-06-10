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
- [ ] Phase 3: Backend generator and session flow. Core fixed-template slice is implemented.
- [x] Phase 4: Frontend integration for fixed-template Supabase exams.
- [ ] Phase 5: SRS and weak point integration. Core SRS insert slice is implemented.
- [ ] Phase 6: Data import pipeline. Import format and local validator are implemented.
- [ ] Phase 7: Testing and verification hardening.

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
- [ ] Hardening lanjutan: putuskan apakah `correct_choice_index` tetap boleh terlihat dari public Data API atau harus hanya server-side.

### Task 2.1: Enable RLS [DONE]

Enable RLS untuk semua tabel baru di `public`.

### Task 2.2: Public Read Policies [DONE]

Untuk bank soal:

- `jlpt_exam_templates`: public/authenticated read hanya `is_published = true`
- `jlpt_passages`: public/authenticated read hanya `is_published = true`
- `jlpt_questions`: public/authenticated read hanya `is_published = true`

Jika nanti ingin mencegah scraping jawaban benar, jangan expose `correct_choice_index` langsung ke client. Dalam mode itu, payload client harus dibuat server-side dan jawaban benar hanya dipakai saat submit.

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

## 6. Phase 3: Backend Generator & Session Flow [CORE SLICE DONE]

**Target:** membuat paket ujian dari bank soal dan menyimpan session secara server-side.

Status:

- [x] Helper package builder dan scoring server-side dibuat di `src/lib/exams/jlpt-session.ts`.
- [x] `getSupabaseExamTemplateBySlug` dibuat untuk membaca template fixed published.
- [x] `startJlptMockSession` dibuat untuk user login, template fixed, `payload_snapshot`, dan insert session.
- [x] `getExamSessionPackage` dibuat untuk resume/review session dari snapshot.
- [x] `submitJlptMockSession` dibuat untuk upsert answers, hitung skor server-side, dan complete session.
- [x] Unit test helper package/scoring ditambahkan di `__tests__/lib/jlpt-session.test.ts`.
- [ ] Random generator `random_by_quota` belum dibuat.
- [x] SRS update dari jawaban salah/kosong dieksekusi untuk item source-mapped; `srsCandidates` tetap disimpan di score snapshot untuk audit/review.
- [x] Frontend fixed-template sudah memakai action Phase 3 untuk start session dan submit server-side.

### Task 3.1: Start Session Server Action [FIXED TEMPLATE DONE]

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
4. Jika `generation_mode = random_by_quota`, generate berdasarkan `quota_config`. [TODO]
5. Join passage jika ada.
6. Resolve asset URL/path.
7. Buat `payload_snapshot`.
8. Insert `user_exam_sessions`.
9. Return payload adapter untuk `MockExamEngine`.

Implementasi saat ini:

- Fixed template mengambil soal dari `jlpt_exam_template_questions`.
- Soal disortir dengan `section_order` lalu `position`.
- Asset storage path di-resolve dari bucket `exam-assets`.
- `payload_snapshot` menyimpan package lengkap agar review tetap stabil.

### Task 3.2: Question Selection Rules [TODO]

Untuk random generator:

- filter `is_published = true`;
- filter by `jlpt_level`;
- group by `session_type` dan/atau `mondai_number`;
- gunakan random ordering server-side;
- pastikan question order stabil setelah session dibuat;
- jika kuota tidak terpenuhi, return error yang jelas untuk admin.

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
7. Trigger/update SRS untuk jawaban salah. [TODO]
8. Return result untuk UI.

Catatan implementasi:

- Submit yang sudah completed bersifat idempotent dan mengembalikan stored result.
- Invalid/out-of-range answer dinormalisasi menjadi kosong/null.
- `srsCandidates` disimpan di score snapshot sebagai persiapan Phase 5.

### Task 3.4: Do Not Trust Client Scoring [DONE]

Scoring di `useMockExamEngine` boleh tetap ada untuk feedback UI, tetapi hasil final yang tersimpan harus berasal dari server.

---

## 7. Phase 4: Frontend Integration [FIXED TEMPLATE DONE]

**Target:** memakai ulang UI existing sambil menambah kemampuan render data bank soal.

Status:

- [x] Daftar exam dan detail exam menggabungkan Sanity legacy + template Supabase published.
- [x] `/exams/[id]` tetap mencoba Sanity dulu, lalu fallback ke Supabase template.
- [x] `MockExamEngine` membuat session Supabase saat user klik mulai, bukan saat page render.
- [x] Submit exam Supabase memakai `submitJlptMockSession` dan result UI memakai skor server.
- [x] `ExamPlaying` mendukung passage HTML/visual dan choice text/image.
- [x] `ExamReview` mendukung passage, transcript listening, explanation, dan source metadata.
- [ ] Route eksplisit `/exams/session/[sessionId]` untuk resume session belum dibuat.
- [ ] Hardening agar `correct_choice_index` tidak pernah sampai ke client masih mengikuti open decision Phase 2.

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
- `ExamData` punya metadata sumber (`source`, `slug`, `templateId`, `templateSlug`, `sessionId`, `serverResult`).
- Adapter Supabase tetap mengisi `options`/`correctAnswer` untuk kompatibilitas, sambil meneruskan `choices`, `passage`, explanation, dan source metadata.

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
- Sanity legacy tetap memakai local scoring lama.
- Double submit dicegah dengan `isSubmittingSession`.

---

## 8. Phase 5: SRS & Weak Point Integration

**Target:** kesalahan mock test otomatis menjadi bahan latihan.

Status:

- [x] Helper mapping `source_type/source_id` ke `user_srs.word_id` dibuat di `src/lib/exams/jlpt-session.ts`.
- [x] Submit exam memasukkan kartu SRS baru dari jawaban salah/kosong melalui `submitJlptMockSession`.
- [x] Unit test mapping/dedupe SRS ditambahkan.
- [ ] Review UI belum menampilkan indikator apakah item sudah masuk SRS.
- [ ] Weak-point/review API untuk source non-vocab/non-kanji prefixed belum dibuat.

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

### Task 5.3: Review UI [PARTIAL]

Update `ExamReview` agar bisa menampilkan:

- [x] passage;
- [x] transcript listening;
- [x] explanation;
- [x] source metadata;
- [ ] source link ke vocab/grammar/reading/listening;
- [ ] status apakah item sudah masuk SRS.

---

## 9. Phase 6: Data Import Pipeline

**Target:** memasukkan bank soal dari file mentah secara konsisten dan bisa diaudit.

Status:

- [x] Intermediate JSON format dibuat dan didokumentasikan di `docs/jlpt-import-format.md`.
- [x] Contoh package import tersedia di `docs/jlpt-import-sample.json`.
- [x] Validator lokal dibuat di `src/lib/exams/import-pipeline.ts`.
- [x] CLI dry-run tersedia lewat `npm run exam:import:validate -- <file.json>`.
- [x] Unit test validator ditambahkan di `__tests__/lib/jlpt-import-pipeline.test.ts`.
- [ ] Uploader asset ke bucket `exam-assets` belum dibuat.
- [ ] Importer insert/update passages, questions, template, dan template positions ke Supabase belum dibuat.
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

### Task 6.3: Import Strategy [PLANNED]

Urutan aman:

1. upload asset ke `exam-assets`;
2. insert/update passages;
3. insert/update questions;
4. insert template;
5. insert template question positions;
6. set `is_published = true` setelah validasi lulus.

Catatan:

- Validator sudah menjadi gate pertama sebelum strategi import ini dijalankan.
- Importer database sebaiknya tetap dry-run by default sampai satu paket real sudah lolos validasi.

---

## 10. Phase 7: Testing & Verification

**Target:** migrasi aman secara behavior, bukan hanya schema berhasil dibuat.

### Unit Tests

Tambahkan test untuk:

- adapter Supabase payload ke `ExamData`;
- score calculation server-side;
- quota generator;
- SRS mapping;
- import package validation;
- review analysis dengan passage/choices baru.

### Integration Tests

Tambahkan test untuk:

- start session creates `user_exam_sessions`;
- submit session writes `user_exam_answers`;
- completed session stores `score_breakdown`;
- wrong answers generate SRS candidates.

### E2E Tests

Tambahkan Playwright flow:

- user membuka exam v2;
- mulai ujian;
- menjawab beberapa soal;
- submit;
- melihat result;
- membuka review.

### Supabase Verification

Setelah migration:

- run migration check;
- regenerate database types;
- run security/performance advisors;
- cek RLS manual dengan user authenticated.

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

### Milestone C: Session Persistence [FIXED TEMPLATE DONE]

- [x] Start/submit session aktif untuk template fixed.
- [x] Scoring final server-side.
- [x] Result memakai server result untuk exam v2.
- [ ] Resume session setelah refresh/browser close belum dibuat.

### Milestone D: Bank Soal Import

- [x] format intermediate dan validator import tersedia.
- [x] validasi quota tersedia untuk package `random_by_quota`.
- [ ] satu paket N4/N5 berhasil masuk dari pipeline import.
- [ ] review bisa menampilkan passage/transcript dari paket hasil import real.

### Milestone E: SRS Integration

- [x] jawaban salah/kosong masuk SRS untuk item source-mapped.
- [x] format `word_id` disepakati untuk fase awal: `vocab` memakai ID asli, source lain memakai prefix.
- [x] tidak merusak SRS existing karena kartu existing diabaikan saat conflict.
- [ ] review UI menampilkan status/link SRS.

### Milestone F: Gradual Migration

- exam baru dibuat di Supabase;
- Sanity `mockExam` tetap read-only/legacy;
- setelah stabil, putuskan apakah Sanity mock exam akan diarsipkan.

---

## 12. Open Decisions

Sebelum implementasi penuh, perlu keputusan:

1. Apakah template fixed akan memakai soal yang sama persis setiap paket, atau selalu random by quota?
2. Apakah `correct_choice_index` boleh dikirim ke client selama ujian, atau harus hanya tersedia server-side?
3. Apakah asset exam public, atau perlu signed URL?
4. Format final `word_id` untuk SRS: diputuskan untuk fase awal, `vocab` memakai existing id langsung; source lain memakai prefix seperti `grammar:<id>`, `reading:<id>`, `listening:<id>`, `kanji:<id>`, atau `custom:<id>`. [DECIDED FOR PHASE 5 CORE]
5. Apakah satu passage bisa dipakai lintas banyak soal dan lintas template?
6. Apakah session yang belum selesai bisa dilanjutkan setelah refresh/browser close?

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
