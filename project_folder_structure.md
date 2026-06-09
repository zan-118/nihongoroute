# NihongoRoute Project Folder Structure

Audit snapshot: 2026-06-09

This document maps the repository as it exists now. It focuses on source code, configuration, data schema, tests, and maintenance scripts. Generated directories such as `.next`, `node_modules`, and `dist` are intentionally called out but not expanded.

## Top-Level Layout

```text
nihongoroute/
|-- .agents/                    Local agent skills used by this workspace.
|-- .antigravitycli/             Local CLI/tooling state.
|-- .claude/                     Local assistant/tooling state.
|-- .continue/                   Local assistant/tooling state.
|-- .git/                        Git repository metadata.
|-- .husky/                      Husky hook installation target.
|-- .kiro/                       Local assistant/tooling state.
|-- .next/                       Generated Next.js build/dev output.
|-- .sanity/                     Generated/local Sanity state.
|-- .tmp-ui-screens/             Temporary UI screenshots.
|-- .vscode/                     Workspace editor settings.
|-- dist/                        Generated distribution/output directory.
|-- e2e/                         Playwright end-to-end tests.
|-- node_modules/                Installed npm dependencies.
|-- public/                      Static public assets and fonts.
|-- sanity/                      Sanity schema and custom Studio components.
|-- scratch/                     Temporary/local scratch work.
|-- scripts/                     Data/content/TTS maintenance scripts.
|-- src/                         Main Next.js application source.
|-- supabase/                    Supabase SQL migrations.
|-- __tests__/                   Vitest unit/component/hook tests.
|-- .env.local                   Local environment values; do not commit.
|-- .gitignore                   Git ignore rules.
|-- ARCHITECTURE.md              Current architecture documentation.
|-- architecture_visual.md       Mermaid architecture diagrams.
|-- components.json              shadcn-style component alias/config.
|-- eslint.config.mjs            ESLint flat config.
|-- next-env.d.ts                Next.js TypeScript declarations.
|-- next.config.ts               Next.js runtime/build/security config.
|-- package-lock.json            npm lockfile.
|-- package.json                 Project dependencies and scripts.
|-- playwright.config.ts         Playwright configuration.
|-- postcss.config.js            PostCSS configuration.
|-- project_folder_structure.md  This file.
|-- README.md                    Project overview and setup guide.
|-- sanity.cli.ts                Sanity CLI deployment config.
|-- sanity.config.ts             Embedded Sanity Studio config.
|-- schema.json                  Generated/exported schema artifact.
|-- skills-lock.json             Agent skill lock metadata.
|-- tailwind.config.js           Tailwind theme/content config.
|-- tsconfig.json                TypeScript config.
|-- tsconfig.tsbuildinfo         TypeScript incremental build cache.
|-- vitest.config.ts             Vitest configuration.
```

## Application Source

```text
src/
|-- actions/       Server Actions for library, courses, exams, lessons, and content lookups.
|-- app/           Next.js App Router routes, layouts, metadata routes, and API handlers.
|-- components/    Providers, layout shell, UI primitives, and feature components.
|-- hooks/         Cross-feature client hooks for cloud sync, hydration, and cached audio.
|-- lib/           Supabase/Sanity clients, SRS, gamification, TTS, utilities, constants.
|-- proxy.ts       Next.js proxy entry for Supabase session refresh.
|-- store/         Zustand offline-first stores persisted to IndexedDB.
|-- types/         Shared database/library TypeScript types.
```

## App Router

`src/app` contains the public app shell, main application route group, embedded Studio route, API routes, and metadata routes.

```text
src/app/
|-- (main)/
|   |-- courses/
|   |   |-- page.tsx
|   |   |-- CoursesClient.tsx
|   |   |-- [categoryId]/
|   |   |   |-- page.tsx
|   |   |   |-- CourseCategoryClient.tsx
|   |   |   |-- [slug]/
|   |   |   |   |-- page.tsx
|   |   |   |   |-- loading.tsx
|   |   |   |   |-- error.tsx
|   |-- dashboard/
|   |   |-- page.tsx
|   |   |-- DashboardClient.tsx
|   |   |-- loading.tsx
|   |-- exams/
|   |   |-- page.tsx
|   |   |-- ExamsClient.tsx
|   |   |-- [id]/
|   |   |   |-- page.tsx
|   |   |   |-- error.tsx
|   |-- library/
|   |   |-- page.tsx
|   |   |-- vocab/
|   |   |   |-- page.tsx
|   |   |   |-- VocabClient.tsx
|   |   |   |-- [id]/page.tsx
|   |   |-- kanji/
|   |   |   |-- page.tsx
|   |   |   |-- KanjiListClient.tsx
|   |   |   |-- [id]/page.tsx
|   |   |-- grammar/
|   |   |   |-- page.tsx
|   |   |   |-- GrammarClient.tsx
|   |   |   |-- [slug]/
|   |   |   |   |-- page.tsx
|   |   |   |   |-- loading.tsx
|   |   |   |   |-- error.tsx
|   |   |-- reading/
|   |   |   |-- page.tsx
|   |   |   |-- ReadingListClient.tsx
|   |   |   |-- [slug]/
|   |   |   |   |-- page.tsx
|   |   |   |   |-- ReadingPageClient.tsx
|   |   |-- listening/
|   |   |   |-- page.tsx
|   |   |   |-- ListeningListClient.tsx
|   |   |   |-- [slug]/
|   |   |   |   |-- page.tsx
|   |   |   |   |-- ListeningPageClient.tsx
|   |   |-- cheatsheet/
|   |   |   |-- page.tsx
|   |   |   |-- CheatsheetClient.tsx
|   |   |   |-- [id]/
|   |   |   |   |-- page.tsx
|   |   |   |   |-- CheatsheetTable.tsx
|   |-- review/
|   |   |-- page.tsx
|   |   |-- ReviewClient.tsx
|   |-- settings/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- _components/
|   |-- share/
|   |   |-- page.tsx
|   |   |-- ShareClient.tsx
|   |-- social/
|   |   |-- page.tsx
|   |   |-- LeaderboardClient.tsx
|   |-- support/
|   |   |-- page.tsx
|   |   |-- SupportClient.tsx
|   |-- tools/
|   |   |-- layout.tsx
|   |   |-- page.tsx
|   |   |-- flashcards/page.tsx
|   |   |-- kana/page.tsx
|   |   |-- survival/page.tsx
|   |   |-- writing/page.tsx
|   |-- layout.tsx
|   |-- loading.tsx
|   |-- error.tsx
|   |-- not-found.tsx
|-- api/
|   |-- admin/
|   |   |-- ai-assistant/route.ts
|   |   |-- supabase-search/route.ts
|   |-- cards/route.ts
|   |-- furigana/route.ts
|   |-- health/route.ts
|   |-- tts/route.ts
|   |-- webhooks/
|   |   |-- saweria/route.ts
|   |   |-- trakteer/route.ts
|-- auth/callback/route.ts
|-- forgot-password/
|-- login/
|-- onboarding/
|-- privacy/
|-- studio/[[...tool]]/
|-- terms/
|-- update-password/
|-- error.tsx
|-- globals.css
|-- icon.png
|-- icon-1024.png
|-- layout.tsx
|-- loading.tsx
|-- manifest.ts
|-- not-found.tsx
|-- page.tsx
|-- robots.ts
|-- sitemap.ts
```

## Server Actions

```text
src/actions/
|-- cheatsheets.actions.ts          Supabase cheatsheet list/detail.
|-- exams.actions.ts                Split-source course/exam reads from Supabase and Sanity.
|-- expressions.actions.ts          Random expression from Supabase `expressions`.
|-- flashcard.actions.ts            Flashcard pools from Supabase vocab/kanji.
|-- grammar.actions.ts              Grammar pagination/random/list.
|-- kanji.actions.ts                Kanji pagination/search/filter.
|-- lessons.actions.ts              Course categories from Supabase plus Sanity lessons.
|-- library.actions.ts              Barrel export for library actions and types.
|-- library.counts.actions.ts       Counts across Supabase and Sanity.
|-- library.detail.actions.ts       Detail and related-content resolution.
|-- listening.actions.ts            Sanity listening pagination/random task.
|-- reading.actions.ts              Sanity reading pagination.
|-- vocab.actions.ts                Vocab pagination/search/filter.
```

## Components

```text
src/components/
|-- features/
|   |-- course/                     Course category, lesson grid/cards, mock exams.
|   |-- dashboard/                  Dashboard hero, stats, tabs, quests, heatmap, panels.
|   |-- exams/                      Quiz and mock exam engines.
|   |-- feedback/                   Feedback widget and hook.
|   |-- flashcards/                 Flashcard setup, cards, master mode.
|   |-- games/                      Survival mode game.
|   |-- gamification/               XP pop, overlays, achievements, streak cards.
|   |-- global/                     Floating actions and smart text.
|   |-- grammar/                    Grammar list/detail/search UI.
|   |-- kanji/                      Kanji stroke order/detail components and hooks.
|   |-- landing/                    Landing page sections.
|   |-- lessons/                    Lesson renderer, sections, navigation, completion.
|   |-- library/                    Library category cards, vocab, kanji UI.
|   |-- listening/                  Listening page, karaoke, quiz, sidebar, hooks/types.
|   |-- notifications/              Reminder and notification managers.
|   |-- onboarding/                 Onboarding wizard/tour.
|   |-- pdf/                        PDF generator, templates, download button.
|   |-- reading/                    Reading page article, nav, audio, word popover.
|   |-- review/                     Review mode cards, completion state, review hook.
|   |-- srs/                        SRS buttons, review engine, analytics, stats, mnemonic.
|   |-- tools/                      Kana, writing canvas, TTS, search, dictionary, kanji tools.
|   |-- user/                       Auth/settings/profile/user navigation.
|-- layout/
|   |-- AchievementToast.tsx
|   |-- AppBreadcrumbs.tsx
|   |-- MobileNav.tsx
|   |-- NavWrapper.tsx
|   |-- Sidebar.tsx
|   |-- ThemeToggle.tsx
|   |-- Topbar.tsx
|   |-- hooks/
|   |-- sidebar/
|-- providers/
|   |-- AppClientAddons.tsx
|   |-- ProgressProvider.tsx
|   |-- QueryProvider.tsx
|   |-- ThemeProvider.tsx
|-- ui/
|   |-- AnimatedCounter.tsx
|   |-- ConfirmModal.tsx
|   |-- EmptyState.tsx
|   |-- FuriganaDisplay.tsx
|   |-- FuriganaInput.tsx
|   |-- OfflineAudio.tsx
|   |-- Pagination.tsx
|   |-- SanityMedia.tsx
|   |-- SmartJapanese.tsx
|   |-- badge.tsx
|   |-- button.tsx
|   |-- card.tsx
|   |-- dialog.tsx
|   |-- dropdown-menu.tsx
|   |-- input.tsx
|   |-- label.tsx
|   |-- progress.tsx
|   |-- select.tsx
|   |-- skeleton.tsx
|   |-- switch.tsx
|   |-- useFurigana.ts
```

## Hooks, Stores, Libs, and Types

```text
src/hooks/
|-- useCachedAudio.ts       Cache-aware client audio helper.
|-- useCloudData.ts         Fetch and merge Supabase progress.
|-- useCloudMutation.ts     Debounced dirty-state sync mutation.
|-- useHasMounted.ts        Mount guard.
|-- useStoreHydration.ts    Zustand persistence hydration guard.
|-- useSyncProgress.ts      Main progress sync orchestrator.

src/store/
|-- types.ts                Progress, inventory, settings, notification types.
|-- useAuthStore.ts         Persisted auth state.
|-- useSRSStore.ts          Persisted SRS cards and dirty state.
|-- useUIStore.ts           Persisted UI settings/notifications/session preferences.
|-- useUserStore.ts         Persisted profile, gamification, achievements, lessons.

src/lib/
|-- admin-api-auth.ts       Constant-time admin secret validation.
|-- audio.ts                Client sound effects engine.
|-- gamification.ts         Streak, quest, achievement merge helpers.
|-- level.ts                XP/level math.
|-- queries.ts              Sanity GROQ queries.
|-- routes.ts               Route constants and breadcrumb labels.
|-- sanity.client.ts        Sanity client and image URL builder.
|-- sanitize.ts             HTML sanitizer.
|-- srs.ts                  SRS algorithm.
|-- tts.ts                  TTS voice mapping, cache fetch, Web Speech fallback.
|-- utils.ts                Shared utilities.
|-- constants/
|   |-- gamification.ts     Daily quest and achievement definitions.
|-- supabase/
|   |-- admin.ts            Service-role server client.
|   |-- client.ts           Browser client.
|   |-- middleware.ts       Proxy session refresh.
|   |-- server.ts           Cookie-aware server/static clients.
|   |-- sync.ts             Local/cloud progress migration helpers.
|-- utils/
|   |-- lesson-utils.ts     Lesson formatting/navigation helpers.

src/types/
|-- database.ts             Supabase/content TypeScript interfaces.
|-- library.ts              Library response/item interfaces.
```

## Sanity

```text
sanity/
|-- components/
|   |-- AIAssistantBar.tsx
|   |-- FuriganaGeneratorInput.tsx
|   |-- SupabaseCategorySelect.tsx
|   |-- SupabaseSelector.tsx
|   |-- api.ts
|-- schemaTypes/
|   |-- index.ts
|   |-- lesson.ts
|   |-- listeningMaterial.ts
|   |-- mockExam.ts
|   |-- readingMaterial.ts

sanity.config.ts              Embedded Studio config at `/studio`.
sanity.cli.ts                 Sanity CLI project/dataset/deployment config.
```

Current Sanity document types:

- `lesson`
- `readingMaterial`
- `listeningMaterial`
- `mockExam`

The custom Studio components call app API routes for Supabase search, category selection, furigana generation, and AI lesson assistance.

## Supabase

```text
supabase/
|-- migrations/
|   |-- 20260517000000_initial_schema.sql
|   |-- 20260520183000_db_performance_security_optimization.sql
|   |-- 20260521000000_add_custom_mnemonic.sql
|   |-- 20260521001000_fix_sync_user_progress_return_xp.sql
|   |-- 20260527033500_add_achievements_xp_to_sync_user_progress.sql
|   |-- 20260527041500_create_supporters_table.sql
|   |-- 20260604000000_add_order_number_to_grammar.sql
|   |-- 20260604001000_add_order_number_to_n3_grammar.sql
|   |-- 20260604002000_add_order_number_to_n2_grammar.sql
|   |-- 20260604003000_add_order_number_to_n1_grammar.sql
|   |-- 20260609080000_sync_live_schema_drift.sql
```

Declared tables in migrations:

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
- `tts_cache`
- `expressions`
- `sentences`
- `radicals`
- storage bucket `tts-cache`

## Public Assets

```text
public/
|-- file.svg
|-- globe.svg
|-- logo-branding.png
|-- logo-branding.svg
|-- next.svg
|-- opengraph-image-mobile.jpeg
|-- opengraph-image.png
|-- vercel.svg
|-- window.svg
|-- fonts/
|   |-- NotoSansJP-Bold.ttf
|   |-- NotoSansJP-Regular.ttf
```

`next.config.ts` adds immutable cache headers for `/fonts/:path*`.

## Tests

```text
__tests__/
|-- setup.ts
|-- hooks/
|   |-- useAddToSRS.test.tsx
|   |-- useCachedAudio.test.tsx
|   |-- useDailyQuests.test.tsx
|   |-- useFlashcardMaster.test.tsx
|   |-- useHeatmap.test.ts
|   |-- useMockExamEngine.test.tsx
|   |-- useQuizEngine.test.tsx
|   |-- useSRSHooks.test.tsx
|   |-- useWritingCanvas.test.tsx
|-- lib/
|   |-- level.test.ts
|   |-- srs.test.ts
|   |-- utils.test.ts
|-- store/
|   |-- useSRSStore.test.ts
|   |-- useUserStore.test.ts

e2e/
|-- auth.spec.ts
|-- dashboard.spec.ts
|-- navigation.spec.ts
|-- study.spec.ts
```

`vitest.config.ts` uses `jsdom`, global test APIs, and `__tests__/setup.ts`.

`playwright.config.ts` uses `http://localhost:3000`, starts `npm run dev`, and defines Chromium, Firefox, WebKit, Mobile Chrome, and Mobile Safari projects.

## Scripts

```text
scripts/
|-- _audit_speakers.js
|-- align_sanity_lessons.js
|-- audit_dialogs.js
|-- audit_lesson_titles.js
|-- check_n5.js
|-- check_n5_storage.js
|-- check_tts_cache.js
|-- check_voicevox_speakers.js
|-- clean_tts_cache.js
|-- cleanup_non_vocab_tts.js
|-- cleanup_vocab_cache.js
|-- count_vocab.js
|-- debug_word.js
|-- design_n1_syllabus.js
|-- design_n2_syllabus.js
|-- design_n3_syllabus.js
|-- design_n4_syllabus.js
|-- dump_dialogues.js
|-- dump_messy_blocks.js
|-- enrich_grammar.js
|-- enrich_kanji.js
|-- enrich_lesson_content.js
|-- enrich_lessons.js
|-- enrich_listening_dialogues.js
|-- fix_grammar_slugs.js
|-- generate_example_sentences.js
|-- generate_new_lessons.js
|-- generate_new_lessons_n1.js
|-- generate_new_lessons_n2.js
|-- generate_new_lessons_n3.js
|-- generate_sanity_dialogs.js
|-- generate_voicevox.js
|-- get_sanity_history.js
|-- history_bab16.json
|-- map_n1_grammar_order.js
|-- map_n2_grammar_order.js
|-- map_n3_grammar_order.js
|-- migrate_sanity_speakers.js
|-- sanitize_slugs.js
|-- search_whisper.js
|-- test_query.js
```

Most scripts are operational tools for content generation, content cleanup, Sanity/Supabase alignment, TTS cache maintenance, and JLPT syllabus/data work. Many require `.env.local`, Supabase service role access, Sanity write tokens, Gemini or AI gateway credentials, and sometimes local VoiceVox output.

## Configuration Files

```text
package.json              npm scripts, dependencies, overrides, lint-staged.
package-lock.json         Locked dependency graph.
next.config.ts            Standalone build, security headers, images, external packages.
tsconfig.json             Strict TS, Next plugin, bundler resolution, @ alias.
eslint.config.mjs         Next, hooks, a11y, TS linting, Zustand destructuring warning.
tailwind.config.js        Tailwind content, CSS variable theme, fonts, animation plugin.
postcss.config.js         PostCSS/Tailwind pipeline.
components.json           shadcn aliases and style config.
vitest.config.ts          Unit test config.
playwright.config.ts      E2E browser test config.
sanity.config.ts          Sanity Studio config.
sanity.cli.ts             Sanity CLI/deploy config.
```

## Generated or Local-Only Directories

These directories are present locally but are not primary source-of-truth documentation targets:

- `.next/`: Next.js generated output.
- `node_modules/`: installed dependencies.
- `dist/`: generated output.
- `.sanity/`: Sanity local/generated metadata.
- `.tmp-ui-screens/`: temporary screenshots.
- `scratch/`: scratch/local work.
- `.agents/`, `.antigravitycli/`, `.claude/`, `.continue/`, `.kiro/`: local assistant/tooling state.

## Naming and Organization Conventions

- App routes live under `src/app`.
- Server actions live under `src/actions` and generally use the `*.actions.ts` suffix.
- Shared business logic belongs in `src/lib`.
- Client hooks belong in `src/hooks` or a feature-local `hooks/` directory.
- Feature UI belongs under `src/components/features/<feature>`.
- Reusable UI primitives belong under `src/components/ui`.
- Zustand stores are named `useXStore.ts`.
- Sanity schemas are centralized through `sanity/schemaTypes/index.ts`.
- Supabase schema changes should be represented in `supabase/migrations`.
