# 🌀 Visualisasi Arsitektur Proyek NihongoRoute

Dokumen ini menyajikan representasi visual dari arsitektur proyek NihongoRoute yang memprioritaskan fitur luring (*offline-first*), performa tinggi (< 16ms untuk interaksi lokal), dan sinkronisasi awan yang aman. Seluruh kode sumber berada di dalam direktori `src/`.

---

## 1. Arsitektur Umum & Alur Data Split-Source

NihongoRoute menggunakan pendekatan **Split-Source** untuk memisahkan data editorial statis dengan data dinamis dan data leksikal terstruktur pengguna.

```mermaid
graph TD
    %% Nodes
    subgraph CMS ["Content Management System (Static/Editorial)"]
        Sanity["Sanity CMS<br/>(Lessons, Reading, Listening, Exams)"]
    end

    subgraph CloudDB ["Cloud Database (Dynamic/Lexical)"]
        Supabase["Supabase Database & Auth<br/>(Kanji, Vocab, Grammar, XP, SRS)"]
    end

    subgraph Server ["Next.js Server Side"]
        Actions["Server Actions<br/>(src/actions/*)"]
        Queries["Sanity Queries<br/>(src/lib/queries.ts)"]
    end

    subgraph Client ["Client Side (src/)"]
        Zustand["Zustand Stores<br/>(src/store/*)"]
        RQ["React Query<br/>(src/hooks/useCloudData & useCloudMutation)"]
        IDB["IndexedDB<br/>(Persist via idb-keyval)"]
        UI["Visual UI Components<br/>(< 16ms Interactive)"]
    end

    %% Flows
    Sanity -->|Fetched via| Queries
    Supabase -->|Accessed via| Actions
    
    Queries -->|Promise.all / Paralel| Actions
    Actions -->|Initial Cloud Load| RQ
    RQ -->|Hydrate / Merge| Zustand
    Zustand <-->|Local Persist| IDB
    Zustand <-->|Reactive Selectors| UI
    
    %% Styling
    classDef sanity fill:#f03e3e,stroke:#333,stroke-width:2px,color:#fff;
    classDef supabase fill:#3ecf8e,stroke:#333,stroke-width:2px,color:#fff;
    classDef server fill:#228be6,stroke:#333,stroke-width:2px,color:#fff;
    classDef client fill:#15aabf,stroke:#333,stroke-width:2px,color:#fff;
    
    class Sanity sanity;
    class Supabase supabase;
    class Actions,Queries server;
    class Zustand,RQ,IDB,UI client;
```

---

## 2. Protokol Sinkronisasi 3-Tingkat (3-Tier Sync) & Keamanan Multi-Tab

Untuk menjamin performa *zero-latency* dan keandalan data luring, NihongoRoute menerapkan protokol 3-tingkat dengan sinkronisasi latar belakang yang ter-debound secara otomatis.

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (UI)
    participant Zustand as Tier 1: Zustand Store
    participant IDB as IndexedDB (Lokal)
    participant Sync as Tier 2: useSyncProgress (src/hooks)
    participant Mutation as Tier 3: useCloudMutation (React Query)
    participant Cloud as Supabase (Cloud RPC)
    participant BC as BroadcastChannel (nihongoroute_sync)
    participant Tabs as Tab Peramban Lain

    User->>Zustand: Berinteraksi (e.g. Jawab Kartu SRS, XP bertambah)
    Note over Zustand: Pembaruan Instan (< 16ms)<br/>Tandai data sebagai "Dirty" (dirtySrs / dirtyLessons)
    Zustand->>IDB: Simpan otomatis asinkron
    Zustand-->>User: Tampilan UI langsung ter-update (Mulus)

    Note over Sync: Memantau Zustand secara berkala & melakukan Debounce (2 detik)
    Sync->>Mutation: Kirim paket data "Dirty"
    Mutation->>Cloud: Eksekusi RPC "sync_user_progress"
    
    alt Sinkronisasi Sukses
        Cloud-->>Mutation: Respon OK (Data Tersimpan di Awan)
        Mutation->>Zustand: Hapus penanda "Dirty" (clearDirtySrs / clearDirtyLessons)
        Mutation->>BC: Siarkan pesan "SYNC_COMPLETE"
        BC-->>Tabs: Terima pesan & Invalidate Cache React Query
        Note over Tabs: Data di tab lain tersinkronisasi tanpa muat ulang halaman
    else Terjadi Masalah Jaringan (Luring)
        Cloud--xMutation: Gagal / Timeout
        Note over Mutation,Zustand: Data tetap ditandai "Dirty" di Zustand & IndexedDB<br/>Retry otomatis 3x (exponential backoff)
    end
```

---

## 3. Jalur Rendering & Interaksi Furigana

Sistem rendering teks bahasa Jepang dikelola secara cerdas dan interaktif berdasarkan pengaturan global di `useUIStore`.

```mermaid
graph TD
    subgraph UIStore ["useUIStore (src/store)"]
        ReadingState["readingState<br/>(Kanji / Furigana / Hiragana)"]
    end

    subgraph Rendering ["Smart Rendering System (src/components/ui)"]
        SmartJapanese["SmartJapanese<br/>(Mendeteksi teks Jepang)"]
        FuriganaDisplay["FuriganaDisplay<br/>(Visual Ruby 0.55em)"]
    end

    subgraph Interaction ["Interactive Dictionary"]
        WordPopover["WordPopover<br/>(Pop-up detail kata)"]
        DictionaryQuery["Pencarian Leksikal<br/>(Supabase / IndexedDB)"]
    end

    %% Flows
    ReadingState -->|Mengontrol perilaku| SmartJapanese
    SmartJapanese -->|Membungkus teks| FuriganaDisplay
    FuriganaDisplay -->|Jika diklik| WordPopover
    WordPopover -->|Mencari arti & audio TTS| DictionaryQuery
    
    %% Styling
    classDef store fill:#7950f2,stroke:#333,stroke-width:2px,color:#fff;
    classDef render fill:#ae3ec9,stroke:#333,stroke-width:2px,color:#fff;
    classDef interact fill:#f76707,stroke:#333,stroke-width:2px,color:#fff;
    
    class ReadingState store;
    class SmartJapanese,FuriganaDisplay render;
    class WordPopover,DictionaryQuery interact;
```

---

## 4. Arsitektur Direktori & Struktur Peta Rute (`src/app/`)

Struktur folder NihongoRoute yang diatur secara modular di dalam `src/` untuk memudahkan pemeliharaan dan skalabilitas.

```mermaid
graph TD
    Root["src/"] --> Actions["actions/<br/>(Server Actions)"]
    Root --> App["app/<br/>(App Router)"]
    Root --> Components["components/<br/>(Fitur & UI)"]
    Root --> Hooks["hooks/<br/>(Hooks Global)"]
    Root --> Lib["lib/<br/>(Utilitas Murni)"]
    Root --> Store["store/<br/>(Zustand Stores)"]
    Root --> Types["types/<br/>(Definisi Tipe)"]

    App --> Main["(main)/<br/>(Navigasi Samping & Atas)"]
    App --> Auth["auth/<br/>(Autentikasi)"]
    App --> Onboarding["onboarding/<br/>(Onboarding)"]
    App --> Studio["studio/<br/>(Sanity CMS)"]
    App --> API["api/<br/>(Internal API)"]

    Main --> Courses["courses/<br/>(Katalog)"]
    Main --> Dashboard["dashboard/<br/>(Statistik)"]
    Main --> Exams["exams/<br/>(Ujian JLPT)"]
    Main --> Review["review/<br/>(SRS Review)"]
    Main --> Library["library/<br/>(Perpustakaan)"]
    Main --> Tools["tools/<br/>(Alat Belajar)"]
    Main --> Settings["settings/<br/>(Pengaturan)"]
    Main --> Social["social/<br/>(Papan Peringkat)"]
    
    %% Styling
    classDef root fill:#339af0,stroke:#333,stroke-width:2px,color:#fff;
    classDef folder fill:#20c997,stroke:#333,stroke-width:2px,color:#fff;
    classDef subfolder fill:#fab005,stroke:#333,stroke-width:2px,color:#111;
    
    class Root root;
    class Actions,App,Components,Hooks,Lib,Store,Types,Main,Auth,Onboarding,Studio,API folder;
    class Courses,Dashboard,Exams,Review,Library,Tools,Settings,Social subfolder;
```

---

> [!NOTE]
> Arsitektur ini dirancang untuk memastikan kenyamanan belajar maksimal bagi pengguna Indonesia tanpa adanya hambatan teknis (seperti paywall tersembunyi atau latensi jaringan yang mengganggu) dengan prinsip **Free Access Strategy** dan **Offline-First**.
