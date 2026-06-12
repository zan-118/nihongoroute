# JLPT Choukai Generator

Generator ini membuat draf bank soal menyimak (listening comprehension) dari tabel `vocab` dan `grammar` Supabase untuk dijadikan konteks target dalam percakapan dialog. Output-nya adalah intermediate JSON yang kompatibel dengan import pipeline beserta audio statis berformat MP3 yang disintesis otomatis.

Matrix mondai mengikuti kategori listening resmi JLPT: <https://www.jlpt.jp/e/guideline/testsections.html>.

## Command Dasar

Mempersiapkan draf soal Choukai menggunakan LLM enhancement (Gemini/OpenAI) dan sintesis TTS (VOICEVOX / MsEdgeTTS):

```bash
npm run exam:generate:choukai -- --level N5 --limit 5 --types official
```

Output default:
- File JSON: `data/imports/jlpt-n5-listening-draft.json`
- File Audio: `data/imports/assets/listening/*.mp3`

Draft yang dibuat selalu `isPublished: false`. Alur penyelesaian impor:

1. Generate JSON draft dan file audio;
2. Review isi soal, transkrip percakapan, dan pilihan jawaban;
3. Validasi/plan import menggunakan `exam:import:validate` dengan menyertakan path folder aset;
4. Jalankan perintah apply untuk mengunggah aset ke Supabase storage `exam-assets` dan menyimpan rekaman ke database.

## Mesin TTS & Pengisi Suara (Speakers)

Skrip mendukung dua jenis mesin sintesis suara (TTS):

1. **VOICEVOX (Lokal)**: Sangat direkomendasikan karena memberikan variasi karakter suara Jepang yang natural dan ekspresif. Pastikan aplikasi VOICEVOX sudah berjalan di latar belakang pada port default `50021`.
2. **MsEdgeTTS (Cloud Fallback)**: Menggunakan Microsoft Edge TTS API (tidak membutuhkan instalasi lokal, hanya butuh koneksi internet).

Secara bawaan, generator akan mendeteksi ketersediaan VOICEVOX lokal secara otomatis. Jika tidak aktif, ia akan beralih ke MsEdgeTTS. Anda dapat memaksa penggunaan mesin tertentu menggunakan opsi `--tts-engine`:

```bash
npm run exam:generate:choukai -- --level N5 --limit 5 --tts-engine edge
```

Pemetaan peran suara:
- **Narrator**: Shikoku Metan (VOICEVOX) / Nanami (Edge)
- **Man**: Aoyama Ryuusei (VOICEVOX) / Keita (Edge)
- **Woman**: Kasukabe Tsumugi (VOICEVOX) / Nanami (Edge)

## Prasyarat Software
Untuk menjalankan penggabungan (concatenation) dan kompresi potongan audio dialog secara otomatis, Anda **wajib** memiliki **FFmpeg** yang terinstal di sistem dan terdaftar dalam path environment global (`ffmpeg`).

## Mondai Coverage

Tipe official yang didukung:

- `task_comprehension`: Kadai Rikai (課題理解). Pilihan jawaban tercetak di pamphlet (berupa teks lengkap).
- `point_comprehension`: Pointo Rikai (ポイント理解). Pilihan jawaban tercetak di pamphlet.
- `summary_comprehension`: Gaiyou Rikai (概要理解). Pertanyaan dan pilihan jawaban hanya diucapkan di audio. Pilihan jawaban berupa angka `1`, `2`, `3`, `4`.
- `verbal_expressions`: Hatsuwa Hyougen (発話表現). Respon lisan atas suatu ilustrasi/situasi. Pilihan jawaban berupa angka `1`, `2`, `3`.
- `quick_response`: Sokuji Outou (即時応答). Respon lisan instan atas ucapan pendek. Pilihan jawaban berupa angka `1`, `2`, `3`.

## Opsi Tambahan

```bash
npm run exam:generate:choukai -- \
  --level N3 \
  --limit 5 \
  --types task_comprehension,quick_response \
  --seed 20260612 \
  --limit-vocab 10 \
  --limit-grammar 8 \
  --tts-engine voicevox
```

Opsi penting:
- `--level`: `N5`, `N4`, `N3`, `N2`, atau `N1`.
- `--limit`: batas jumlah soal final.
- `--types`: `official`, `all`, atau daftar tipe dipisahkan koma.
- `--tts-engine`: `voicevox`, `edge`, atau `auto`.
- `--seed`: nilai acak untuk pemilihan kosakata secara deterministik.
- `--output`: path output file JSON tujuan.

## Validasi Dan Import

Gunakan perintah validasi bawaan dengan mengarahkan root aset ke folder output `assets` hasil generate:

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-listening-draft.json --asset-root data/imports/assets --plan
```

Apply impor ke Supabase (mengunggah mp3 ke bucket `exam-assets` dan memperbarui database):

```bash
npm run exam:import:validate -- data/imports/jlpt-n5-listening-draft.json --asset-root data/imports/assets --apply
```
