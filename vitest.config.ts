import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["__tests__/**/*.test.{ts,tsx}"],
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
