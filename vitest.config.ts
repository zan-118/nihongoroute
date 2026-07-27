import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      thresholds: {
        statements: 35,
        branches: 20,
        functions: 35,
        lines: 35,
      },
    },
    alias: [
      {
        find: /^\@\/lib\/(.+)$/,
        replacement: "$1",
        customResolver(source) {
          const fs = require("fs");
          const subfolders = ["audio", "japanese", "gamification", "learning", "tools", "core"];
          for (const sub of subfolders) {
            const targetPath = path.resolve(__dirname, `./src/lib/${sub}/${source}`);
            if (fs.existsSync(targetPath + ".ts")) {
              return (targetPath + ".ts").replace(/\\/g, "/");
            }
            if (fs.existsSync(targetPath + ".tsx")) {
              return (targetPath + ".tsx").replace(/\\/g, "/");
            }
            if (fs.existsSync(targetPath + "/index.ts")) {
              return (targetPath + "/index.ts").replace(/\\/g, "/");
            }
            if (fs.existsSync(targetPath + "/index.tsx")) {
              return (targetPath + "/index.tsx").replace(/\\/g, "/");
            }
          }
          
          const rootPath = path.resolve(__dirname, `./src/lib/${source}`);
          if (fs.existsSync(rootPath + ".ts")) {
            return (rootPath + ".ts").replace(/\\/g, "/");
          }
          if (fs.existsSync(rootPath + ".tsx")) {
            return (rootPath + ".tsx").replace(/\\/g, "/");
          }
          return rootPath.replace(/\\/g, "/");
        }
      },
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src")
      }
    ],
  },
});
