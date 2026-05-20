import { vi } from "vitest";

// Mock idb-keyval globally for all Vitest tests
vi.mock("idb-keyval", () => {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) || null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});
