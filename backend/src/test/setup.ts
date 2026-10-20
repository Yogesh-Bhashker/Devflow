import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.test if it exists (local dev)
// In CI, env vars are set directly via GitHub Actions
const envTestPath = path.resolve(__dirname, "../../.env.test");
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath, override: true });
}

import { beforeAll, afterAll, beforeEach } from "vitest";

beforeAll(async () => {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl.includes("devflow_test")) {
    throw new Error(
      `Tests must run against devflow_test DB, got: ${dbUrl.replace(/:[^:@]*@/, ":***@")}`
    );
  }
});

beforeEach(async () => {
  const { cleanDatabase } = await import("./utils");
  await cleanDatabase();
});

afterAll(async () => {
  const { default: prisma } = await import("../lib/prisma");
  await prisma.$disconnect();
});