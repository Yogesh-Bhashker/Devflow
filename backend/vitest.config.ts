import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 15000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // This is the key: Vitest loads this env file BEFORE any test file or setup
    env: {
      NODE_ENV: "test",
    },
  },
});