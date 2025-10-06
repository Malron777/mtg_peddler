import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    hookTimeout: 60000, // 60 seconds for slow computers
    testTimeout: 30000, // 30 seconds for individual tests
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
