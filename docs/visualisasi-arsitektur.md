# Visualisasi Arsitektur NihongoRoute
**Snapshot Audit: Juni 2026**

Diagram di bawah ini menggambarkan arsitektur sistem NihongoRoute saat ini. Diagram dibuat menggunakan format Mermaid agar dapat dirender oleh GitHub secara otomatis, serta didukung oleh editor Markdown standar.

---

## 1. Konteks Sistem (System Context)

```mermaid
flowchart LR
    User["Pelajar / Peramban"] --> Next["Next.js 16 App Router"]
    Editor["Penyunting Konten"] --> Studio["Sanity Studio Tertanam /studio"]
    Studio --> AdminAPI["API Jembatan Admin"]

    Next --> SupabaseAuth["Supabase Auth"]
    Next --> SupabaseDB["Supabase Postgres"]
    Next --> SupabaseStorage["Supabase Storage"]
    Next --> Sanity["Sanity Content Lake"]

    AdminAPI --> SupabaseDB
    AdminAPI --> Gemini["Gemini API"]
    Studio --> Sanity

    Webhooks["Saweria / Trakteer"] --> WebhookRoutes["Route Webhook Donasi"]
    WebhookRoutes --> SupabaseDB
```

---

## 2. Lapisan Runtime (Runtime Layers)

```mermaid
flowchart TB
    subgraph App["src/app"]
        RootLayout["Root layout: metadata, tema, query, motion, toaster"]
        MainLayout["(main) layout: sync progress, shell nav, addons"]
        Pages["Halaman dan grup rute"]
        Routes["API Route Handlers"]
        Metadata["robots, sitemap, manifest"]
    end

    subgraph UI["src/components"]
        Providers["Providers"]
        Layout["Layout chrome"]
        UIPrimitives["UI Primitives"]
        Features["Feature Modules"]
    end

    subgraph Logic["src/lib + src/hooks + src/store + src/actions"]
        ServerActions["Server Actions"]
        Hooks["Hooks sync/data/media"]
        Stores["Zustand Stores"]
        Lib["Supabase, Sanity, SRS, gamifikasi, TTS, utils"]
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

---

## 3. Pembagian Sumber Data (Data Source Split)

```mermaid
flowchart LR
    subgraph Supabase["Supabase"]
        Auth["Auth"]
        PublicTables["course_categories, vocab, kanji, grammar, cheatsheets, lessons"]
        UserTables["profiles, user_srs, user_lessons"]
        ExamBank["jlpt_exam_templates, jlpt_passages,\njlpt_questions, jlpt_exam_template_questions"]
        ExamProgress["user_exam_sessions, user_exam_answers"]
        Community["community_posts, community_comments"]
        Supporters["supporters"]
        OpsTables["tts_cache, expressions, sentences, radicals"]
        Storage["storage: tts-cache, exam-assets"]
        RPC["sync_user_progress RPC"]
    end

    subgraph Sanity["Sanity CMS"]
        Lesson["lesson"]
        Reading["readingMaterial"]
        Listening["listeningMaterial"]
        MockExam["mockExam"]
    end

    subgraph NextApp["Aplikasi Next.js"]
        Courses["halaman kelas/courses"]
        Library["halaman perpustakaan"]
        Exams["halaman ujian"]
        Dashboard["halaman dasbor"]
        Tools["halaman tools/ulasan/flashcard"]
        Social["halaman komunitas/leaderboard"]
        StudioBridge["API jembatan admin"]
    end

    Courses --> PublicTables
    Courses --> Lesson
    Library --> PublicTables
    Library --> Reading
    Library --> Listening
    Exams --> ExamBank
    Exams --> ExamProgress
    Dashboard --> UserTables
    Dashboard --> PublicTables
    Tools --> PublicTables
    Tools --> UserTables
    Tools --> Storage
    Tools --> OpsTables
    Social --> Community
    Social --> UserTables
    StudioBridge --> PublicTables
    StudioBridge --> Sanity
    UserTables --> RPC
```

---

## 4. Aliran Permintaan Halaman (Request Flow)

```mermaid
sequenceDiagram
    participant Browser as Peramban Klien
    participant Proxy as Proxy src/proxy.ts
    participant Next as Next Page/Layout
    participant Action as Server Action
    participant Supabase as Supabase DB
    participant Sanity as Sanity CMS

    Browser->>Proxy: Minta halaman
    Proxy->>Supabase: refresh auth via getUser()
    Proxy-->>Browser: kembalikan cookie sesi terbarui
    Proxy->>Next: teruskan permintaan
    Next->>Action: ambil data halaman
    par Data Terstruktur / Progres / Kamus
        Action->>Supabase: select / panggil rpc
    and Konten Editorial Pembelajaran
        Action->>Sanity: kueri GROQ
    end
    Action-->>Next: kembalikan data ternormalisasi
    Next-->>Browser: render halaman HTML / RSC payload
```

---

## 5. Sinkronisasi Autentikasi & Progres Luring

```mermaid
sequenceDiagram
    participant Browser as Peramban Klien
    participant ProgressProvider as ProgressProvider Shell
    participant AuthStore as Zustand AuthStore
    participant UserStore as Zustand UserStore
    participant SRSStore as Zustand SRSStore
    participant UIStore as Zustand UIStore
    participant Query as TanStack Query
    participant Supabase as Supabase DB

    Browser->>ProgressProvider: main layout dipasang (mount)
    ProgressProvider->>Supabase: auth.getSession()
    Supabase-->>ProgressProvider: kembalikan sesi pengguna
    ProgressProvider->>AuthStore: setAuth(isAuthenticated)
    ProgressProvider->>UserStore: syncUserData()
    ProgressProvider->>Query: useSyncProgress()
    Query->>Supabase: fetch profil + user_srs + user_lessons
    Supabase-->>Query: kembalikan data awan (cloudData)
    Query->>SRSStore: mergeProgress(cloudData)
    SRSStore->>UserStore: setGamification() & tandai dirty lessons
    SRSStore->>UIStore: sinkronisasi preferensi notifikasi
    Browser->>SRSStore: user mengulas kartu / mengubah mnemonik
    SRSStore->>UserStore: tambah XP, perbarui streak, log studyDays
    Query->>Supabase: kirim debounced RPC sync_user_progress
    Supabase-->>Query: kembalikan accepted_xp (hasil anti-cheat)
    Query->>SRSStore: hapus status dirty pada kartu SRS lokal
    Query->>UserStore: hapus status dirty pada pelajaran, selaraskan XP
```

---

## 6. Pembagian Zustand Stores Lokal

```mermaid
flowchart TB
    subgraph IndexedDB["IndexedDB via idb-keyval"]
        AuthPersist["nihongoroute_auth_data"]
        UserPersist["nihongoroute_user_data"]
        SRSPersist["nihongoroute_srs_data"]
        UIPersist["nihongoroute_ui_data"]
    end

    AuthStore["useAuthStore\nisAuthenticated"] --> AuthPersist
    UserStore["useUserStore\nfull_name, XP, level, streak,\nstudyDays log, inventory,\nachievements, completedLessons"] --> UserPersist
    SRSStore["useSRSStore\nSRS cards, dirtySrs,\ncustom mnemonics"] --> SRSPersist
    UIStore["useUIStore\nnotifications, settings,\nreading/listening UI preferences"] --> UIPersist

    SRSStore --> UserStore
    UserStore --> UIStore
    SRSStore --> UIStore
```

---

## 7. Skema Integrasi RPC Database

```mermaid
flowchart LR
    Client["useCloudMutation"] --> Payload["progress + dirtySrs + dirtyLessons"]
    Payload --> RPC["public.sync_user_progress"]
    RPC --> Profile["profiles"]
    RPC --> SRS["user_srs"]
    RPC --> Lessons["user_lessons"]
    RPC --> AntiCheat["Evaluasi XP:\njumlah kartu SRS, jumlah pelajaran,\nbatas bonus harian, bonus lencana"]
    AntiCheat --> Result["{ success, accepted_xp }"]
    Result --> Client
```
