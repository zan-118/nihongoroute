# JLPT Import Format

Intermediate JSON ini adalah gerbang sebelum data dimasukkan ke bank soal Supabase. File harus lulus validator lokal dulu:

```bash
npm run exam:import:validate -- docs/jlpt-import-sample.json
```

Struktur utama:

```json
{
  "template": {},
  "assets": [],
  "passages": [],
  "questions": [],
  "templateQuestions": []
}
```

Aturan penting:

- `template.jlptLevel` harus `N5`, `N4`, `N3`, `N2`, atau `N1`.
- `questions[].sessionType` harus `vocabulary`, `grammar`, `reading`, atau `listening`.
- `choices` minimal 2 item, dan `correctChoiceIndex` memakai index 0-based.
- `passageKey` harus menunjuk ke `passages[].key`.
- Untuk template `fixed`, semua question harus masuk `templateQuestions` dengan `position` unik.
- Asset path disimpan relatif terhadap bucket `exam-assets`; prefix `exam-assets/` boleh dipakai di input dan akan dinormalisasi validator.
- `sourceType/sourceId` dipakai untuk SRS weak point. Jika `sourceType` diisi tanpa `sourceId`, validator memberi warning karena item itu tidak akan masuk SRS.

Contoh lengkap ada di `docs/jlpt-import-sample.json`.

## Dry Run Dan Apply

Lihat rencana row Supabase dan asset yang akan dipakai:

```bash
npm run exam:import:validate -- docs/jlpt-import-sample.json --plan
```

Apply ke Supabase hanya dilakukan jika flag `--apply` diberikan. Perintah ini membutuhkan `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` di `.env.local`.

```bash
npm run exam:import:validate -- data/imports/n5-paket-1.json --asset-root data/imports/assets --apply
```

Catatan:

- Importer memakai UUID deterministik dari `template.slug` dan `key`, sehingga re-run package yang sama akan menargetkan row yang sama.
- Asset di-upload ke bucket `exam-assets` sebelum row database di-upsert.
- Template positions untuk template fixed di-reset lalu diinsert ulang agar perubahan urutan bisa diterapkan dengan bersih.
- Jangan set `isPublished: true` sebelum paket real selesai direview.
