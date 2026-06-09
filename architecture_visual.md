# NihongoRoute Architecture Visuals

Audit snapshot: 2026-06-09

The diagrams below mirror the current codebase. They use Mermaid so they can be rendered by GitHub, many Markdown viewers, and documentation tools.

## System Context

```mermaid
flowchart LR
  User["Learner / browser"] --> Next["Next.js 16 App Router"]
  Editor["Content editor"] --> Studio["Embedded Sanity Studio /studio"]
  Studio --> AdminAPI["Admin bridge APIs"]

  Next --> SupabaseAuth["Supabase Auth"]
  Next --> SupabaseDB["Supabase Postgres"]
  Next --> SupabaseStorage["Supabase Storage"]
  Next --> Sanity["Sanity Content Lake"]

  AdminAPI --> SupabaseDB
  AdminAPI --> Gemini["Gemini API"]
  Studio --> Sanity

  Webhooks["Saweria / Trakteer"] --> WebhookRoutes["Payment webhook route handlers"]
  WebhookRoutes --> SupabaseDB
```

## Runtime Layers

```mermaid
flowchart TB
  subgraph App["src/app"]
    RootLayout["Root layout: metadata, theme, query, motion, toaster"]
    MainLayout["(main) layout: progress sync, nav shell, addons"]
    Pages["Pages and route groups"]
    Routes["Route handlers"]
    Metadata["robots, sitemap, manifest"]
  end

  subgraph UI["src/components"]
    Providers["providers"]
    Layout["layout chrome"]
    UIPrimitives["ui primitives"]
    Features["feature modules"]
  end

  subgraph Logic["src/lib + src/hooks + src/store + src/actions"]
    ServerActions["server actions"]
    Hooks["sync/data/media hooks"]
    Stores["Zustand stores"]
    Lib["Supabase, Sanity, SRS, gamification, TTS, utils"]
  end

  RootLayout --> MainLayout
  MainLayout --> Pages
  Pages --> Features
  Features --> UIPrimitives
  Features --> Hooks
  Hooks --> Stores
  Hooks --> Lib
  Pages --> ServerActions
  ServerActions --> Lib
  Routes --> Lib
```

## Data Source Split

```mermaid
flowchart LR
  subgraph Supabase["Supabase"]
    Auth["Auth"]
    PublicTables["course_categories, vocab, kanji, grammar, cheatsheets"]
    UserTables["profiles, user_srs, user_lessons"]
    Supporters["supporters"]
    OpsTables["tts_cache, expressions, sentences, radicals"]
    Storage["storage bucket: tts-cache"]
    RPC["sync_user_progress RPC"]
  end

  subgraph Sanity["Sanity CMS"]
    Lesson["lesson"]
    Reading["readingMaterial"]
    Listening["listeningMaterial"]
    MockExam["mockExam"]
  end

  subgraph NextApp["Next.js app"]
    Courses["courses pages"]
    Library["library pages"]
    Exams["exam pages"]
    Dashboard["dashboard"]
    Tools["tools/review/flashcards"]
    StudioBridge["admin bridge APIs"]
  end

  Courses --> PublicTables
  Courses --> Lesson
  Library --> PublicTables
  Library --> Reading
  Library --> Listening
  Exams --> MockExam
  Exams --> PublicTables
  Dashboard --> UserTables
  Dashboard --> PublicTables
  Tools --> PublicTables
  Tools --> UserTables
  Tools --> Storage
  Tools --> OpsTables
  StudioBridge --> PublicTables
  StudioBridge --> Sanity
  UserTables --> RPC
```

Note: `tts_cache`, `expressions`, `sentences`, `radicals`, and the `tts-cache` bucket exist in the live database and are captured by `supabase/migrations/20260609080000_sync_live_schema_drift.sql`.

## Request Flow for Normal Pages

```mermaid
sequenceDiagram
  participant Browser
  participant Proxy as src/proxy.ts
  participant Next as Next Page/Layout
  participant Action as Server Action
  participant Supabase
  participant Sanity

  Browser->>Proxy: Request page
  Proxy->>Supabase: refresh auth via getUser()
  Proxy-->>Browser: response cookies updated when needed
  Proxy->>Next: continue request
  Next->>Action: fetch page data
  par Structured/public/user data
    Action->>Supabase: select/rpc
  and Editorial content
    Action->>Sanity: GROQ fetch
  end
  Action-->>Next: normalized data
  Next-->>Browser: HTML/RSC payload
```

## Auth and Progress Sync

```mermaid
sequenceDiagram
  participant Browser
  participant ProgressProvider
  participant AuthStore
  participant UserStore
  participant SRSStore
  participant UIStore
  participant Query as TanStack Query
  participant Supabase

  Browser->>ProgressProvider: main layout mounts
  ProgressProvider->>Supabase: auth.getSession()
  Supabase-->>ProgressProvider: session or null
  ProgressProvider->>AuthStore: setAuth()
  ProgressProvider->>UserStore: syncUserData()
  ProgressProvider->>Query: useSyncProgress()
  Query->>Supabase: fetch profiles + user_srs + user_lessons
  Supabase-->>Query: cloud progress
  Query->>SRSStore: mergeProgress(cloudData)
  SRSStore->>UserStore: setGamification() and dirty lessons
  SRSStore->>UIStore: sync settings flags
  Browser->>SRSStore: user reviews/adds/removes cards
  SRSStore->>UserStore: update XP, streak, study days
  Query->>Supabase: debounced rpc sync_user_progress
  Supabase-->>Query: accepted_xp
  Query->>SRSStore: clear dirty SRS IDs
  Query->>UserStore: clear dirty lesson IDs, align XP
```

## Zustand Store Responsibilities

```mermaid
flowchart TB
  subgraph IndexedDB["IndexedDB via idb-keyval"]
    AuthPersist["nihongoroute_auth_data"]
    UserPersist["nihongoroute_user_data"]
    SRSPersist["nihongoroute_srs_data"]
    UIPersist["nihongoroute_ui_data"]
  end

  AuthStore["useAuthStore\nisAuthenticated"] --> AuthPersist
  UserStore["useUserStore\nidentity, XP, level, streak,\nstudy days, inventory,\nachievements, lessons"] --> UserPersist
  SRSStore["useSRSStore\nSRS cards, dirtySrs,\ncustom mnemonics"] --> SRSPersist
  UIStore["useUIStore\nnotifications, settings,\nreading/listening UI"] --> UIPersist

  SRSStore --> UserStore
  UserStore --> UIStore
  SRSStore --> UIStore
```

## Supabase Sync RPC Shape

```mermaid
flowchart LR
  Client["useCloudMutation"] --> Payload["progress + dirtySrs + dirtyLessons"]
  Payload --> RPC["public.sync_user_progress"]
  RPC --> Profile["profiles"]
  RPC --> SRS["user_srs"]
  RPC --> Lessons["user_lessons"]
  RPC --> AntiCheat["XP validation:\nSRS count, lesson count,\ndaily bonus cap,\nachievement bonus"]
  AntiCheat --> Result["{ success, accepted_xp }"]
  Result --> Client
```

## API Route Handlers

```mermaid
flowchart TB
  Health["/api/health"] --> Env["env readiness report"]
  Cards["/api/cards"] --> CardDB["vocab + kanji"]
  Furigana["/api/furigana"] --> Kuroshiro["Kuroshiro + Kuromoji"]
  TTS["/api/tts"] --> TTSDB["tts_cache"]
  TTS --> TTSStorage["Supabase Storage tts-cache"]
  AdminSearch["/api/admin/supabase-search"] --> AdminAuth["ADMIN_API_SECRET"]
  AdminAI["/api/admin/ai-assistant"] --> AdminAuth
  AdminAI --> Kuroshiro
  AdminAI --> Gemini["Gemini API"]
  AdminAI --> AdminDB["Supabase service role"]
  Saweria["/api/webhooks/saweria"] --> Supporters["supporters"]
  Trakteer["/api/webhooks/trakteer"] --> Supporters
  Callback["/auth/callback"] --> Session["exchange code for Supabase session"]
```

## Quality And Operations Gate

```mermaid
flowchart LR
  PR["Push / pull request"] --> CI[".github/workflows/quality.yml"]
  CI --> Install["npm ci"]
  Install --> Typecheck["npm run typecheck"]
  Typecheck --> Lint["npm run lint"]
  Lint --> Unit["npm run test:unit"]
  Unit --> Build["npm run build"]
  CI --> Migrations["npm run db:migrations:check"]
  Migrations --> SupabaseCLI["supabase/setup-cli@v2"]
  Runtime["Production runtime"] --> Health["/api/health"]
  Health --> Ops["docs/operations-runbook.md"]
  Security["SECURITY.md"] --> AdminAuth["Bearer/header admin secret only"]
```

## Sanity Studio Bridge

```mermaid
flowchart LR
  Studio["Sanity Studio /studio"] --> Schema["lesson, readingMaterial,\nlisteningMaterial, mockExam"]
  Schema --> Inputs["custom inputs"]
  Inputs --> Selector["SupabaseSelector"]
  Inputs --> Category["SupabaseCategorySelect"]
  Inputs --> FuriganaInput["FuriganaGeneratorInput"]
  Inputs --> Assistant["AIAssistantBar"]
  Selector --> SearchAPI["/api/admin/supabase-search"]
  Category --> SearchAPI
  FuriganaInput --> AIAPI["/api/admin/ai-assistant"]
  Assistant --> AIAPI
  SearchAPI --> Supabase["Supabase service role"]
  AIAPI --> Supabase
  AIAPI --> Gemini["Gemini API"]
```

## Content Delivery by Feature

```mermaid
flowchart TB
  Dashboard["Dashboard"] --> Expressions["expressions"]
  Dashboard --> UserProgress["profiles/user_srs/user_lessons"]
  Courses["Courses"] --> Categories["course_categories"]
  Courses --> Lessons["Sanity lesson"]
  LibraryVocab["Library vocab"] --> Vocab["vocab"]
  LibraryKanji["Library kanji"] --> Kanji["kanji"]
  LibraryGrammar["Library grammar"] --> Grammar["grammar"]
  LibraryReading["Library reading"] --> Reading["Sanity readingMaterial"]
  LibraryListening["Library listening"] --> Listening["Sanity listeningMaterial"]
  Exams["Exams"] --> MockExam["Sanity mockExam"]
  Review["Review/SRS"] --> UserSRS["user_srs + local SRS store"]
  Support["Support"] --> Supporters["supporters"]
```

## Test Coverage Map

```mermaid
flowchart LR
  Vitest["Vitest"] --> LibTests["lib: utils, srs, level"]
  Vitest --> StoreTests["store: useUserStore, useSRSStore"]
  Vitest --> HookTests["hooks and feature engines"]
  Playwright["Playwright"] --> Auth["auth.spec.ts"]
  Playwright --> Dashboard["dashboard.spec.ts"]
  Playwright --> Navigation["navigation.spec.ts"]
  Playwright --> Study["study.spec.ts"]
```

## Deployment Shape

```mermaid
flowchart TB
  Build["npm run build"] --> NextBuild["Next standalone output"]
  NextBuild --> Server["npm run start / hosted Node runtime"]
  Server --> Headers["security headers from next.config.ts"]
  Server --> Images["Next image optimization\nSupabase, Cloudinary, Sanity CDN"]
  Server --> Fonts["/fonts immutable cache"]
  Server --> Analytics["Vercel Analytics + Speed Insights\nproduction VERCEL=1 only"]
```
