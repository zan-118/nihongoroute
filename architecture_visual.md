# 🌀 Peta Visual Arsitektur Sistem NihongoRoute
Representasi Aliran Data, Sinkronisasi 3-Tingkat, dan Pipeline Rendering Visual

Dokumen ini menyajikan pemetaan visual arsitektur NihongoRoute menggunakan diagram Mermaid untuk menggambarkan interaksi antar-lapisan, protokol sinkronisasi luring-pertama (*offline-first*), serta pipeline rendering visual interaktif.

---

## 💎 1. Arsitektur Umum & Alur Data Split-Source

NihongoRoute memisahkan dengan tegas konten editorial statis (dikelola via CMS) dari kemajuan belajar pengguna dan basis data kamus terstruktur (Supabase).

```mermaid
graph TD
    %% Subgraphs
    subgraph CMS ["Content Management (Static/Editorial)"]
        Sanity["Sanity CMS CDN<br/>(Lessons, Reading, Listening, MockExams)"]
    end

    subgraph Server ["Next.js Server Side (RSC)"]
        Queries["GROQ Query Engine<br/>(src/lib/queries.ts)"]
        Actions["Server Actions<br/>(src/actions/*)"]
    end

    subgraph CloudDB ["Cloud Persistence (Dynamic/Transactional)"]
        Supabase["Supabase Cloud Database<br/>(Kanji, Vocab, Grammar, Profiles, SRS)"]
    end

    subgraph Client ["Client Side Browser (Offline-First)"]
        UI["Interactive UI Components<br/>(Latency &lt; 16ms)"]
        Zustand["Zustand State Stores<br/>(useUserStore, useSRSStore)"]
        RQ["React Query Hooks<br/>(useCloudData & useCloudMutation)"]
        IDB["IndexedDB Storage<br/>(Persist via idb-keyval)"]
    end

    %% Relations
    Sanity -->|Asset Coalesce Expansion| Queries
    Queries -->|Promise.all Parallel Fetch| Actions
    Supabase -->|Secure Row Level Security| Actions
    Actions -->|Initial Hydration| RQ
    RQ -->|Local Hydrate & Merge| Zustand
    Zustand <-->|Fast Reactive Selectors| UI
    Zustand <-->|Async Local Storage| IDB

    %% Visual Themes
    classDef sanity fill:#f03e3e,stroke:#333,stroke-width:2px,color:#fff;
    classDef supabase fill:#3ecf8e,stroke:#333,stroke-width:2px,color:#fff;
    classDef server fill:#1c7ed6,stroke:#333,stroke-width:2px,color:#fff;
    classDef client fill:#7048e8,stroke:#333,stroke-width:2px,color:#fff;
    
    class Sanity sanity;
    class Supabase supabase;
    class Queries,Actions server;
    class UI,Zustand,RQ,IDB client;
```

---

## 🔄 2. Protokol Sinkronisasi 3-Tingkat (3-Tier Sync) & Keamanan Multi-Tab

Untuk menjaga zero-latency pada antarmuka visual, mutasi data dilakukan pada keadaan lokal terlebih dahulu, lalu di-debounce asinkron untuk disinkronkan ke awan secara berkelompok.

```mermaid
sequenceDiagram
    autonumber
    actor Pengguna as Siswa (UI)
    participant Zustand as Tier 1: Zustand Store
    participant IDB as IndexedDB (Lokal)
    participant Sync as Tier 2: useSyncProgress (Hook)
    participant Mutation as Tier 3: useCloudMutation (React Query)
    participant Cloud as Supabase (Cloud RPC)
    participant BC as BroadcastChannel (Sinyal Lokal)
    participant Tabs as Tab Aktif Lainnya

    Pengguna->>Zustand: Menyelesaikan kuis / memperoleh XP
    Note over Zustand: Pembaruan instan (< 16ms)<br/>Tambahkan ID kata ke data kotor (Dirty Set)
    Zustand->>IDB: Tulis asinkron via idb-keyval
    Zustand-->>Pengguna: Animasi XP & Lencana langsung aktif (Mulus)

    Note over Sync: Memantau status "Dirty" & memulai Debounce 2000ms
    Sync->>Mutation: Kirim paket data ter-batch (Dirty payload)
    Mutation->>Cloud: Panggil RPC "sync_user_progress" (Enkripsi HTTPS)
    
    alt Sinkronisasi Berhasil
        Cloud-->>Mutation: Respon OK (Accepted XP)
        Mutation->>Zustand: Bersihkan data kotor (clearDirtySrs)
        Mutation->>BC: Siarkan pesan "SYNC_COMPLETE"
        BC-->>Tabs: Terima pesan & Invalidate Cache React Query
        Note over Tabs: Tab lain memperbarui profil tanpa muat ulang halaman
    else Gangguan Jaringan (Offline Mode)
        Cloud--xMutation: Timeout / Gangguan Koneksi
        Note over Mutation,Zustand: Data tetap ditandai "Dirty" di lokal<br/>Retry otomatis 3x (Exponential Backoff)
    end
```

---

## 🧠 3. Pipeline Rendering Furigana & Kamus Popover

Sistem visualisasi teks Jepang NihongoRoute berjalan secara interaktif berdasarkan setelan preferensi furigana global pembelajar.

```mermaid
graph TD
    %% Nodes
    subgraph Store ["UI State Manager"]
        Prefs["readingState Prefs<br/>(Kanji / Furigana / Hiragana)"]
    end

    subgraph Parser ["Smart Parser Engine"]
        SmartJapanese["SmartJapanese Component<br/>(Parser Kanji & Kana)"]
        SplitFurigana["splitFurigana Utility<br/>(Segmentasi Teks Cerdas)"]
    end

    subgraph Visual ["DOM Renderer"]
        Ruby["Ruby DOM Wrapper<br/>(Visual Scale 0.55em rt)"]
    end

    subgraph Interact ["Interactive Lexical Reader"]
        Click["Aksi Klik Pengguna"]
        Popover["WordPopover Component<br/>(Definisi & Audio TTS Luring)"]
        SRSButton["AddToSRSButton<br/>(Mining ke Antrean SRS)"]
    end

    %% Relations
    Prefs -->|Reactive Selector| SmartJapanese
    SmartJapanese -->|Segmentasikan Teks| SplitFurigana
    SplitFurigana -->|Bungkus Ruby & rt| Ruby
    Ruby -->|Deteksi Interaksi| Click
    Click -->|Tampilkan Dialog Detail| Popover
    Popover -->|Tambah ke Flashcard| SRSButton

    %% Styling
    classDef store fill:#ae3ec9,stroke:#333,stroke-width:2px,color:#fff;
    classDef parser fill:#e8590c,stroke:#333,stroke-width:2px,color:#fff;
    classDef visual fill:#0c8599,stroke:#333,stroke-width:2px,color:#fff;
    classDef interact fill:#1098ad,stroke:#333,stroke-width:2px,color:#fff;

    class Prefs store;
    class SmartJapanese,SplitFurigana parser;
    class Ruby visual;
    class Click,Popover,SRSButton interact;
```

---

## 📂 4. Arsitektur Modular Direktori Utama (`src/`)

Peta rute visual dan pembagian domain kode sumber yang diisolasi secara ketat demi kemudahan pengembangan tim (*separation of concerns*).

```mermaid
graph TD
    Root["src/"] --> Actions["actions/<br/>(Server Actions)"]
    Root --> App["app/<br/>(App Router Rute)"]
    Root --> Components["components/<br/>(Komponen Visual UI)"]
    Root --> Hooks["hooks/<br/>(React Hooks Infrastruktur)"]
    Root --> Lib["lib/<br/>(Utilitas Murni Bebas JSX)"]
    Root --> Store["store/<br/>(Zustand Stores Luring)"]
    Root --> Types["types/<br/>(Tipe Data TypeScript)"]

    App --> Main["(main)/<br/>(Bilah Samping & Atas)"]
    App --> API["api/<br/>(API Internal)"]
    App --> Auth["auth/<br/>(Auth Callback)"]
    App --> Studio["studio/<br/>(Sanity CMS Studio)"]

    Main --> Dashboard["dashboard/<br/>(Statistik & Grafik XP)"]
    Main --> Courses["courses/<br/>(Pelajaran & Kuis)"]
    Main --> Exams["exams/<br/>(Simulasi JLPT & JFT)"]
    Main --> Library["library/<br/>(Kamus & Anotasi)"]
    Main --> Review["review/<br/>(Evaluasi SRS)"]
    Main --> Tools["tools/<br/>(Alat Tulis & Canvas)"]

    %% Styling
    classDef root fill:#1971c2,stroke:#333,stroke-width:2px,color:#fff;
    classDef folder fill:#0ca678,stroke:#333,stroke-width:2px,color:#fff;
    classDef route fill:#f59f00,stroke:#333,stroke-width:2px,color:#111;

    class Root root;
    class Actions,App,Components,Hooks,Lib,Store,Types,Main,API,Auth,Studio folder;
    class Dashboard,Courses,Exams,Library,Review,Tools route;
```

---

> [!NOTE]
> Pemetaan visual arsitektur ini disusun agar setiap rekayasawan baru dapat memahami siklus hidup hidrasi data luring-pertama, mekanisme sanitasi keamanan, serta integrasi pemrosesan furigana dalam waktu kurang dari 5 menit.
