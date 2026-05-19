import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";

interface AuthState {
  isAuthenticated: boolean;
  setAuth: (isAuthenticated: boolean) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      setAuth: (isAuthenticated) => set({ isAuthenticated }),
      resetAuth: () => set({ isAuthenticated: false }),
    }),
    {
      name: "nihongoroute_auth_data",
      storage: createJSONStorage(() => ({
        getItem: async (name) => (await get(name)) ?? null,
        setItem: async (name, value) => await idbSet(name, value),
        removeItem: async (name) => await del(name),
      })),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
