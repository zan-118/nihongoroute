# Audit Kompatibilitas Ujian (Phase 0)

Dokumen ini mencatat standar kompatibilitas dan kontrak data adapter penyesuaian simulasi ujian JLPT di platform NihongoRoute, menjembatani bank soal relasional baru di Supabase dengan mesin ujian interaktif klien lama (`MockExamEngine`).

---

## 1. Tujuan Penyelarasan

Tujuan dari Fase 0 adalah mempersiapkan migrasi bank soal Supabase relasional tanpa merusak atau mengubah alur pengerjaan ujian berbasis Sanity CMS yang sudah stabil di sisi klien. 
Dokumen ini mendefinisikan kontrak kompatibilitas dan lapisan pembatas adapter (`toLegacyExamData`) yang menormalisasi payload data Supabase sebelum dikirimkan ke komponen UI `MockExamEngine`.

Berkas-berkas UI yang dipertahankan tetap stabil selama migrasi awal:
* `src/components/features/exams/mock-engine/*`
* `src/app/(main)/exams/[id]/page.tsx`
* `sanity/schemaTypes/mockExam.ts`

---

## 2. Aturan Pemetaan Kontrak Data (Adapter Mapping Rules)

Lapisan adapter diimplementasikan di `src/lib/exams/supabase-adapter.ts`. Fungsi utamanya adalah:
```ts
export function toLegacyExamData(examPackage: SupabaseExamPackage): ExamData;
```

Proses pemetaan properti antar-sumber diatur dengan ketentuan sebagai berikut:

* **Sesi & Identitas**:
  * `sessionId` (jika ada sesi aktif di database) atau `templateId` dipetakan ke `ExamData.id`.
  * `slug` dari templat ujian dipetakan ke `ExamData.templateSlug`.
* **Metadata Ujian**:
  * Properti `title` dan `description` disalin langsung.
  * Durasi ujian `timeLimitMinutes` dipetakan ke `ExamData.timeLimit`.
  * Target skor minimal kelulusan `passingScore` disalin langsung.
  * Tingkat kesulitan `jlptLevel` (misal: N5, N4) dikonversi ke huruf kecil dan dipetakan ke `ExamData.levelCode` (misal: "n5", "n4").
  * Path audio mendengarkan seksi choukai `choukaiAudioUrl` disalin langsung.
* **Struktur Pertanyaan (`ExamQuestion`)**:
  * Kunci pertanyaan `question.id` dipetakan ke identifier legacy `ExamQuestion._key`.
  * Tipe bagian `question.sessionType` dipetakan ke `ExamQuestion.section` (`vocabulary`, `grammar`, `reading`, `listening`).
  * Pertanyaan teks `promptHtml` dipetakan ke `ExamQuestion.questionText`.
  * Gambar pendukung `visualUrl` dipetakan ke `ExamQuestion.imageUrl`.
  * Berkas audio `audioUrl` dipetakan ke `ExamQuestion.audioUrl`.
  * Pilihan jawaban array JSONB `choices` dipetakan ke `ExamQuestion.options`:
    * Pilihan tipe teks (`type: "text"`) dikonversi ke string nilainya (`choice.value`).
    * Pilihan tipe gambar (`type: "image"`) dikonversi sementara ke label alternatif teks (`choice.alt || 'Pilihan gambar'`) sebagai fallback visual.
  * Indeks jawaban benar `correctChoiceIndex` dipetakan langsung ke `ExamQuestion.correctAnswer`.
  * Berkas transkrip membaca/mendengar dari `passage` dihidrasi ke properti `ExamQuestion.transcriptHtml`.
  * Referensi kosakata/tata bahasa (`sourceType` dan `sourceId`) disalin untuk mendukung pemetaan ke database kelemahan pengguna (SRS weak points).

---

## 3. Batasan Sistem Saat Ini (Current Limitations)

* **Antarmuka Pilihan Gambar**: Komponen UI saat ini belum mendukung rendering visual interaktif untuk pilihan jawaban berbasis gambar. Pilihan tipe gambar dikonversi menjadi label teks cadangan sampai antarmuka ditingkatkan di fase selanjutnya.
* **Panel Teks Bacaan (Passages)**: Teks bacaan panjang belum dipisahkan ke dalam panel bacaan khusus terpisah. Teks bacaan digabungkan langsung di dalam properti teks pertanyaan.
* **Perhitungan Skor Klien**: Evaluasi kelulusan dan perhitungan nilai akhir saat ini masih dihitung di sisi klien untuk menjaga kompatibilitas, sebelum nantinya dipindahkan sepenuhnya ke server.

---

## 4. Kriteria Penerimaan Uji Kompatibilitas (Acceptance Checklist)

1. Alur ujian dinamis berbasis Sanity CMS yang sudah berjalan di produksi tidak terganggu.
2. Paket soal ujian yang dimuat dari database Supabase relasional sukses melewati fungsi adapter tanpa memicu kesalahan fatal (runtime error).
3. Berkas pengujian unit untuk modul adapter lulus pengujian 100%.
4. Skema database bank soal memiliki kontrak stabil yang dapat diakses oleh komponen UI.
