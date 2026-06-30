# Simulasi Ujian JLPT (Mock Exam)

Dokumen ini menjelaskan arsitektur simulasi ujian JLPT (Mock Exam) di platform NihongoRoute, struktur bank soal relasional di Supabase, skema berkas impor JSON, skrip utilitas generator, serta mesin ujian interaktif di sisi klien.

---

## 1. Arsitektur Simulasi Ujian & Mesin Klien (`MockExamEngine`)

Sistem simulasi ujian JLPT dirancang agar dapat memuat paket soal ujian terstruktur dari database Supabase dan memprosesnya secara interaktif menggunakan komponen klien **`MockExamEngine`**.

### 1.1 Sesi Klien & Alur Ujian (`useMockExamEngine.ts`)
* **Pengaktifan Sesi**: Sesi ujian dimulai dengan memanggil server action `startJlptMockSession` yang membuat ID sesi unik di database tabel `user_exam_sessions` dan mengalihkan URL peramban ke `/exams/session/[id]`.
* **Navigasi Ujian**: Pertanyaan dikelompokkan berdasarkan seksi ujian (`vocabulary`, `grammar`, `reading`, `listening`). Untuk seksi menyimak (listening), tombol kembali ke soal sebelumnya dinonaktifkan secara otomatis (`disablePreviousButton = true`) untuk mensimulasikan kondisi ujian riil.
* **Auto-Save Jawaban**: Jawaban yang dipilih pengguna disimpan ke dalam state memori lokal dan disinkronkan ke database tabel `user_exam_answers` secara berkala menggunakan timer debounce selama **1200 ms** untuk menghindari kehilangan kemajuan jika peramban terputus.
* **Cheat Warnings (Proteksi Kecurangan)**:
  * Hook mendengarkan event `visibilitychange` pada dokumen.
  * Jika pengguna meninggalkan tab ujian (membuka tab baru untuk mencari jawaban), sistem meningkatkan counter `cheatWarnings`.
  * Dasbor menampilkan peringatan visual ke pengguna agar fokus menyelesaikan ujian.

### 1.2 Aturan Skor Kelulusan Bagian (Section Breakdown Score)
Setelah ujian disubmit atau waktu habis, fungsi `performScoreCalculation` menghitung skor akhir pengguna:
1. Skor dihitung proporsional dari jawaban benar ke dalam skala maksimal nilai JLPT resmi yaitu **`180`**.
2. **Batas Kelulusan Seksi (Section Accuracy Guard)**:
   * Sesuai standar kelulusan JLPT, pengguna harus lulus batas nilai minimum per bagian, bukan hanya akumulasi skor total.
   * Mesin menerapkan ambang batas akurasi minimal **`32%`** untuk setiap bagian (`vocabulary`, `grammar`, `reading`, `listening`).
   * Jika akurasi salah satu bagian di bawah 32%, status kelulusan peserta otomatis dinyatakan **Gagal (`failedSection = true`, `isPassed = false`)** meskipun akumulasi skor total melampaui batas lulus (`passingScore`).
3. **Pemberian XP**: Jika ujian berhasil disubmit, pengguna mendapatkan tambahan XP: **10 XP per jawaban benar** ditambah bonus **50 XP jika lulus simulasi**.

---

## 2. Struktur Bank Soal & Adapter Data

### 2.1 Adapter Supabase (`supabase-adapter.ts`)
Untuk menjaga kompatibilitas antarmuka `MockExamEngine` lama yang awalnya dirancang untuk dokumen Sanity CMS, dibangun modul adapter `supabase-adapter.ts` yang memetakan objek data Supabase `SupabaseExamPackage` ke bentuk struktur `ExamData`:
* `sessionId || templateId` dipetakan ke `ExamData.id`.
* Pilihan jawaban tipe JSONB array `choices` dikonversi menjadi array teks polos (`choices.map(choice => choice.type === 'text' ? choice.value : choice.alt)`).
* `question.sessionType` dipetakan ke seksi `section`.
* Aset gambar dan audio yang disimpan dalam bentuk path relatif di storage diselesaikan menjadi URL penuh menggunakan domain publik bucket `exam-assets`.

---

## 3. Format Impor JSON & Skrip Validasi/Import

Data soal ujian dikelola sebagai dokumen JSON terstruktur sebelum diimpor ke database Supabase.

### 3.1 Skema Struktur JSON Impor (`docs/id/jlpt-import-format`)
Format dokumen JSON wajib mengikuti susunan berikut:
```json
{
  "template": {
    "slug": "jlpt-n5-paket-1",
    "title": "Simulasi JLPT N5 Paket 1",
    "jlptLevel": "N5",
    "timeLimitMinutes": 105,
    "passingScore": 80,
    "isPublished": false
  },
  "assets": [
    {"path": "listening/soal1.mp3", "mimeType": "audio/mpeg"}
  ],
  "passages": [
    {"key": "passage-n5-r1", "contentHtml": "<p>Teks bacaan...</p>"}
  ],
  "questions": [
    {
      "key": "q-n5-1",
      "sessionType": "vocabulary",
      "mondaiNumber": 1,
      "questionNumber": 1,
      "promptHtml": "Teks pertanyaan...",
      "choices": [
        {"type": "text", "value": " pilihan 1"},
        {"type": "text", "value": " pilihan 2"}
      ],
      "correctChoiceIndex": 0,
      "sourceType": "vocab",
      "sourceId": "uuid-kosakata-supabase"
    }
  ],
  "templateQuestions": [
    {"questionKey": "q-n5-1", "position": 1, "sectionOrder": 1}
  ]
}
```

### 3.2 Skrip Validator & Importer (`scripts/validate-jlpt-import.mjs`)
Pengembang mengelola proses verifikasi dan impor menggunakan CLI skrip:
* **Dry Run / Rencana Impor**:
  ```bash
  npm run exam:import:validate -- data/imports/n5-paket-1.json --plan
  ```
  Menampilkan ringkasan jumlah templat, soal, bacaan, dan aset biner yang akan di-upsert tanpa menulis ke database.
* **Eksekusi Impor (Apply)**:
  ```bash
  npm run exam:import:validate -- data/imports/n5-paket-1.json --asset-root data/imports/assets --apply
  ```
  Skrip mengunggah file biner di `--asset-root` ke bucket storage `exam-assets` Supabase, lalu melakukan penyimpanan relasional ke tabel database menggunakan UUID deterministik berbasis string slug.

---

## 4. Skrip Generator Bank Soal Otomatis

Untuk mempercepat penyusunan draf simulasi ujian, dikembangkan skrip generator berbasis kata kunci target dari kamus Supabase:

### 4.1 Generator Karakter Kosakata (`scripts/generate-jlpt-moji-goi.mjs`)
* Memilih kosakata tingkat JLPT target yang berstatus `is_common = true`.
* Membuat tipe soal official: `kanji_reading` (membaca kanji), `orthography` (menulis kata), dan menggunakan integrasi model LLM (Gemini API) dengan bendera `--llm-enhance` untuk merancang soal kalimat rumpang (`context`) dan penggunaan natural kata (`usage`).

### 4.2 Generator Tata Bahasa (`scripts/generate-jlpt-bunpou.mjs`)
* Membaca pola tata bahasa di database untuk membuat draf soal pilihan ganda struktur kalimat (`sentential_grammar_1`) dan menyusun kalimat rumpang acak (`sentential_grammar_2`).

### 4.3 Generator Membaca (`scripts/generate-jlpt-dokkai.mjs`)
* Menginstruksikan Gemini LLM untuk menyusun bacaan pendek (`short_passage`), menengah (`medium_passage`), dan pamflet visual (`information_retrieval`) dalam format HTML dengan menyelipkan kosakata/tata bahasa target.

### 4.4 Generator Menyimak (`scripts/generate-jlpt-choukai.mjs`)
* Merancang transkrip dialog lisan berbasis LLM, memilah gender suara pembicara, mensintesis file suara MP3 potongan dialog menggunakan mesin VOICEVOX lokal (atau MsEdgeTTS cloud fallback), dan menggabungkannya menjadi file audio tunggal menggunakan **FFmpeg**.
