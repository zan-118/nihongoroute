# Arsitektur Sistem

> Terakhir diperbarui: 24 Juli 2026

---

## 1. Diagram Komponen

```mermaid
graph TD
    subgraph Client ["Sisi Klien (Browser)"]
        UI["React UI Components"]
        Store["Zustand Stores<br/>useUserStore, useSRSStore,<br/>useUIStore, useAuthStore"]
        IDB[("IndexedDB<br/>idb-keyval")]
        HookSync["useSyncProgress.ts"]
        HookMut["useCloudMutation.ts"]
        BC["BroadcastChannel<br/>nihongoroute_sync"]
    end

    subgraph Server ["Server Next.js"]
        Actions["Server Actions<br/>src/actions/*.actions.ts"]
        API["API Route Handlers<br/>/api/tts, /api/furigana,<br/>/api/cards, /api/health,<br/>/api/webhooks/*"]
        AuthCB["Auth Callback<br/>/auth/callback"]
        EdgeTTS["MsEdgeTTS Client"]
        Gemini["Gemini AI Client"]
    end

    subgraph Supabase ["Supabase / PostgreSQL"]
        Auth["Supabase Auth<br/>auth.users"]
        DB[("PostgreSQL<br/>27 Tabel")]
        RPC["RPC sync_user_progress"]
        Buckets[("Storage Buckets<br/>asset, exam-assets, tts-cache")]
    end

    Donation["Saweria & Trakteer"] -->|POST Webhook| API

    UI <--> Store
    Store <-->|persist via idb-keyval| IDB
    Store -->|Track dirty state| HookSync
    HookSync -->|Debounce 2000ms| HookMut
    HookMut -->|Invoke RPC| RPC
    RPC -->|accepted_xp + bulk update| DB
    HookMut -->|SYNC_COMPLETE| BC
    BC -->|Invalidate cache tab lain| UI

    UI -->|Invoke Action| Actions
    Actions -->|Query / Mutate| DB
    UI -->|Fetch Audio / Furigana / Cards| API
    API -->|Check cache tts_cache| DB
    API -->|Sintesis dinamis| EdgeTTS
    API -->|Generate lesson| Gemini
    API -->|Insert supporter| DB
    Buckets <-->|Read/Write audio & assets| API
    Actions -->|Storage link| Buckets
    AuthCB -->|Exchange code for session| Auth
```

---

## 2. Alur Data Utama

### A. Sinkronisasi Progres 3-Tier (Offline-First)

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1 — Local Memory (Zero-Latency UI)                        │
│                                                                 │
│  Aktivitas belajar → Zustand store → IndexedDB (idb-keyval)    │
│  Perubahan data → dirtyLessons / dirtySrs (Set)                │
└───────────────────────────┬─────────────────────────────────────┘
                            │ perubahan terdeteksi
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ TIER 2 — Debounce Orchestrator (useSyncProgress.ts)             │
│                                                                 │
│  Memantau: profileKey, dirtySrsSize, dirtyLessonsSize           │
│  Timer debounce 2000ms — reset jika ada mutasi baru             │
│  Skip jika: isFetching, isPending, isGuest, belum hydrated      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ timer selesai
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ TIER 3 — Cloud Mutation (useCloudMutation.ts + RPC)             │
│                                                                 │
│  1. buildSrsUpdates() + buildLessonUpdates()                    │
│  2. supabase.rpc('sync_user_progress', { ... })                 │
│  3. Server menghitung accepted_xp (anti-cheat)                  │
│  4. Client update XP lokal dari accepted_xp                     │
│  5. BroadcastChannel.postMessage("SYNC_COMPLETE")               │
│  6. Tab lain invalidate query cache                             │
│                                                                 │
│  Retry: 3x dengan exponential backoff (maks 10 detik)           │
└─────────────────────────────────────────────────────────────────┘
```

### B. Alur Text-to-Speech (TTS)

```
[Komponen UI]
      │
      ├─► GET /api/tts?text=...&voice=...&rate=...
      │
      ▼
[/api/tts Route Handler]
      │
      ├─► Hash MD5(text + voice + rate)
      │
      ├─► Query tabel tts_cache by hash
      │
      ├───[CACHE HIT]──► Download .mp3 dari bucket tts-cache
      │                   Response: audio/mpeg + Cache-Control: immutable
      │
      └───[CACHE MISS]─► Sintesis dinamis via MsEdgeTTS
                          Response: audio/mpeg + Cache-Control: no-store
                          (TIDAK otomatis disimpan ke DB)

[Fallback klien]
      │
      └─► Jika /api/tts gagal (error/timeout) →
          Web Speech API (window.speechSynthesis, lang: ja-JP)
```

---

## 3. Zustand Stores

Empat stores yang dipersistensi via `idb-keyval`:

| Store | File | Data Utama |
|-------|------|------------|
| `useAuthStore` | `src/store/useAuthStore.ts` | Session, user auth state |
| `useUserStore` | `src/store/useUserStore.ts` | XP, level, streak, studyDays, inventory, completedLessons, dirtyLessons |
| `useSRSStore` | `src/store/useSRSStore.ts` | SRS card states, dirtySrs |
| `useUIStore` | `src/store/useUIStore.ts` | Settings, notifications, sync status, UI preferences |

**Aturan penggunaan**: Selalu pakai atomic selector (`useUserStore((s) => s.xp)`). Dilarang destructure langsung.

---

## 4. Strategi Rendering & Cache

### ISR (Incremental Static Regeneration)

Halaman konten library menggunakan ISR dengan `generateStaticParams()` untuk pre-render dan `revalidate = 3600` (1 jam):

| Halaman | Path |
|---------|------|
| Kosakata detail | `/library/vocab/[slug]` |
| Kanji detail | `/library/kanji/[slug]` |
| Tata bahasa detail | `/library/grammar/[slug]` |
| Mendengar detail | `/library/listening/[slug]` |
| Membaca detail | `/library/reading/[slug]` |
| Cheatsheet detail | `/library/cheatsheet/[id]` |
| Pelajaran kursus | `/courses/[categoryId]/[slug]` |

Slug yang belum ter-pre-render di-generate on-demand dan di-cache (`dynamicParams = true`).

### Data Progres Pengguna

Status pengguna (XP, SRS, lesson progress) diproses di sisi klien via Zustand + IndexedDB, disinkronkan ke server via RPC — **bukan** melalui ISR/SSR. Ini mencegah cache poisoning pada halaman statis.

---

## 5. Keputusan Desain

- **Zero-latency UI**: Zustand memproses state di klien sebelum data dikirim ke server.
- **Separasi konten library vs progres pengguna**: Konten library menggunakan ISR + revalidate. Progres pengguna menggunakan client-side sync via RPC.
- **Legacy exam adapter**: Komponen `MockExamEngine` membaca format data lama. Adapter `src/lib/exams/supabase-adapter.ts` (`toLegacyExamData`) memetakan data relasional baru ke format lama.
- **Optimasi bundle**: `optimizePackageImports` di `next.config.ts` untuk Radix UI, Iconify, Framer Motion, Date-fns, Sonner, Wanakana. Pemisahan bundle via `next/dynamic` untuk komponen besar.
- **Tabel `articles`**: Tabel ini ada di database produksi (50 rows, RLS aktif) dan diquery oleh server actions, namun belum masuk file skema konsolidasi `initial_schema.sql`. Tabel ini digunakan sebagai fallback konten pelajaran di `lessons.actions.ts`.
