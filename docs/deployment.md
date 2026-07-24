# Deployment & CI/CD

> Terakhir diperbarui: 24 Juli 2026

---

## 1. Konfigurasi Build

Next.js dikonfigurasi di `next.config.ts` dengan opsi:

| Opsi | Nilai | Keterangan |
|------|-------|------------|
| `poweredByHeader` | `false` | Sembunyikan header X-Powered-By |
| `reactStrictMode` | `true` | |
| `images.minimumCacheTTL` | 30 hari | |
| `images.formats` | `avif`, `webp` | |
| `serverExternalPackages` | `kuroshiro`, `kuroshiro-analyzer-kuromoji`, `msedge-tts`, `isomorphic-ws`, `ws` | Tidak di-bundle ke klien |
| `transpilePackages` | `@react-pdf/renderer` | |

> [!NOTE]
> Tidak ada `output: "standalone"` di konfigurasi saat ini. Dependensi `@vercel/analytics` dan `@vercel/speed-insights` tersedia di `package.json`.

---

## 2. CI/CD Pipeline

Otomatisasi via GitHub Actions di `.github/workflows/quality.yml`.

### Job: App Quality

| Step | Perintah |
|------|----------|
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Unit tests | `npm run test:unit` |
| Build | `npm run build` |

Runtime: Node.js 22, Ubuntu.

### Job: Database Guard

| Step | Perintah |
|------|----------|
| Migration check | `npm run db:migrations:check` |
| Supabase CLI setup | `supabase/setup-cli@v2` |

**Trigger**: Push ke `main`, Pull Request ke `main`, manual dispatch.
**Concurrency**: Satu eksekusi per ref — eksekusi lama dibatalkan.

---

## 3. Release Checklist

```bash
npm run typecheck          # Validasi tipe TypeScript
npm run lint               # Standar kode & keamanan
npm run test:unit          # Unit test logika bisnis
npm run db:migrations:check  # Konsistensi migrasi database
npm run build              # Build produksi
```

---

## 4. Strategi Cache & Revalidasi

### Konten Library (ISR)

Halaman detail library menggunakan **Incremental Static Regeneration**:

- `generateStaticParams()` untuk pre-render slug populer saat build.
- `revalidate = 3600` (1 jam) — halaman di-regenerasi di latar belakang.
- `dynamicParams = true` — slug baru di-render on-demand dan di-cache.

Halaman yang menggunakan ISR: vocab, kanji, grammar, listening, reading, cheatsheet, courses.

### HTTP Cache Headers (next.config.ts)

| Path | Header |
|------|--------|
| `/fonts/*` | `public, max-age=31536000, immutable` |
| `/library/vocab/*`, `/library/kanji/*`, `/library/grammar/*`, `/library/reading/*`, `/library/listening/*`, `/library/cheatsheet/*` | `public, s-maxage=3600, stale-while-revalidate=59` |

### Data Progres Pengguna

Revalidasi progres pengguna dilakukan secara manual via `revalidatePath` setelah mutasi di Server Actions — **bukan** via ISR/time-based revalidation. Data pengguna diproses client-side via Zustand + RPC.

### TTS Cache

- **Cache hit**: `Cache-Control: public, max-age=604800, immutable` (7 hari).
- **Cache miss** (dynamic synthesis): `Cache-Control: no-store`.
