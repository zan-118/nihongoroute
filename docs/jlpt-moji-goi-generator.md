# JLPT Moji/Goi Generator

Generator ini membuat draft bank soal vocabulary dari tabel `vocab` Supabase. Output-nya adalah intermediate JSON yang kompatibel dengan import pipeline, bukan insert langsung ke database exam.

Matrix mondai mengikuti kategori vocabulary resmi JLPT: <https://www.jlpt.jp/e/guideline/testsections.html>.

## Command Dasar

Rule-based saja:

```bash
npm run exam:generate:moji-goi -- --level N5 --limit 100 --types rule
```

Full official coverage dengan LLM enhancement:

```bash
npm run exam:generate:moji-goi -- --level N5 --limit 100 --types official --llm-enhance
```

Output default:

```text
data/imports/jlpt-n5-moji-goi-draft.json
```

Draft yang dibuat selalu `isPublished: false`, sehingga alur amannya tetap:

1. generate JSON draft;
2. review isi soal dan pilihan jawaban;
3. validasi/plan import;
4. apply ke Supabase jika sudah siap;
5. publish setelah review manual.

## Mondai Coverage

Tipe official yang didukung:

- `kanji_reading`: rule-based dari `word` + `furigana`.
- `orthography`: rule-based dari `furigana` ke bentuk kanji/kata.
- `word_formation`: LLM-only, khusus N2.
- `context`: LLM-only untuk kalimat rumpang.
- `paraphrase`: rule-based dari `meaning_id`, bisa nanti ditingkatkan LLM untuk parafrasa Jepang.
- `usage`: LLM-only untuk memilih kalimat penggunaan kata yang paling natural.

Matrix per level:

| Level | Mondai |
| --- | --- |
| N5 | `1 kanji_reading`, `2 orthography`, `3 context`, `4 paraphrase` |
| N4 | `1 kanji_reading`, `2 orthography`, `3 context`, `4 paraphrase`, `5 usage` |
| N3 | `1 kanji_reading`, `2 orthography`, `3 context`, `4 paraphrase`, `5 usage` |
| N2 | `1 kanji_reading`, `2 orthography`, `3 word_formation`, `4 context`, `5 paraphrase`, `6 usage` |
| N1 | `1 kanji_reading`, `2 context`, `3 paraphrase`, `4 usage` |

Tanpa `--llm-enhance`, tipe LLM-only akan diskip dan dicatat di output `Skipped`.

## Opsi

```bash
npm run exam:generate:moji-goi -- \
  --level N3 \
  --limit 120 \
  --types official \
  --llm-enhance \
  --llm-batch-size 6 \
  --seed 20260611 \
  --output data/imports/jlpt-n3-moji-goi-draft.json
```

Opsi penting:

- `--level`: `N5`, `N4`, `N3`, `N2`, atau `N1`.
- `--limit`: batas jumlah soal final.
- `--types`: `official`, `rule`, `llm`, atau daftar tipe seperti `kanji_reading,orthography,context`.
- `--llm-enhance`: aktifkan generation LLM untuk `context`, `usage`, dan `word_formation`.
- `--llm-limit`: batas jumlah soal yang diminta dari LLM. Default dihitung dari quota tipe LLM dalam `--limit`.
- `--llm-batch-size`: jumlah vocab target per request LLM.
- `--allow-partial-llm`: tetap tulis output rule-based jika LLM gagal/parsial. Tanpa flag ini, `--llm-enhance` akan gagal jika tipe LLM yang diminta tidak terisi.
- `--pool-limit`: jumlah row vocab yang diambil untuk pool distractor.
- `--offset` dan `--candidate-limit`: membatasi vocab target, tetapi pool distractor tetap lebih luas.
- `--common-only`: hanya memakai vocab dengan `is_common = true`.
- `--template-slug` dan `--title`: metadata template import.

## Environment LLM

Mode LLM mengikuti pola script enrich:

- OpenAI-compatible gateway: `AI_BASE_URL`, `AI_API_KEY`, opsional `AI_MODEL`.
- Gemini langsung: `GEMINI_API_KEY`, atau `GEMINI_API_KEYS` comma-separated, atau `GEMINI_API_KEY_1`, `GEMINI_API_KEY_2`, dst.

Script tidak memasukkan API key hardcoded. Semua credential dibaca dari `.env.local` atau environment shell.

## Validasi Dan Import

Setelah generate:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-moji-goi-draft.json --plan
```

Apply hanya jika sudah direview:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-moji-goi-draft.json --apply --skip-assets
```

### Perilaku Penulisan Data & Duplikasi

1. **File Draft Lokal (Overwrite)**:
   Setiap kali skrip generator dijalankan dengan tujuan output yang sama, file JSON di `data/imports/` akan **ditimpa sepenuhnya (overwrite)** oleh data baru, bukan ditambahkan di bawahnya (append).
   
2. **Upsert Database & UUID Deterministik**:
   ID untuk template, passage, dan soal dihitung menggunakan metode UUID deterministik (`createDeterministicUuid`) berbasis `template.slug` dan `question.key` (yang terikat ke slug).
   * **Jika slug dan key sama**: Perintah impor `--apply` akan melakukan **upsert** (`onConflict: "id"`). Data lama di Supabase akan **ditimpa/diperbarui (update)**. Hubungan soal di junction table `jlpt_exam_template_questions` juga akan di-reset (di-delete lalu di-insert ulang).
   * **Jika slug berbeda**: Akan dianggap sebagai paket ujian baru dan dibuatkan baris data baru.

3. **Cara Membuat Paket Baru**:
   Jika ingin membuat paket ujian baru yang terpisah tanpa menimpa data yang sudah ada di database:
   * Gunakan opsi `--template-slug` yang unik (misal: `jlpt-n5-moji-goi-paket-2`).
   * Gunakan opsi `--title` baru (misal: `--title "JLPT N5 Moji/Goi Paket 2"`) agar judul di antarmuka berbeda.
   * Gunakan opsi `--seed` baru agar menghasilkan variasi soal acak yang berbeda dari paket sebelumnya.

## Catatan Tambahan

- Soal memakai `sourceType: "vocab"` dan `sourceId` dari `vocab.id`, sehingga bisa masuk jalur weak point/SRS setelah import.
- Generator menolak signature soal yang sama, sehingga row berbeda dengan prompt dan jawaban benar identik tidak ikut menjadi duplikasi soal.
- LLM output tetap masuk validator lokal; hasilnya masih perlu review manual sebelum publish.

