# Deployment & Ops Runbook

> **Status Dokumentasi**: Aktif & Tersinkronisasi  
> **Terakhir Diperbarui**: 2 Agustus 2026  
> **Ruang Lingkup**: Configuration Build, CI/CD Pipeline, Release Checklist, & Matrix Cache  
> **Rujukan Utama**: [README.md](../README.md) | [CONFIGURATION.md](CONFIGURATION.md) | [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 📋 Daftar Isi

1. [Konfigurasi Build Next.js](#1-konfigurasi-build-nextjs)
2. [Pipeline CI/CD (GitHub Actions)](#2-pipeline-cicd-github-actions)
3. [Release Checklist (Pra-Rilis Produksi)](#3-release-checklist-pra-rilis-produksi)
4. [Strategi Cache & Revalidasi (Runbook Ops)](#4-strategi-cache--revalidasi-runbook-ops)
   - [Konten Library (ISR)](#konten-library-isr)
   - [HTTP Cache Headers](#http-cache-headers)
   - [Data Progres & TTS Cache](#data-progres--tts-cache)

---

## 1. Konfigurasi Build Next.js

Build Next.js dikonfigurasi melalui `next.config.ts`:

| Opsi | Nilai | Keterangan |
|---|---|---|
| `poweredByHeader` | `false` | Menghapus header `X-Powered-By` untuk keamanan |
| `reactStrictMode` | `true` | Penegakan strict mode React 19 |
| `images.minimumCacheTTL` | 30 hari | Durasi cache optimasi gambar |
| `images.formats` | `avif`, `webp` | Format gambar modern terkompresi |
| `serverExternalPackages` | `kuroshiro`, `kuroshiro-analyzer-kuromoji`, `msedge-tts`, `isomorphic-ws`, `ws` | Node.js native dependencies |

---

## 2. Pipeline CI/CD (GitHub Actions)

Otomatisasi pengujian, verifikasi build, dan deployment dikelola via `.github/workflows/quality.yml`.

### Job: App Quality
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`

### Job: Database Guard
- `npm run db:migrations:check`
- `supabase/setup-cli@v2`

### Job: Deploy to Vercel (Prebuilt)
- Membutuhkan suksesnya job `App Quality` & `Database Guard` pada push branch `main`.
- `vercel pull --yes --environment=production`
- `vercel build --prod`
- `vercel deploy --prebuilt --prod`

> **Prasyarat Konfigurasi Deployment**:
> 1. **GitHub Secrets**: Daftarkan `VERCEL_TOKEN`, `VERCEL_ORG_ID`, dan `VERCEL_PROJECT_ID` di Settings Repository ➔ Secrets and variables ➔ Actions.
> 2. **Vercel Dashboard Setup**: Pada Vercel Dashboard ➔ Project Settings ➔ Git ➔ **Ignored Build Step**, set command ke `exit 0` agar Vercel mengabaikan auto-build bawaan Git push dan menantikan *prebuilt deployment* dari GitHub Actions.


---

## 3. Release Checklist (Pra-Rilis Produksi)

Eksekusi perintah berikut sebelum melakukan penggabungan (merge) ke branch `main`:

```bash
npm run typecheck            # 1. Validasi pengetikan TypeScript
npm run lint                 # 2. Audit standar linter
npm run test:unit            # 3. Eksekusi unit test bisnis
npm run db:migrations:check    # 4. Verifikasi migrasi SQL Supabase
npm run build                # 5. Uji kompabilitas build produksi
```

---

## 4. Strategi Cache & Revalidasi (Runbook Ops)

### Konten Library (ISR)
- **Pre-render**: `generateStaticParams()` untuk slug populer saat build time.
- **Revalidation**: `revalidate = 604800` (7 hari).
- **On-demand**: `dynamicParams = true` untuk slug baru.

### HTTP Cache Headers
- `/fonts/*` ➔ `public, max-age=31536000, immutable`
- `/library/*` ➔ `public, s-maxage=604800, stale-while-revalidate=86400`

### Data Progres & TTS Cache
- **Data Progres**: Revalidasi manual via `revalidatePath` setelah mutasi Server Action.
- **TTS Cache Hit**: `Cache-Control: public, max-age=604800, immutable` (7 hari).
