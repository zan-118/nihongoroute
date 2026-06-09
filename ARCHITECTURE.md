# NihongoRoute Architecture

Audit snapshot: 2026-06-09

This document describes the codebase as it exists now. It is based on the local repository structure, application routes, Supabase migrations, Sanity schemas, server actions, stores, hooks, tests, and configuration files.

## System Summary

NihongoRoute is a Next.js App Router application for learning Japanese in Indonesian. The product combines public learning content, interactive study tools, offline-first progress tracking, gamification, SRS review, mock exams, Sanity-powered editorial content, and Supabase-backed auth/data persistence.

The runtime is split into these major layers:

- Next.js 16 App Router renders pages, layouts, metadata, route handlers, sitemap, robots, and embedded Sanity Studio.
- Supabase provides Auth, public library tables, user progress tables, admin/server data access, storage-backed TTS cache, payment supporter records, and the `sync_user_progress` RPC.
- Sanity CMS provides editorial content for lessons, reading material, listening material, and mock exams.
- Zustand stores keep offline-first client state in IndexedDB through `idb-keyval`.
- TanStack Query coordinates client-side session/progress fetching and background synchronization.
- Route Handlers provide TTS cache reads, furigana generation, flashcard card resolution, health checks, admin bridge APIs, OAuth callback, and payment webhooks.

## Technology Stack

Core runtime:

- `next` 16.2.2
- `react` / `react-dom` 19.2.2
- TypeScript with strict mode and path alias `@/* -> ./src/*`
- Tailwind CSS 3.4 with CSS variables and shadcn-style UI primitives

Data and integration:

- `@supabase/ssr` and `@supabase/supabase-js`
- `sanity`, `next-sanity`, `@sanity/client`, `@sanity/image-url`
- `@tanstack/react-query`
- `zustand` with persisted IndexedDB storage
- `idb-keyval`

Learning/media utilities:

- `kuroshiro` and `kuroshiro-analyzer-kuromoji` for furigana conversion
- VOICEVOX-oriented TTS cache workflows via scripts and `/api/tts`
- Web Speech API fallback on the client
- `@react-pdf/renderer` for PDF generation
- `framer-motion`, `sonner`, `lucide-react`, Radix UI primitives

Testing:

- Vitest 4 with `jsdom`
- Testing Library
- Playwright E2E across desktop and mobile projects

## Top-Level Runtime Shape

### Root Application

`src/app/layout.tsx` defines the root HTML shell, global metadata, viewport, theme provider, TanStack Query provider, Framer Motion LazyMotion, Sonner toaster, production-only Vercel Analytics/Speed Insights, and a client script that clears old TTS cache names.

`src/app/page.tsx` is the public landing page and composes:

- `Hero`
- `FeatureGrid`
- `TrustBanner`
- `LandingFooter`

### Main Authenticated/Learning Shell

`src/app/(main)/layout.tsx` wraps the main application routes with:

- `ProgressProvider`
- `NavWrapper`
- `AppClientAddons`

The `(main)` route group does not appear in the URL. It contains the learning dashboard, courses, library, exams, review, tools, settings, support, sharing, and social pages.

`NavWrapper` is a client component that renders the sidebar, topbar, mobile nav, breadcrumbs, floating actions, page transition animation, and achievement toast. Exam detail pages hide the regular navigation chrome.

### Proxy / Session Refresh

`src/proxy.ts` uses Next.js proxy conventions and delegates to `src/lib/supabase/middleware.ts`.

The Supabase middleware creates a server client with request/response cookies and calls `supabase.auth.getUser()` to refresh auth cookies. Static assets and common image files are excluded by matcher.

## Route Map

Public and utility pages:

- `/`
- `/login`
- `/forgot-password`
- `/update-password`
- `/onboarding`
- `/privacy`
- `/terms`
- `/studio/[[...tool]]`

Main learning routes:

- `/dashboard`
- `/courses`
- `/courses/[categoryId]`
- `/courses/[categoryId]/[slug]`
- `/library`
- `/library/vocab`
- `/library/vocab/[id]`
- `/library/kanji`
- `/library/kanji/[id]`
- `/library/grammar`
- `/library/grammar/[slug]`
- `/library/reading`
- `/library/reading/[slug]`
- `/library/listening`
- `/library/listening/[slug]`
- `/library/cheatsheet`
- `/library/cheatsheet/[id]`
- `/exams`
- `/exams/[id]`
- `/review`
- `/tools`
- `/tools/flashcards`
- `/tools/kana`
- `/tools/survival`
- `/tools/writing`
- `/settings`
- `/share`
- `/social`
- `/support`

API and route handlers:

- `/auth/callback`
- `/api/health`
- `/api/cards`
- `/api/furigana`
- `/api/tts`
- `/api/admin/supabase-search`
- `/api/admin/ai-assistant`
- `/api/webhooks/saweria`
- `/api/webhooks/trakteer`

Metadata routes:

- `/robots.txt` from `src/app/robots.ts`
- `/sitemap.xml` from `src/app/sitemap.ts`
- `/manifest.webmanifest` from `src/app/manifest.ts`

## Data Source Responsibilities

The codebase intentionally uses a split-source model.

### Supabase

Supabase is used for:

- Auth sessions and OAuth/email/anonymous login.
- Public structured library data: `course_categories`, `kanji`, `vocab`, `grammar`, `cheatsheets`, and legacy/public tables for `lessons`, `reading_material`, `listening_material`, `exams`.
- User-owned progress: `profiles`, `user_srs`, `user_lessons`.
- Feedback: `user_feedback`.
- Supporter records: `supporters`.
- TTS cache metadata: `tts_cache` as referenced by code and scripts.
- TTS audio storage bucket: `tts-cache` as referenced by code and scripts.
- Extra content tables referenced by code/scripts: `expressions`, `sentences`, `radicals`.

The live database includes `tts_cache`, `expressions`, `sentences`, `radicals`, and the `tts-cache` storage bucket. These live resources are now captured in the migration drift fix `supabase/migrations/20260609080000_sync_live_schema_drift.sql`.

### Sanity

Sanity is used for editorial and media-rich learning content:

- `lesson`
- `readingMaterial`
- `listeningMaterial`
- `mockExam`

The embedded Studio is configured in `sanity.config.ts` at base path `/studio`. Schemas live under `sanity/schemaTypes`.

Sanity Studio custom inputs bridge back to Supabase through admin API routes:

- `SupabaseSelector`
- `SupabaseCategorySelect`
- `FuriganaGeneratorInput`
- `AIAssistantBar`

The bridge endpoints are protected by `ADMIN_API_SECRET` through `validateAdminApiRequest`.

## Supabase Architecture

Client helpers:

- `src/lib/supabase/client.ts`: browser client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `src/lib/supabase/server.ts`: cookie-aware server client for Server Components, Route Handlers, and Server Actions.
- `src/lib/supabase/server.ts#createStaticClient`: cookie-free anon client for static/public reads and build-time/static contexts.
- `src/lib/supabase/admin.ts`: service-role client for trusted server-only work.
- `src/lib/supabase/middleware.ts`: session refresh in proxy.
- `src/lib/supabase/sync.ts`: local-to-cloud migration and merge support.

Main database objects from migrations:

- `course_categories`
- `profiles`
- `kanji`
- `vocab`
- `grammar`
- `lessons`
- `reading_material`
- `listening_material`
- `user_srs`
- `user_lessons`
- `exams`
- `cheatsheets`
- `user_feedback`
- `supporters`
- `expressions`
- `radicals`
- `sentences`
- `tts_cache`

Main functions/triggers:

- `handle_updated_at`
- `set_updated_at`
- `validate_profile_integrity`
- `protect_srs_logic`
- `handle_new_user`
- `sync_user_progress`
- `update_vocab_examples`

RLS model:

- Public learning-library tables are readable by everyone.
- User progress tables are scoped to `auth.uid()`.
- `user_feedback` accepts inserts and blocks normal public reads.
- `supporters` allows public read access.
- Admin/server-only operations use service-role clients and must never be imported into client components.

## Sanity Architecture

Sanity client helpers:

- `src/lib/sanity.client.ts` creates the default Sanity client.
- `getSanityClient()` switches to non-CDN token-backed reads when Next draft mode is active.
- `urlFor()` builds image URLs.
- `src/lib/queries.ts` centralizes GROQ reads used by app pages and server actions.

Sanity document types:

- `lesson`: rich lesson content, quizzes, Supabase-linked vocab/kanji/grammar lists, reading/listening slug lists, SEO fields.
- `readingMaterial`: reading text, hiragana/furigana, translation, media, quizzes, SEO.
- `listeningMaterial`: transcript, timestamps, hiragana, translation, media, quizzes, SEO.
- `mockExam`: timed exam, passing score, category link, level code, choukai audio, question array.

The app reads Sanity content with `cache: "no-store"` in current query paths. The Sanity client itself is configured with `useCdn: true` for normal reads.

## Server Actions

Server actions live under `src/actions`.

Supabase-focused actions:

- `vocab.actions.ts`: paginated vocab with search, JLPT, POS, and type filters.
- `kanji.actions.ts`: paginated kanji with search and JLPT filters.
- `grammar.actions.ts`: paginated grammar, random grammar, level list.
- `cheatsheets.actions.ts`: list/detail for cheatsheets.
- `flashcard.actions.ts`: flashcard pools from vocab/kanji.
- `expressions.actions.ts`: random daily expression from `expressions`.

Split-source actions:

- `lessons.actions.ts`: Supabase course categories plus Sanity lesson lists.
- `exams.actions.ts`: Supabase category metadata plus Sanity mock exams.
- `library.counts.actions.ts`: Supabase counts for vocab/kanji/grammar and Sanity counts for reading/listening/exams.
- `library.detail.actions.ts`: detail lookup and related-content hydration across Supabase and Sanity-era IDs.
- `reading.actions.ts` and `listening.actions.ts`: paginated Sanity content lists.

`src/actions/library.actions.ts` is a barrel export and intentionally does not include `"use server"` so it can re-export types.

## API Route Handlers

`/api/health`

- Node runtime, dynamic.
- Reports required/feature environment variables without leaking values.

`/api/cards`

- Resolves flashcard IDs into vocab/kanji data.
- Supports UUIDs, slugs, romaji-based legacy IDs, and single kanji characters.

`/api/furigana`

- Uses Kuroshiro and Kuromoji dictionary files from `node_modules/kuromoji/dict`.
- Caches the initialized Kuroshiro instance in module scope.
- Provides CORS for local and production origins.

`/api/tts`

- Reads pre-generated TTS metadata from `tts_cache` and audio from Supabase Storage bucket `tts-cache`.
- Does not synthesize audio in real time.
- Returns 404 on cache miss so clients can fall back to Web Speech API.

`/api/admin/supabase-search`

- Admin bridge used by Sanity Studio.
- Searches categories, vocab, kanji, and grammar.
- Requires `ADMIN_API_SECRET`.

`/api/admin/ai-assistant`

- Admin bridge for Sanity AI helper flows.
- Supports `scan-supabase`, `generate-furigana`, and `generate-lesson`.
- Uses Gemini when `GEMINI_API_KEY` is configured.
- Requires `ADMIN_API_SECRET`.

`/api/webhooks/saweria` and `/api/webhooks/trakteer`

- Validate provider secrets when configured.
- Insert supporter records into Supabase with bronze/silver/gold tier calculation.

`/auth/callback`

- Exchanges Supabase OAuth code for a session and redirects to `next` or `/dashboard`.

## Client State and Offline-First Sync

Zustand stores live under `src/store`.

`useAuthStore`

- Persists only `isAuthenticated`.
- Used for fast client-side auth state awareness.

`useUserStore`

- Persists user identity, XP, level, streak, study days, inventory, achievements, completed lessons, and dirty lesson IDs.
- Uses IndexedDB through `idb-keyval`.
- Serializes/deserializes `Set` values manually.

`useSRSStore`

- Persists SRS card states and dirty SRS IDs.
- Handles add/remove/custom mnemonic, SRS progress updates, cloud/local merge, and reset.
- Exposes the store on `window.useSRSStore` so achievement checks can avoid a direct circular store import.

`useUIStore`

- Persists UI settings, notifications, reading display state, and listening tab state.
- Keeps ephemeral audio/listening session values out of persistence through `partialize`.
- Provides export/import for local progress backups.

Important store rule:

- ESLint warns on destructuring Zustand store results from `useUserStore`, `useSRSStore`, `useUIStore`, or `useAuthStore`.
- Use atomic selectors such as `useUserStore((s) => s.xp)`.

## Progress Sync Flow

The main sync loop is anchored in `ProgressProvider` and `useSyncProgress`.

1. `ProgressProvider` creates a browser Supabase client.
2. It reads the current session and subscribes to auth state changes.
3. It updates `useAuthStore` and `useUserStore` identity data.
4. `useSyncProgress` waits for mounted state and Zustand hydration.
5. `useCloudData` fetches `profiles`, `user_srs`, and `user_lessons` in parallel.
6. If local legacy guest data exists, `handleLegacyMigration` attempts to merge it into the cloud account once.
7. Cloud data is transformed into the local `UserProgress` shape.
8. `useSRSStore.mergeProgress` reconciles local/cloud SRS, lessons, study days, quest claims, inventory, achievements, XP, and streak.
9. Dirty local changes are debounced for 2000 ms.
10. `useCloudMutation` sends dirty SRS and lesson changes plus profile state to Supabase RPC `sync_user_progress`.
11. The RPC returns `accepted_xp`, which the client uses to align local XP with server anti-cheat limits.
12. Successful sync clears dirty IDs and broadcasts `SYNC_COMPLETE` through `BroadcastChannel`.
13. Other tabs invalidate the `user-progress` query when they receive the broadcast.

## Learning Logic

SRS:

- `src/lib/srs.ts` implements a modified SM-2 style algorithm.
- Grades 0-3 are used.
- Failed answers reduce interval/ease.
- Successful answers only grow interval if the card is due, with a 6-hour guard window.
- Intervals are capped at 3650 days and ease factor is clamped between 1.3 and 5.0.

Gamification:

- `src/lib/level.ts` calculates level from XP.
- `src/lib/gamification.ts` handles streak changes, streak freeze use, study-day merging, and local/cloud gamification merging.
- `src/lib/constants/gamification.ts` defines daily quests and achievements.
- Database RPC `sync_user_progress` limits accepted XP based on active SRS updates, lesson completions, daily bonus caps, and achievement bonuses.

TTS:

- `src/lib/tts.ts` maps speaker names to VOICEVOX-style voice IDs.
- `fetchTTSAudio()` checks CacheStorage, calls `/api/tts`, stores successful audio responses, and caps local cache entries.
- `speakWithWebSpeech()` provides browser fallback.

Furigana:

- Client/editor features call `/api/furigana` or `/api/admin/ai-assistant`.
- Kuroshiro runs on Node route handlers using the local Kuromoji dictionary.

## UI Organization

UI components are grouped by responsibility:

- `src/components/ui`: reusable primitives and low-level shared UI.
- `src/components/layout`: app chrome, sidebar, topbar, mobile nav, breadcrumbs, toasts.
- `src/components/providers`: app-level client providers.
- `src/components/features`: feature modules such as dashboard, courses, lessons, library, reading, listening, SRS, exams, tools, flashcards, games, support, feedback, onboarding, and gamification.

The project uses shadcn-style aliases from `components.json`:

- `@/components`
- `@/components/ui`
- `@/lib`
- `@/hooks`

## Build, Runtime, and Security Configuration

`next.config.ts`:

- `output: "standalone"`
- `poweredByHeader: false`
- `reactStrictMode: true`
- AVIF/WebP image formats
- remote image patterns for Supabase, Cloudinary, and Sanity CDN
- security headers on all routes
- long-term cache headers for `/fonts/:path*`
- `@react-pdf/renderer` transpilation
- server external packages for Kuroshiro, Kuromoji, msedge-tts, and websocket packages
- optimized imports for Lucide and Radix packages

`eslint.config.mjs`:

- Next recommended/core-web-vitals rules
- React hooks rules
- JSX a11y plugin
- warning for Zustand destructuring
- warning for `any`

`tsconfig.json`:

- strict TypeScript
- no emit
- bundler module resolution
- `@/*` path alias
- excludes `__tests__` from TS project include

## Environment Variables

Required by `/api/health`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SITE_URL`

Feature/server variables used by application code:

- `ADMIN_API_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `SANITY_API_READ_TOKEN`
- `SANITY_API_WRITE_TOKEN`
- `SAWERIA_WEBHOOK_SECRET`
- `TRAKTEER_WEBHOOK_SECRET`
- `SANITY_STUDIO_ADMIN_API_SECRET`

Script-only or optional AI gateway variables:

- `AI_BASE_URL`
- `AI_API_KEY`
- `AI_MODEL`

Do not expose service role keys or admin secrets through `NEXT_PUBLIC_*`.

## Scripts and Maintenance Utilities

Package scripts:

- `npm run dev`: start Next dev server.
- `npm run build`: build production app.
- `npm run start`: start production server after build.
- `npm run lint`: run ESLint.
- `npm run lint:fix`: run ESLint with fixes.
- `npm run test`: run Vitest once.
- `npm run test:watch`: run Vitest in watch mode.
- `npm run test:e2e`: run Playwright E2E.
- `npm run prepare`: install Husky hooks.

Repository scripts under `scripts/` support content/data operations such as:

- auditing and aligning Sanity lessons/dialogues
- generating/enriching lessons, grammar, kanji, examples, listening dialogues
- generating and cleaning VoiceVox/TTS cache data
- checking vocab/TTS storage
- mapping grammar order numbers
- slug cleanup

These scripts often require `.env.local`, Supabase service role access, Sanity write tokens, Gemini or AI gateway credentials, and sometimes local VoiceVox/audio prerequisites.

## Tests

Vitest tests live under `__tests__`:

- hooks: SRS hooks, cached audio, quiz/mock exam engines, flashcard master, heatmap, daily quests, writing canvas, add-to-SRS.
- libs: `utils`, `srs`, `level`.
- stores: `useSRSStore`, `useUserStore`.

Playwright E2E tests live under `e2e`:

- `auth.spec.ts`
- `dashboard.spec.ts`
- `navigation.spec.ts`
- `study.spec.ts`

`playwright.config.ts` starts `npm run dev` at `http://localhost:3000` and runs Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari projects.

## Known Architectural Boundaries

- Sanity content is editorial/static; Supabase remains the source for auth, progress, core lexical data, categories, supporters, and several operational/cache tables.
- Service-role Supabase access belongs only in server route handlers/actions/scripts.
- Offline-first state is local-first and later reconciled with Supabase.
- Destructive local deletes for SRS/lesson progress are represented by dirty deleted states before cloud sync removes rows.
- TTS audio is generated offline by scripts, not in `/api/tts`.
- The live database had drifted ahead of the earlier migration set. `20260609080000_sync_live_schema_drift.sql` captures `tts_cache`, `expressions`, `sentences`, `radicals`, the `tts-cache` bucket, user SRS uniqueness, auth-owned FK cleanup, and live editorial columns.

## Maintenance Checklist

When changing data architecture:

- Update Supabase migrations and this document together.
- Keep RLS policies aligned with table exposure.
- Keep `src/types/database.ts` in sync with SQL and real query shapes.
- If a Sanity schema changes, update GROQ queries in `src/lib/queries.ts`, server actions, and page clients.
- If sync payloads change, update `useCloudData`, `useCloudMutation`, `useSRSStore.mergeProgress`, and `sync_user_progress` together.
- If new Zustand fields are persisted and include non-JSON types, add serializer/deserializer handling.
- If new route handlers need admin access, use `validateAdminApiRequest` or a stronger server-only auth check.
