# JLPT Dokkai Generator

Generator ini membuat draft bank soal membaca (reading comprehension) dari tabel `vocab` dan `grammar` Supabase untuk dijadikan konteks target dalam teks bacaan. Output-nya adalah intermediate JSON yang kompatibel dengan import pipeline.

Matrix mondai mengikuti kategori reading resmi JLPT: <https://www.jlpt.jp/e/guideline/testsections.html>.

## Command Dasar

Mempersiapkan draf soal Dokkai menggunakan LLM enhancement (Gemini/OpenAI):

```bash
npm run exam:generate:dokkai -- --level N5 --limit 10 --types official
```

Output default:

```text
data/imports/jlpt-n5-reading-draft.json
```

Draft yang dibuat selalu `isPublished: false`, sehingga alur amannya tetap:

1. generate JSON draft;
2. review isi soal, passage, dan pilihan jawaban;
3. validasi/plan import;
4. apply ke Supabase jika sudah siap;
5. publish setelah review manual.

## Mondai Coverage

Tipe official yang didukung:

- `short_passage`: Teks pendek (80-150 karakter Jepang). Cocok untuk memo, email singkat, atau instruksi sederhana. Menghasilkan 1 pertanyaan.
- `medium_passage`: Teks menengah (250-400 karakter Jepang). Berupa narasi, esai pendek, atau penjelasan topik kasual. Menghasilkan 2 pertanyaan yang berbagai satu passage.
- `long_passage`: Teks panjang (500-900 karakter Jepang). Esai opini, argumentasi, atau ekspositori formal. Menghasilkan 3-4 pertanyaan yang berbagi satu passage.
- `integrated_comprehension`: Dua buah teks pendek/menengah yang membahas topik yang sama dari sudut pandang berbeda. Menghasilkan 2 pertanyaan perbandingan (hanya N2/N1).
- `information_retrieval`: Selebaran informasi, brosur, pamflet iklan, jadwal, atau papan pengumuman. Teks berformat layout HTML visual (table, list, border box, padding) langsung di dalam `passage.contentHtml`. Menghasilkan 2 pertanyaan pencarian informasi spesifik.

Mondai number dipetakan otomatis berdasarkan level:
* N5/N4: `short_passage` -> Mondai 4, `medium_passage` -> Mondai 5, `information_retrieval` -> Mondai 6.
* N3: `short_passage` -> Mondai 4, `medium_passage` -> Mondai 5, `long_passage` -> Mondai 6, `information_retrieval` -> Mondai 7.
* N2: `short_passage` -> Mondai 7, `medium_passage` -> Mondai 8, `integrated_comprehension` -> Mondai 9, `long_passage` -> Mondai 10, `information_retrieval` -> Mondai 11.
* N1: `short_passage` -> Mondai 8, `medium_passage` -> Mondai 9, `integrated_comprehension` -> Mondai 10, `long_passage` -> Mondai 11, `information_retrieval` -> Mondai 13.

## Opsi

```bash
npm run exam:generate:dokkai -- \
  --level N3 \
  --limit 15 \
  --types official \
  --seed 20260612 \
  --limit-vocab 15 \
  --limit-grammar 10 \
  --output data/imports/jlpt-n3-reading-draft.json
```

Opsi penting:

- `--level`: `N5`, `N4`, `N3`, `N2`, atau `N1`.
- `--limit`: batas jumlah soal final.
- `--types`: `official`, `all`, atau daftar tipe seperti `short_passage,information_retrieval`.
- `--limit-vocab`: jumlah kosakata target dari database untuk memandu konteks bacaan LLM.
- `--limit-grammar`: jumlah pola tata bahasa target dari database untuk memandu konteks bacaan LLM.
- `--seed`: nilai acak untuk memilih kosakata/tata bahasa target secara deterministik.
- `--template-slug` dan `--title`: metadata template import.

## Environment LLM

Mode LLM mengikuti pola script enrich:

- OpenAI-compatible gateway: `AI_BASE_URL`, `AI_API_KEY`, opsional `AI_MODEL`.
- Gemini langsung: `GEMINI_API_KEY`, atau `GEMINI_API_KEYS` comma-separated, atau `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, dst.

Script tidak memasukkan API key hardcoded. Semua credential dibaca dari `.env.local` atau environment shell.

## Validasi Dan Import

Setelah generate:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-reading-draft.json --plan
```

Apply hanya jika sudah direview:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-reading-draft.json --apply --skip-assets
```

### Perilaku Penulisan Data & Duplikasi

1. **File Draft Lokal (Overwrite)**:
   Setiap kali skrip generator dijalankan dengan tujuan output yang sama, file JSON di `data/imports/` akan **ditimpa sepenuhnya (overwrite)** oleh data baru.
   
2. **Upsert Database & UUID Deterministik**:
   ID untuk template, passage, dan soal dihitung menggunakan metode UUID deterministik (`createDeterministicUuid`) berbasis `template.slug` dan `question.key`/`passage.key` (yang terikat ke slug).
   * **Jika slug dan key sama**: Perintah impor `--apply` akan melakukan **upsert** (`onConflict: "id"`). Data lama di Supabase akan **ditimpa/diperbarui (update)**. Hubungan soal di junction table `jlpt_exam_template_questions` juga akan di-reset (di-delete lalu di-insert ulang).
   
3. **Cara Membuat Paket Baru**:
   Jika ingin membuat paket ujian baru yang terpisah tanpa menimpa data yang sudah ada di database:
   * Gunakan opsi `--template-slug` yang unik (misal: `jlpt-n5-reading-paket-2`).
   * Gunakan opsi `--title` baru (misal: `--title "JLPT N5 Reading Paket 2"`) agar judul di antarmuka berbeda.
   * Gunakan opsi `--seed` baru agar menghasilkan variasi soal acak yang berbeda dari paket sebelumnya.

## Catatan Tambahan

- Soal memakai `sourceType` ('vocab'/'grammar') dan `sourceId` dari target kosakata/tata bahasa terkait yang disisipkan ke dalam bacaan, sehingga jika jawaban user salah, sistem secara otomatis dapat memetakannya sebagai weak point/SRS.
- Generator menduplikasi passage dengan key yang sama apabila pertanyaan-pertanyaan tersebut berbagi teks bacaan yang sama, memastikan data terorganisir rapi di database.
