# Frontend System Audit Report - NihongoRoute

## 🔥 Critical Issues
*(must fix before scaling)*

**1. Performance Catastrophe in `useProgressStore` Facade**
*   **Location:** `store/useProgressStore.ts` (Lines 22-40)
*   **The Issue:** To maintain backward compatibility, the facade calls `useAuthStore()`, `useUserStore()`, `useSRSStore()`, and `useUIStore()` at the top level of the hook, combines them into a massive object, and *then* applies the component's selector.
*   **Why it's critical:** Because the hook consumes all 4 stores, **any** update to **any** store (like the ticking of the `isSyncing` boolean or adding a notification) causes the hook to evaluate as "changed". This breaks Zustand's atomic selector optimization, causing a global DOM re-render storm across the entire app for totally unrelated components.

**2. State Fragmentation (`daily.ts` vs Backend)**
*   **Location:** `lib/daily.ts`
*   **The Issue:** Daily missions are stored entirely in `localStorage` under `nihongo-daily` and bypass Zustand and the Supabase RPC entirely.
*   **Why it's critical:** If a user completes a daily mission, they get +100 XP locally. Because the server strictly controls XP now (via `sync_user_progress`), the server will perceive this as an anomalous delta, clamp it, and forcefully revert the user's XP on the next sync. The user loses their daily reward visually (rubber-banding).

---

## ⚠️ Medium Issues
*(affect UX or maintainability)*

**1. Sync Awareness is Visually Present but Logically Ignored**
*   **Location:** `components/features/srs/review/SRSReviewEngine.tsx`
*   **The Issue:** `isSyncing` and `hasPendingSync` are beautifully displayed in the `Topbar`, but the actual flashcard engine ignores them.
*   **Why it's a problem:** A user can rapid-fire answer 5 cards while a sync mutation is actively in flight. This creates a race condition where the `dirtySrs` queue mutates while TanStack is trying to serialize it, potentially dropping the newest card answers from the payload. The "Answer" buttons should ideally disable or queue during `isSyncing === true`.

**2. Component Coupling (God Components)**
*   **Location:** `app/(main)/library/grammar/GrammarClient.tsx`
*   **The Issue:** This 213-line file mixes raw Sanity GROQ fetching logic, local state filtering (`selectedLevel`, `searchTerm`), and a massive DOM tree with heavy `framer-motion` animations. 
*   **Why it's a problem:** Logic is mixed heavily with UI. It makes testing the search logic impossible without mounting the full animated DOM. The Sanity fetch logic should be abstracted into a custom hook (e.g., `useGrammarArticles()`).

**3. Duplicated Auth Parsing Logic**
*   **Location:** `components/providers/ProgressProvider.tsx`
*   **The Issue:** The fallback chain `session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Siswa"` is copy-pasted identically across both the `useEffect` initial load and the `onAuthStateChange` listener.

---

## 💡 Improvements
*(optional but valuable)*

**1. Preventative Sync Locking:**
Instead of a native, ugly `beforeunload` browser prompt (`ProgressProvider` line 66), use a generic blocking modal if the user clicks a Next.js `<Link>` to navigate away while `hasPendingSync` is true. Native before-unload only catches closing the tab, not internal SPA routing.

**2. Animation Thrashing in Search Lists:**
*   **Location:** `app/(main)/library/grammar/GrammarClient.tsx`
*   **The Issue:** Using `AnimatePresence` with `mode="popLayout"` on a list of 50+ articles while the user types in the `searchTerm` input causes massive layout recalculations on every keystroke. 
*   **Fix:** Add `useDeferredValue(searchTerm)` to decouple the input typing speed from the expensive framer-motion list re-rendering.

---

## 📊 SCORES (0–10)

*   **Architecture: 6.5 / 10** 
    *(The backend is solid, but the frontend relies heavily on a deprecated, performance-destroying Facade pattern and mixes data-fetching tightly into UI components).*
*   **State Management: 5.0 / 10** 
    *(Zustand and React Query are conflicting. `daily.ts` is rogue in `localStorage`. The facade destroys selector optimization).*
*   **UX Quality: 8.5 / 10** 
    *(Visually stunning, responsive, and sync indicators are premium. Rubber-banding on XP is the only major flaw).*
*   **Performance: 5.5 / 10** 
    *(Massive global re-renders due to `useProgressStore`. Typing lag possible in grammar searches due to synchronous animations).*
