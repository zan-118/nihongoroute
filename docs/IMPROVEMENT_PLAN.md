# Rencana Perbaikan (Improvement Plan)

> **Status**: P0 lokal selesai - P1/P2 belum dieksekusi
> **Sumber**: External code review (skor **8.2/10**) + verifikasi internal terhadap codebase
> **Terakhir Diperbarui**: 14 Agustus 2026
> **Prinsip**: Tidak ada rewrite. Tidak ada fitur baru. Fokus 6–8 minggu pada *hardening* (security, performance, UX learning loop) dan *quality* (coverage, refactor).
> **Catatan P0**: Perubahan lokal P0 sudah diverifikasi dengan `npm run lint`, `npm run typecheck`, `npm run test` (86 files / 450 tests), dan `npm run build`. Build membutuhkan network untuk `next/font/google`. Live Supabase RLS audit masih pending sampai tersedia koneksi Supabase CLI (`--db-url` atau linked project token).

---

## 📋 Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Status Verifikasi Klaim Review](#2-status-verifikasi-klaim-review)
3. [P0 — Bug & Security (Minggu 1–2)](#3-p0--bug--security-minggu-1-2)
4. [P1 — UX & Performance (Minggu 3–4)](#4-p1--ux--performance-minggu-3-4)
5. [P2 — Kualitas & Maintainability (Minggu 5–6)](#5-p2--kualitas--maintainability-minggu-5-6)
6. [Hal yang Sengaja TIDAK Dikerjakan](#6-hal-yang-sengaja-tidak-dikerjakan)
7. [Definisi Selesai & Checklist](#7-definisi-selesai--checklist)

---

## 1. Ringkasan Eksekutif

Review eksternal menilai NihongoRoute **8.2/10** sebagai produk publik dan **9/10** sebagai portfolio, dengan kekuatan utama pada *offline-first architecture*, *domain separation*, dan kelengkapan scope. Rekomendasi inti review: **jangan tambah fitur, fokus pada quality + learning loop**.

Setelah verifikasi manual terhadap source code, mayoritas klaim review **terbukti akurat**, dengan dua penyesuaian:

| Klaim review | Hasil verifikasi |
|---|---|
| Permissions-Policy memblokir microphone sementara ada Shadowing Recorder | ✅ **BENAR — bug nyata, prioritas tertinggi** |
| 9× `dangerouslySetInnerHTML` perlu audit XSS | ✅ Jumlah tepat, tapi ⚠️ mayoritas sudah `sanitizeHtml()` → prioritas diturunkan |
| Coverage threshold 35/20/35/35 terlalu rendah | ✅ Benar |
| `images: unoptimized: true` perlu dievaluasi | ✅ Benar, tradeoff perlu benchmark |
| Infrastruktur Daily Route sudah ada | ✅ Benar (`buildDailyRoute` dkk. + test) |

**Keputusan strategis**: Eksekusi dalam 3 fase (P0 → P1 → P2), masing-masing 2 minggu, dengan *Definition of Done* per item (lihat §7).

---

## 2. Status Verifikasi Klaim Review

| # | Klaim | Status | Bukti di codebase |
|:---:|---|---|---|
| 1 | `microphone=()` di Permissions-Policy vs fitur recording | ❌ **Bug terkonfirmasi** | `next.config.ts` (baris ~26); `ShadowingRecorderClient.tsx` (baris 212, `getUserMedia({ audio: true })`); `PronunciationPanel.tsx` (baris 217) |
| 2 | 9× `dangerouslySetInnerHTML` | ✅ Akurat (9 di `src`) | 6 di antaranya sudah lewat `sanitizeHtml()`; sisanya `JsonLd.tsx` (structured data) & `ReadingPageClient.tsx` (tag `<style>` statis) |
| 3 | Threshold coverage 35/20/35/35 | ✅ Akurat | `vitest.config.ts` (baris 12–15) |
| 4 | `images: unoptimized: true` | ✅ Akurat | `next.config.ts` |
| 5 | `optimizePackageImports` | ✅ Akurat (config juga memuat `sonner`) | `next.config.ts` |
| 6 | `buildDailyRoute` dkk. sudah ada | ✅ Akurat (+ sudah ada test) | `src/lib/learning/ecosystem/*`, `__tests__/lib/learning/ecosystem.test.ts` |
| 7 | Security headers lengkap | ✅ Akurat | `next.config.ts`; `docs/SECURITY.md` |
| 8 | RLS 28 tabel aktif | ✅ Akurat (per dokumentasi) | `docs/SECURITY.md` §4 — **audit kesesuaian dengan DB aktual tetap dijadwalkan** |

---

## 3. P0 — Bug & Security (Minggu 1–2)

> Tujuan: menutup bug yang berdampak langsung pada user & celah yang berpotensi eksploitasi, sebelum pekerjaan lain.

### 3.1 Fix Permissions-Policy microphone ✅ DONE

**Masalah**: Header `Permissions-Policy: microphone=()` dikirim ke semua route, sehingga `getUserMedia({ audio: true })` di Shadowing Recorder dan Pronunciation Panel **selalu ditolak browser di production** — fitur recording rusak permanen.

**Status 14 Agustus 2026**: `next.config.ts` sudah memakai `microphone=(self)` dan dilindungi test `__tests__/config/security-headers.test.ts`.

**Langkah**:
1. Ubah nilai header di `next.config.ts` menjadi `camera=(), microphone=(self), geolocation=(), payment=(), usb=()`.
2. Pastikan tidak ada kebutuhan microphone dari iframe/domain lain (tidak ada → aman pakai `(self)`).
3. (Opsional) Tambahkan `navigator.permissions.query({ name: "microphone" })` check di klien untuk pesan error yang lebih informatif.

**Verifikasi**: Build + test; manual test rekam audio di production/preview.

**Estimasi**: 0.5 hari.

---

### 3.2 Audit Authorization API & Server Actions ✅ DONE

**Masalah**: Review menyoroti endpoint yang menangani data sensitif/mutasi:
`/api/cards`, `/api/tts`, `/api/webhooks/*`, auth callback, progress sync, XP mutation, social actions.

**Langkah**:
1. Daftarkan seluruh route handler (`src/app/api/**/route.ts`) dan server actions (`src/actions/*`) dalam satu tabel audit (dapat ditambahkan ke `docs/API_REFERENCE.md`): *auth yang dibutuhkan, siapa yang boleh akses, apakah memvalidasi ownership*.
2. Untuk setiap endpoint mutasi: pastikan memvalidasi `auth.getUser()` (bukan sekadar header), ownership (`user_id = auth.uid()`), dan *input validation* (zod atau manual).
3. Prioritaskan endpoint yang saat ini mungkin tanpa guard: TTS (biaya API), cards (data user), social actions.
4. Pastikan `createAdminClient()` (service role) tidak pernah dipanggil dari Client Component — periksa via grep lint rule.

**Verifikasi**: Manual review per endpoint + regression test login/logout flow; tambahkan test untuk akses tanpa token (401) dan akses silang user (403).

**Status 14 Agustus 2026**: audit matrix ditambahkan ke `docs/API_REFERENCE.md`; webhook unauthorized, TTS burst limit, dan mutasi community unauthenticated ditutup regression test; admin client server-only dijaga test import.

**Estimasi**: 2–3 hari.

---

### 3.3 Audit Sisa `dangerouslySetInnerHTML` (scope menyempit) ✅ DONE

**Masalah**: 9 penggunaan ditemukan; **6 sudah lewat `sanitizeHtml()`** sehingga tidak perlu diubah. Sisa yang perlu dicek:

| File | Konteks | Risiko |
|---|---|---|
| `src/features/library/reading/ReadingPageClient.tsx` (baris 285) | injeksi tag `<style>` statis | Rendah — bukan user input; pastikan tetap statis |
| `src/components/seo/JsonLd.tsx` | `JSON.stringify` structured data | Rendah — data dibuat internal; pastikan tidak pernah menerima input user mentah |

**Langkah**:
1. Konfirmasi keduanya tidak pernah menerima input user/database mentah.
2. Tambahkan komentar *guard* di kedua lokasi + aturan ESLint `react/no-danger` di-set ke `warn` agar penggunaan baru selalu direview.

**Verifikasi**: grep ulang `dangerouslySetInnerHTML` → maksimal 2 penggunaan tanpa `sanitizeHtml`, keduanya terdokumentasi aman.

**Status 14 Agustus 2026**: `react/no-danger` aktif sebagai warning; JSON-LD dan style Zen Mode diberi guard comment. Total 9 warning tetap terlihat agar penggunaan baru wajib direview.

**Estimasi**: 1 hari.

---

### 3.4 Audit RLS Supabase ✅ LOCAL DONE — LIVE DB PENDING

**Masalah**: Review menilai ini *lebih penting daripada fitur baru*. Dokumentasi klaim 28 tabel RLS aktif, namun belum diverifikasi terhadap DB aktual.

**Langkah**:
1. Buat migration/script audit yang mencantumkan semua tabel + status RLS (`SELECT relname, relrowsecurity FROM pg_class ...`).
2. Bandingkan kebijakan aktual dengan matriks `docs/SECURITY.md` §4; tandai perbedaan.
3. Uji dengan role `anon` dan `authenticated` (mis. via `supabase` CLI atau RPC test) untuk tabel kritis: progress, XP, feedback, social.
4. Perbaiki kebijakan yang menyimpang; update dokumentasi jika matriks berubah.

**Verifikasi**: Script audit lulus tanpa perbedaan; test RLS dengan role terbatas.

**Status 14 Agustus 2026**: SQL audit dibuat di `supabase/audit-rls.sql`; migration lokal diperkeras dengan `security_invoker = true` untuk `leaderboard_profiles`, revoke default function execute, dan grant eksplisit untuk `sync_user_progress`. Live DB audit masih menunggu koneksi Supabase CLI dengan `--db-url` atau linked project token.

**Estimasi**: 2–3 hari.

---

## 4. P1 — UX & Performance (Minggu 3–4)

> Tujuan: memperkuat *learning loop* dan mengurangi friction, tanpa fitur baru.

### 4.1 Jadikan Daily Route sebagai Core UX

**Masalah**: Homepage menjual terlalu banyak fitur sekaligus ("mulai dari mana?"). Infrastructure `buildDailyRoute`, `buildEcosystemRecommendations`, `buildWeakPointInsights` **sudah ada + sudah dites** — tinggal menjadikannya pusat UX.

**Langkah**:
1. Dashboard: jawab "**Hari ini saya harus belajar apa?**" dalam 2 detik — jadikan `DailyRoutePanel` sebagai hero dashboard (bukan sekadar panel di bawah).
2. Tambah *onboarding ringan* 3 langkah: **Pilih tujuan → Pilih level (kana/N5–N1) → Dapatkan Daily Route** (berdurasi 20 menit).
3. Simpan preferensi onboarding (goal + level) ke store/user profile agar Daily Route makin personal.
4. Pertahankan umur route ≤ 24 jam (regenerate per hari) dengan penjelasan singkat di UI.

**Verifikasi**: Manual walkthrough dashboard; test existing `ecosystem.test.ts` tetap lulus + tambah test untuk preferensi onboarding.

**Estimasi**: 4–5 hari.

---

### 4.2 Kurangi Cognitive Load Homepage & Perbaiki Messaging

**Masalah**: Hero generik ("Kuasai Bahasa Jepang"), klaim absolut "100% Gratis Selamanya", dan terlalu banyak fitur di satu halaman.

**Langkah**:
1. Hero → pesan yang differentiated, mis. **"Jalur belajar Bahasa Jepang yang mengikuti kemampuanmu"** + subheadline fitur inti.
2. Ganti narasi "30 fitur" menjadi alur **Learn → Practice → Review → Progress**.
3. Klaim "100% Gratis Selamanya" → **"Gratis untuk belajar, tanpa iklan"** (atau definisikan eksplisit apa yang dimaksud gratis).
4. Pastikan angka statistik (100+ pembelajar, 22.000+ vocab, dst.) bersumber data dinamis/akurat.

**Verifikasi**: Screenshot sebelum/sesudah; cek klaim angka di halaman.

**Estimasi**: 2–3 hari.

---

### 4.3 Lazy-load Fitur Berat & Bundle Analysis

**Masalah**: `@react-pdf/renderer` (sudah di `transpilePackages`), TTS deps, game engine, dan exam engine berpotensi masuk bundle halaman biasa.

**Langkah**:
1. Pastikan semua import fitur berat via `next/dynamic` (atau sudah `lazy`) — terutama PDF export, TTS, games, social, advanced tools.
2. Jalankan bundle analysis (`ANALYZE=true npm run build`) dan bedakan **initial JS vs lazy-loaded feature JS**.
3. Audit `@iconify/react`, `framer-motion`, `wanakana`, dan Japanese parsing libs terhadap penggunaannya.
4. Benchmark tradeoff `images: unoptimized: true` (LCP + image transfer + mobile bandwidth) — pertahankan jika memang Cloudflare-oriented dan hasilnya baik, atau aktifkan optimasi per-rute tertentu.

**Verifikasi**: Laporan bundle analysis; LCP mobile < 2.5s.

**Estimasi**: 3–4 hari.

---

## 5. P2 — Kualitas & Maintainability (Minggu 5–6)

> Tujuan: memperkuat fondasi jangka panjang.

### 5.1 Naikkan Coverage Threshold Bertahap

**Masalah**: Threshold saat ini `35 / 20 / 35 / 35` (`vitest.config.ts`).

**Langkah** (bertahap agar CI tidak jebol mendadak):
1. **Phase 1**: `50 / 35 / 50 / 50` — tutup celah dengan test baru (bukan menurunkan threshold).
2. **Phase 2**: `60 / 45 / 60 / 60`.
3. Prioritaskan coverage untuk domain bernilai tinggi: SRS algorithm, XP/progression, sync engine, exam scoring/generation, answer validation, auth, content hydration, offline mutation queue.

**Verifikasi**: CI coverage gate lulus di setiap phase.

**Estimasi**: Berkelanjutan (paralel dengan P0–P1).

---

### 5.2 Refactor Exam Generation & TTS Pipeline

**Masalah**: File besar di domain yang kompleks & sering berubah:

| File | Baris |
|---|---|
| `scripts/tts/generate_dialogue_tts.js` | 1.273 |
| `scripts/tts/generate_dialogue_tts_direct.js` | 1.165 |
| `src/lib/exams/import-pipeline.ts` | 1.079 |
| `src/lib/exams/moji-goi-generator.ts` | 940 |
| `scripts/generate-jlpt-choukai.mjs` | 906 |
| `src/lib/exams/bunpou-generator.ts` | 826 |
| `src/lib/exams/jlpt-session.ts` | 800 |

> `src/types/supabase.generated.ts` (1.269) **tidak** termasuk — generated file.

**Langkah**:
1. Pecah `import-pipeline.ts` dan `jlpt-session.ts` berdasarkan tahapan (extract → validate → transform → persist).
2. Pecah generator (moji-goi, bunpou) menjadi: data config + generator + formatter.
3. Scripts TTS: ekstrak shared helper (TTS client, retry, logging) ke modul bersama.
4. Jaga perilaku identik — dukung dengan golden tests/regression test sebelum refactor.

**Verifikasi**: Semua test exam lulus; hasil generate identik (diff kosong) sebelum/sesudah refactor.

**Estimasi**: 4–5 hari.

---

## 6. Hal yang Sengaja TIDAK Dikerjakan

| Item | Alasan |
|---|---|
| **Rewrite** | Architecture sehat; project terlalu besar; risiko tinggi tanpa benefit |
| **Fitur roadmap baru** (AI pronunciation, visual kanji, Anki export, badges, mobile, AI essay, realtime sync, analytics) | Freeze 6–8 minggu; fokus quality + learning loop dulu |
| **Penambahan fitur homepage** | Sebaliknya: *kurangi* cognitive load |
| **Menghapus `images: unoptimized: true` secara langsung** | Keputusan setelah benchmark, bukan asumsi |

---

## 7. Definisi Selesai & Checklist

### Definition of Done (berlaku untuk semua item)
- [ ] Typecheck + lint lulus (`npm run lint`, typecheck)
- [ ] Test suite lulus (unit/integration) tanpa regresi
- [ ] Build production sukses
- [ ] Jika menyentuh logika bisnis/DB/API → `docs/*.md` terkait diperbarui
- [ ] Item P0 memiliki test yang menutup regresi (auth, XSS, RLS)

### Urutan Eksekusi yang Disarankan
```text
Minggu 1–2  P0: 3.1 → 3.2 → 3.4 → 3.3 (3.1 bisa di hari pertama)
Minggu 3–4  P1: 4.1 → 4.2 → 4.3
Minggu 5–6  P2: 5.2 → 5.1 (5.1 berjalan paralel sejak awal)
```

### Status Eksekusi P0
1. `microphone=(self)` di `next.config.ts` selesai dan dijaga test header.
2. Audit auth/ownership P0 dicatat di `docs/API_REFERENCE.md`.
3. `/api/tts` tetap publik, tetapi sudah diberi burst limit `30 request/menit/IP` dan regression test `429`.
4. ESLint `react/no-danger` menjadi `warn`; 9 penggunaan terpantau, yang menerima HTML konten melewati `sanitizeHtml()`.
5. RLS hardening lokal selesai; live DB audit belum dijalankan.
