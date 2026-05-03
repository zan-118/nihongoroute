import { MasterCardData } from "@/components/features/flashcards/master/types";

const CACHE_KEY = "nihongoroute_card_cache";

export const offlineCache = {
  saveCards: (cards: MasterCardData[]) => {
    try {
      const existingStr = localStorage.getItem(CACHE_KEY);
      const existing = existingStr ? JSON.parse(existingStr) : {};
      
      cards.forEach(card => {
        if (card._id) {
          existing[card._id] = {
            ...card,
            cachedAt: Date.now()
          };
        }
      });

      localStorage.setItem(CACHE_KEY, JSON.stringify(existing));
    } catch (e) {
      console.error("Gagal menyimpan cache offline:", e);
    }
  },

  getCards: (ids: string[]): MasterCardData[] => {
    try {
      const existingStr = localStorage.getItem(CACHE_KEY);
      if (!existingStr) return [];
      
      const existing = JSON.parse(existingStr);
      return ids
        .map(id => existing[id])
        .filter(Boolean) as MasterCardData[];
    } catch (e) {
      console.error("Gagal mengambil cache offline:", e);
      return [];
    }
  }
};
